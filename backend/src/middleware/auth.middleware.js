import jwt from "jsonwebtoken"
import User from "../models/User.model.js"

export const protect = async (req, res, next) => {
  try {
    let token

    // Check for token in header or cookies
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    } else if (req.cookies?.token) {
      token = req.cookies.token
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from token
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    })
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "User role is not authorized to access this route",
      })
    }
    next()
  }
}

export const requireApproval = (req, res, next) => {
  if (!req.user.isApproved && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Your account is pending approval",
    })
  }
  next()
}
