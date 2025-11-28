import User from "../models/User.model.js"
import { sendTokenResponse } from "../utils/generateToken.js"
import crypto from "crypto"
import { sendEmail } from "../utils/sendEmail.js";
import { otpEmailTemplate } from "../utils/otpTemplate.js";
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
// @desc    Send OTP for password reset
// <CHANGE> Ensure OTP is stored as string
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with that email",
      });
    }

    // Generate OTP and explicitly store as string
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log("[DEBUG] Generated OTP:", otp); // Remove in production
    
    user.resetPasswordOTP = otp; // Already a string from .toString()
    user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail(
        user.email,
        "Your Password Reset OTP",
        otpEmailTemplate(user.firstName + " " + user.lastName, otp)
      );
      
      console.log("[DEBUG] OTP email sent successfully"); // Remove in production
      
      return res.status(200).json({
        success: true,
        message: "OTP sent successfully to your email",
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message, // Remove in production
    });
  }
};
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
}// CORRECTED verifyOtpAndResetPassword function
export const verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // <CHANGE> Added validation for all required fields
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    // <CHANGE> Clean inputs consistently
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim(); // Convert to string first, then trim

    console.log("[DEBUG] Verifying OTP for email:", cleanEmail);
    console.log("[DEBUG] OTP provided:", cleanOtp);

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No user found with this email",
      });
    }

    console.log("[DEBUG] User found. Stored OTP:", user.resetPasswordOTP);
    console.log("[DEBUG] OTP Expiry:", user.resetPasswordOTPExpire, "Current time:", Date.now());

    // <CHANGE> Check if OTP exists first
    if (!user.resetPasswordOTP) {
      return res.status(400).json({
        success: false,
        message: "No OTP requested. Please request a new OTP.",
      });
    }

    // <CHANGE> Check expiry before comparing OTP
    if (user.resetPasswordOTPExpire < Date.now()) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // <CHANGE> Compare OTP as strings
    const storedOtp = user.resetPasswordOTP.toString().trim();
    if (cleanOtp !== storedOtp) {
      console.log("[DEBUG] OTP mismatch. Expected:", storedOtp, "Got:", cleanOtp);
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    console.log("[DEBUG] OTP verified successfully!");

    // Success! Reset password
    user.passwordHash = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("[ERROR] OTP verification failed:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message, // Remove in production
    });
  }
};