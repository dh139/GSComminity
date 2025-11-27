import User from "../models/User.model.js"
import { uploadToCloudinary } from "../config/cloudinary.js"

// @desc    Get all users
// @route   GET /api/users
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query

    const query = { isApproved: true }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { sabhasadNo: { $regex: search, $options: "i" } },
      ]
    }

    const users = await User.find(query)
      .select("-passwordHash")
      .skip((page - 1) * limit)
      .limit(Number.parseInt(limit))
      .sort({ createdAt: -1 })

    const total = await User.countDocuments(query)

    res.status(200).json({
      success: true,
      users,
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

// @desc    Get user by ID
// @route   GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-passwordHash")
      .populate("spouse", "firstName lastName sabhasadNo profilePhoto")
      .populate("parents", "firstName lastName sabhasadNo profilePhoto")
      .populate("children", "firstName lastName sabhasadNo profilePhoto")
      .populate("familyTreeId")

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

// @desc    Get user by Sabhasad number
// @route   GET /api/users/by-sabhasad/:sabhasadNo
export const getUserBySabhasad = async (req, res) => {
  try {
    const user = await User.findOne({ sabhasadNo: req.params.sabhasadNo })
      .select("-passwordHash")
      .populate("spouse", "firstName lastName sabhasadNo profilePhoto")
      .populate("parents", "firstName lastName sabhasadNo profilePhoto")
      .populate("children", "firstName lastName sabhasadNo profilePhoto")

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

// @desc    Update current user profile
// @route   PUT /api/users/me
export const updateMe = async (req, res) => {
  try {
    const allowedUpdates = [
      "firstName",
      "lastName",
      "mobile",
      "email",
      "dob",
      "address",
      "education",
      "occupation",
      "gender",
      "bio", // added bio to allowed updates
    ]

    const updates = {}
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key]
      }
    })

    if (req.body.profilePhoto && req.body.profilePhoto.startsWith("data:image")) {
      try {
        const result = await uploadToCloudinary(req.body.profilePhoto, "gajjar-samaj/profiles")
        updates.profilePhoto = result.url
      } catch (uploadError) {
        console.error("Photo upload error:", uploadError)
        return res.status(400).json({
          success: false,
          message: "Failed to upload profile photo",
        })
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select(
      "-passwordHash",
    )

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

// @desc    Upload profile photo
// @route   POST /api/users/:id/upload-photo
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      })
    }

    // Check if user is updating their own photo or admin
    if (req.params.id !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this profile",
      })
    }

    // Convert buffer to base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`

    const result = await uploadToCloudinary(base64Image, "gajjar-samaj/profiles")

    const user = await User.findByIdAndUpdate(req.params.id, { profilePhoto: result.url }, { new: true }).select(
      "-passwordHash",
    )

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
