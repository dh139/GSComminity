import User from "../models/User.model.js"
import { sendTokenResponse } from "../utils/generateToken.js"
import crypto from "crypto"

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { sabhasadNo, firstName, lastName, gender, mobile, email, dob, address, education, occupation, password,profilePhoto } =
      req.body

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ sabhasadNo }, { email }],
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this Sabhasad number or email already exists",
      })
    }

    const user = await User.create({
      sabhasadNo,
      firstName,
      lastName,
      gender,
      mobile,
      email,
      dob,
      address,
      education,
      occupation,
      passwordHash: password,
      isApproved: false,
      profilePhoto: profilePhoto || "", 
    })

    sendTokenResponse(user, 201, res)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { sabhasadNo, password } = req.body

    if (!sabhasadNo || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide Sabhasad number and password",
      })
    }

    const user = await User.findOne({ sabhasadNo }).select("+passwordHash")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    sendTokenResponse(user, 200, res)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  })
}

// @desc    Get current user
// @route   GET /api/auth/me
// In auth controller
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-passwordHash") // Only exclude password
      .populate("spouse", "firstName lastName sabhasadNo")
      .populate("parents", "firstName lastName sabhasadNo")
      .populate("children", "firstName lastName sabhasadNo")

    // Convert to plain object and clean
    const userObj = user.toObject()
    delete userObj.passwordHash
    delete userObj.__v

    res.status(200).json({
      success: true,
      user: userObj,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with that email",
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex")

    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000 // 10 minutes

    await user.save({ validateBeforeSave: false })

    // In production, send email with reset URL
    // For now, return the token
    res.status(200).json({
      success: true,
      message: "Password reset token generated",
      resetToken, // Remove this in production
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Reset password
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash("sha256").update(req.body.token).digest("hex")

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      })
    }

    user.passwordHash = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    sendTokenResponse(user, 200, res)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
