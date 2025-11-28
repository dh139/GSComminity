import express from "express"
import { register, login, logout, getMe, forgotPassword, resetPassword ,verifyOtpAndResetPassword} from "../controllers/auth.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/me", protect, getMe)
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp-reset", verifyOtpAndResetPassword); // New route
export default router
