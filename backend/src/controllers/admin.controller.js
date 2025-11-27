import User from "../models/User.model.js"
import Post from "../models/Post.model.js"
import Event from "../models/Event.model.js"

// @desc    Get pending approvals
// @route   GET /api/admin/pending-approvals
export const getPendingApprovals = async (req, res) => {
  try {
    const pendingUsers = await User.find({ isApproved: false }).select("-passwordHash").sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      users: pendingUsers,
      count: pendingUsers.length,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Approve user
// @route   PUT /api/admin/approve-user/:id
export const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true }).select(
      "-passwordHash",
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Delete user
// @route   DELETE /api/admin/delete-user/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Don't allow deleting admin
    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete admin user",
      })
    }

    await user.deleteOne()

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get admin stats
// @route   GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const pendingApprovals = await User.countDocuments({ isApproved: false })
    const totalPosts = await Post.countDocuments()
    const totalEvents = await Event.countDocuments()
    const upcomingEvents = await Event.countDocuments({ eventDate: { $gte: new Date() } })

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        pendingApprovals,
        totalPosts,
        totalEvents,
        upcomingEvents,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get reported posts
// @route   GET /api/admin/reported-posts
export const getReportedPosts = async (req, res) => {
  try {
    const reportedPosts = await Post.find({ isReported: true })
      .populate("userId", "firstName lastName sabhasadNo")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      posts: reportedPosts,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Delete post (admin)
// @route   DELETE /api/admin/posts/:id
export const deletePostAdmin = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
// @desc    Get all users
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      users,
      count: users.length,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body

    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-passwordHash")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}