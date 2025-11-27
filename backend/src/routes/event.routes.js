import express from "express"
import { createEvent, getEvents, getEventById, registerForEvent, deleteEvent } from "../controllers/event.controller.js"
import { protect, authorize, requireApproval } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/", protect, authorize("admin"), createEvent)
router.get("/", protect, getEvents)
router.get("/:id", protect, getEventById)
router.post("/:id/register", protect, requireApproval, registerForEvent)
router.delete("/:id", protect, authorize("admin"), deleteEvent)

export default router
