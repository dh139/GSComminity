import express from "express"
import {
  createFamilyTree,
  getFamilyTree,
  getAllFamilyTrees,
  addMember,
  updateMember,
  removeMember,
  linkUser,
  getMyTree,
  getUserTree,
} from "../controllers/familyTree.controller.js"
import { protect, requireApproval } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/", protect, requireApproval, createFamilyTree)
router.get("/", protect, getAllFamilyTrees)
router.get("/my-tree", protect, getMyTree)
router.get("/user/:userId", protect, getUserTree)
router.get("/:id", protect, getFamilyTree)
router.post("/:id/add-member", protect, requireApproval, addMember)
router.put("/:id/update-member/:memberId", protect, requireApproval, updateMember)
router.delete("/:id/remove-member/:memberId", protect, requireApproval, removeMember)
router.post("/:id/link-user", protect, requireApproval, linkUser)

export default router
