// utils/generateToken.js
import jwt from "jsonwebtoken"

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  })
}

export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id)

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  }

  // Convert Mongoose doc to plain object and remove sensitive fields
  const userObj = user.toObject ? user.toObject() : { ...user }

  // Remove sensitive fields
  delete userObj.passwordHash
  delete userObj.resetPasswordToken
  delete userObj.resetPasswordExpire
  delete userObj.__v

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user: userObj, // NOW SENDS ALL FIELDS: mobile, dob, address, education, etc.
    })
}