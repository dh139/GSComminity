import FamilyTree from "../models/FamilyTree.model.js"
import User from "../models/User.model.js"
import { v2 as cloudinary } from "cloudinary"

// Generate unique temp ID
const generateTempId = () => {
  return `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// @desc    Get current user's family tree
// @route   GET /api/familytrees/my-tree
export const getMyTree = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    let familyTree = null

    if (user.familyTreeId) {
      familyTree = await FamilyTree.findById(user.familyTreeId)
        .populate("createdBy", "firstName lastName sabhasadNo")
        .populate("members.userId", "firstName lastName sabhasadNo profilePhoto")
    }

    if (!familyTree) {
      familyTree = await FamilyTree.findOne({ createdBy: req.user._id })
        .populate("createdBy", "firstName lastName sabhasadNo")
        .populate("members.userId", "firstName lastName sabhasadNo profilePhoto")
    }

    if (!familyTree) {
      return res.status(404).json({
        success: false,
        message: "Family tree not found",
      })
    }

    res.status(200).json({
      success: true,
      familyTree,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get family tree by user ID
// @route   GET /api/familytrees/user/:userId
export const getUserTree = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    let familyTree = null

    if (user.familyTreeId) {
      familyTree = await FamilyTree.findById(user.familyTreeId)
        .populate("createdBy", "firstName lastName sabhasadNo")
        .populate("members.userId", "firstName lastName sabhasadNo profilePhoto")
    }

    if (!familyTree) {
      familyTree = await FamilyTree.findOne({ createdBy: req.params.userId })
        .populate("createdBy", "firstName lastName sabhasadNo")
        .populate("members.userId", "firstName lastName sabhasadNo profilePhoto")
    }

    if (!familyTree) {
      return res.status(404).json({
        success: false,
        message: "This user has not created a family tree yet",
      })
    }

    // Check visibility
    if (familyTree.visibility === "members-only" && familyTree.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "This family tree is private",
      })
    }

    res.status(200).json({
      success: true,
      familyTree,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Create family tree
// @route   POST /api/familytrees
export const createFamilyTree = async (req, res) => {
  try {
    const { familyName, visibility } = req.body

    // Create self as first member
    const selfMember = {
      userId: req.user._id,
      tempId: generateTempId(),
      name: `${req.user.firstName} ${req.user.lastName}`,
      relation: "self",
      gender: req.user.gender || "other",
      dob: req.user.dob,
      education: req.user.education,
      occupation: req.user.occupation,
      photoUrl: req.user.profilePhoto,
      parents: [],
      children: [],
      spouse: null,
      siblings: [], // Initialize siblings array
    }

    const familyTree = await FamilyTree.create({
      familyName,
      familyHead: selfMember.tempId,
      members: [selfMember],
      visibility: visibility || "public",
      createdBy: req.user._id,
    })

    await User.findByIdAndUpdate(req.user._id, {
      familyTreeId: familyTree._id,
    })

    res.status(201).json({
      success: true,
      familyTree,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get family tree by ID
// @route   GET /api/familytrees/:id
export const getFamilyTree = async (req, res) => {
  try {
    const familyTree = await FamilyTree.findById(req.params.id)
      .populate("createdBy", "firstName lastName sabhasadNo")
      .populate("members.userId", "firstName lastName sabhasadNo profilePhoto")

    if (!familyTree) {
      return res.status(404).json({
        success: false,
        message: "Family tree not found",
      })
    }

    res.status(200).json({
      success: true,
      familyTree,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get all family trees
// @route   GET /api/familytrees
export const getAllFamilyTrees = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const familyTrees = await FamilyTree.find({ visibility: "public" })
      .populate("createdBy", "firstName lastName sabhasadNo")
      .skip((page - 1) * limit)
      .limit(Number.parseInt(limit))
      .sort({ createdAt: -1 })

    const total = await FamilyTree.countDocuments({ visibility: "public" })

    res.status(200).json({
      success: true,
      familyTrees,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Add member to family tree
// @route   POST /api/familytrees/:id/add-member
export const addMember = async (req, res) => {
  try {
    const familyTree = await FamilyTree.findById(req.params.id)

    if (!familyTree) {
      return res.status(404).json({
        success: false,
        message: "Family tree not found",
      })
    }

    if (familyTree.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this family tree",
      })
    }

    const { name, relation, gender, dob, education, occupation, photo, relatedTo } = req.body

    let photoUrl = null
    if (photo && photo.startsWith("data:image")) {
      try {
        const uploadResult = await cloudinary.uploader.upload(photo, {
          folder: "family-tree-members",
          transformation: [{ width: 300, height: 300, crop: "fill", gravity: "face" }],
        })
        photoUrl = uploadResult.secure_url
      } catch (uploadError) {
        console.error("Photo upload failed:", uploadError)
      }
    }

    const newMember = {
      tempId: generateTempId(),
      name,
      relation,
      gender,
      dob,
      education,
      occupation,
      photoUrl,
      parents: [],
      children: [],
      spouse: null,
      siblings: [],
    }

    const relatedMemberIndex = relatedTo ? familyTree.members.findIndex((m) => m.tempId === relatedTo) : -1
    const relatedMember = relatedMemberIndex !== -1 ? familyTree.members[relatedMemberIndex] : null

    if (relation === "self") {
      familyTree.familyHead = newMember.tempId
    } else if (relation === "spouse") {
      if (relatedMember) {
        newMember.spouse = relatedTo
        familyTree.members[relatedMemberIndex].spouse = newMember.tempId
        newMember.children = [...relatedMember.children]
      }
    } else if (relation === "father" || relation === "mother") {
      if (relatedMember) {
        newMember.children.push(relatedTo)
        familyTree.members[relatedMemberIndex].parents.push(newMember.tempId)

        if (relatedMember.siblings && relatedMember.siblings.length > 0) {
          relatedMember.siblings.forEach((siblingId) => {
            if (!newMember.children.includes(siblingId)) {
              newMember.children.push(siblingId)
            }
            const siblingIndex = familyTree.members.findIndex((m) => m.tempId === siblingId)
            if (siblingIndex !== -1 && !familyTree.members[siblingIndex].parents.includes(newMember.tempId)) {
              familyTree.members[siblingIndex].parents.push(newMember.tempId)
            }
          })
        }

        if (relatedMember.spouse) {
          const spouseIndex = familyTree.members.findIndex((m) => m.tempId === relatedMember.spouse)
          if (spouseIndex !== -1 && !familyTree.members[spouseIndex].parents.includes(newMember.tempId)) {
            familyTree.members[spouseIndex].parents.push(newMember.tempId)
          }
        }
      }
    } else if (relation === "son" || relation === "daughter") {
      if (relatedMember) {
        newMember.parents.push(relatedTo)
        familyTree.members[relatedMemberIndex].children.push(newMember.tempId)

        if (relatedMember.spouse) {
          newMember.parents.push(relatedMember.spouse)
          const spouseIndex = familyTree.members.findIndex((m) => m.tempId === relatedMember.spouse)
          if (spouseIndex !== -1) {
            familyTree.members[spouseIndex].children.push(newMember.tempId)
          }
        }
      }
    } else if (relation === "brother" || relation === "sister") {
      if (relatedMember) {
        newMember.siblings.push(relatedTo)
        if (!familyTree.members[relatedMemberIndex].siblings) {
          familyTree.members[relatedMemberIndex].siblings = []
        }
        familyTree.members[relatedMemberIndex].siblings.push(newMember.tempId)

        if (relatedMember.siblings && relatedMember.siblings.length > 0) {
          relatedMember.siblings.forEach((existingSiblingId) => {
            if (existingSiblingId !== newMember.tempId) {
              newMember.siblings.push(existingSiblingId)
              const existingSiblingIndex = familyTree.members.findIndex((m) => m.tempId === existingSiblingId)
              if (existingSiblingIndex !== -1) {
                if (!familyTree.members[existingSiblingIndex].siblings) {
                  familyTree.members[existingSiblingIndex].siblings = []
                }
                familyTree.members[existingSiblingIndex].siblings.push(newMember.tempId)
              }
            }
          })
        }

        if (relatedMember.parents && relatedMember.parents.length > 0) {
          newMember.parents = [...relatedMember.parents]

          relatedMember.parents.forEach((parentId) => {
            const parentIndex = familyTree.members.findIndex((m) => m.tempId === parentId)
            if (parentIndex !== -1) {
              familyTree.members[parentIndex].children.push(newMember.tempId)
            }
          })
        }
      }
    }

    familyTree.members.push(newMember)
    await familyTree.save()

    res.status(201).json({
      success: true,
      familyTree,
      newMember,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Update member in family tree
// @route   PUT /api/familytrees/:id/update-member/:memberId
export const updateMember = async (req, res) => {
  try {
    const familyTree = await FamilyTree.findById(req.params.id)

    if (!familyTree) {
      return res.status(404).json({
        success: false,
        message: "Family tree not found",
      })
    }

    if (familyTree.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this family tree",
      })
    }

    const memberIndex = familyTree.members.findIndex((m) => m.tempId === req.params.memberId)

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      })
    }

    const allowedUpdates = ["name", "relation", "gender", "dob", "education", "occupation", "photoUrl"]

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        familyTree.members[memberIndex][field] = req.body[field]
      }
    })

    await familyTree.save()

    res.status(200).json({
      success: true,
      familyTree,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Remove member from family tree
// @route   DELETE /api/familytrees/:id/remove-member/:memberId
export const removeMember = async (req, res) => {
  try {
    const familyTree = await FamilyTree.findById(req.params.id)

    if (!familyTree) {
      return res.status(404).json({
        success: false,
        message: "Family tree not found",
      })
    }

    if (familyTree.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this family tree",
      })
    }

    const memberId = req.params.memberId

    const member = familyTree.members.find((m) => m.tempId === memberId)
    if (member && member.relation === "self") {
      return res.status(400).json({
        success: false,
        message: "Cannot remove yourself from the tree",
      })
    }

    familyTree.members = familyTree.members.map((m) => {
      m.children = m.children.filter((c) => c !== memberId)
      m.parents = m.parents.filter((p) => p !== memberId)
      if (m.spouse === memberId) m.spouse = null
      return m
    })

    familyTree.members = familyTree.members.filter((m) => m.tempId !== memberId)

    await familyTree.save()

    res.status(200).json({
      success: true,
      familyTree,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Link existing user to family tree member
// @route   POST /api/familytrees/:id/link-user
export const linkUser = async (req, res) => {
  try {
    const { memberId, userId } = req.body

    const familyTree = await FamilyTree.findById(req.params.id)

    if (!familyTree) {
      return res.status(404).json({
        success: false,
        message: "Family tree not found",
      })
    }

    if (familyTree.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this family tree",
      })
    }

    const memberIndex = familyTree.members.findIndex((m) => m.tempId === memberId)

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      })
    }

    familyTree.members[memberIndex].userId = userId
    await familyTree.save()

    await User.findByIdAndUpdate(userId, {
      familyTreeId: familyTree._id,
    })

    res.status(200).json({
      success: true,
      familyTree,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
