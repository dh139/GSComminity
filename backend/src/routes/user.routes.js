import express from "express"
import { getUsers, getUserById, getUserBySabhasad, updateMe, uploadPhoto } from "../controllers/user.controller.js"
import { protect } from "../middleware/auth.middleware.js"
import { upload } from "../middleware/upload.middleware.js"

const router = express.Router()

router.get("/", protect, getUsers)
router.get("/:id", protect, getUserById)
router.get("/by-sabhasad/:sabhasadNo", protect, getUserBySabhasad)
router.put("/me", protect, updateMe)
router.post("/:id/upload-photo", protect, upload.single("photo"), uploadPhoto)

export default router
