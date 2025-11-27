import Event from "../models/Event.model.js"
import { uploadToCloudinary } from "../config/cloudinary.js"

// @desc    Create event
// @route   POST /api/events
export const createEvent = async (req, res) => {
  try {
    const { title, description, location, eventDate, bannerImage, registrationOpen } = req.body

    let bannerUrl = ""

    if (bannerImage) {
      const result = await uploadToCloudinary(bannerImage, "gajjar-samaj/events")
      bannerUrl = result.url
    }

    const event = await Event.create({
      title,
      description,
      location,
      eventDate,
      bannerUrl,
      registrationOpen: registrationOpen !== false,
      createdBy: req.user._id,
    })

    res.status(201).json({
      success: true,
      event,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get all events
// @route   GET /api/events
export const getEvents = async (req, res) => {
  try {
    const { upcoming } = req.query

    const query = {}

    if (upcoming === "true") {
      query.eventDate = { $gte: new Date() }
    }

    const events = await Event.find(query).populate("createdBy", "firstName lastName").sort({ eventDate: 1 })

    res.status(200).json({
      success: true,
      events,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get event by ID
// @route   GET /api/events/:id
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "firstName lastName")
      .populate("registrations.userId", "firstName lastName sabhasadNo")

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      })
    }

    res.status(200).json({
      success: true,
      event,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Register for event
// @route   POST /api/events/:id/register
export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      })
    }

    if (!event.registrationOpen) {
      return res.status(400).json({
        success: false,
        message: "Registration is closed for this event",
      })
    }

    const { registrantName, relationToUser, studentClass, schoolName, percentage, formData } = req.body

    event.registrations.push({
      eventId: event._id,
      userId: req.user?._id,
      registrantName,
      relationToUser,
      studentClass,
      schoolName,
      percentage,
      formData,
    })

    await event.save()

    res.status(201).json({
      success: true,
      message: "Successfully registered for event",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Delete event
// @route   DELETE /api/events/:id
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      })
    }

    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this event",
      })
    }

    await event.deleteOne()

    res.status(200).json({
      success: true,
      message: "Event deleted",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
