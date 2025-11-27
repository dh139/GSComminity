import Post from "../models/Post.model.js"
import { uploadToCloudinary } from "../config/cloudinary.js"

// @desc    Create post
// @route   POST /api/posts
export const createPost = async (req, res) => {
  try {
    const { caption, tags, images } = req.body

    const imageUrls = []

    // Handle base64 images
    if (images && images.length > 0) {
      for (const image of images) {
        const result = await uploadToCloudinary(image, "gajjar-samaj/posts")
        imageUrls.push(result.url)
      }
    }

    const post = await Post.create({
      userId: req.user._id,
      imageUrls,
      caption,
      tags: tags || [],
    })

    await post.populate("userId", "firstName lastName profilePhoto sabhasadNo")

    res.status(201).json({
      success: true,
      post,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get all posts
// @route   GET /api/posts
export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const posts = await Post.find({ isReported: false })
      .populate("userId", "firstName lastName profilePhoto sabhasadNo")
      .populate("comments.userId", "firstName lastName profilePhoto")
      .skip((page - 1) * limit)
      .limit(Number.parseInt(limit))
      .sort({ createdAt: -1 })

    const total = await Post.countDocuments({ isReported: false })

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get post by ID
// @route   GET /api/posts/:id
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("userId", "firstName lastName profilePhoto sabhasadNo")
      .populate("comments.userId", "firstName lastName profilePhoto")
      .populate("likes", "firstName lastName")

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    res.status(200).json({
      success: true,
      post,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Like/Unlike post
// @route   PUT /api/posts/:id/like
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    const likeIndex = post.likes.indexOf(req.user._id)

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1)
    } else {
      // Like
      post.likes.push(req.user._id)
    }

    await post.save()

    res.status(200).json({
      success: true,
      liked: likeIndex === -1,
      likesCount: post.likes.length,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    post.comments.push({
      userId: req.user._id,
      text: req.body.text,
    })

    await post.save()
    await post.populate("comments.userId", "firstName lastName profilePhoto")

    res.status(201).json({
      success: true,
      comments: post.comments,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Delete post
// @route   DELETE /api/posts/:id
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    // Check if user owns the post or is admin
    if (post.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      })
    }

    await post.deleteOne()

    res.status(200).json({
      success: true,
      message: "Post deleted",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
