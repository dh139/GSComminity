import express from "express"
import {
  getPendingApprovals,
  approveUser,
  deleteUser,
  getStats,
  getReportedPosts,
  deletePostAdmin,
   getAllUsers,        // Add this
  updateUserRole,
} from "../controllers/admin.controller.js"
import { protect, authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

// All routes require admin role
router.use(protect)
router.use(authorize("admin"))

router.get("/pending-approvals", getPendingApprovals)
router.put("/approve-user/:id", approveUser)
router.delete("/delete-user/:id", deleteUser)
router.get("/stats", getStats)
router.get("/reported-posts", getReportedPosts)
router.delete("/posts/:id", deletePostAdmin)
router.get("/users", getAllUsers)                    // Add this
router.put("/users/:id/role", updateUserRole)        // Add this

export default router
