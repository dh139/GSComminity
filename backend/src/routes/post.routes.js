import express from "express"
import {
  createPost,
  getPosts,
  getPostById,
  toggleLike,
  addComment,
  deletePost,
} from "../controllers/post.controller.js"
import { protect, requireApproval } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/", protect, requireApproval, createPost)
router.get("/", protect, getPosts)
router.get("/:id", protect, getPostById)
router.put("/:id/like", protect, requireApproval, toggleLike)
router.post("/:id/comment", protect, requireApproval, addComment)
router.delete("/:id", protect, deletePost)

export default router
