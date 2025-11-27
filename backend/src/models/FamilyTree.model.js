import mongoose from "mongoose"

const memberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  tempId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  relation: {
    type: String,
    enum: ["self", "father", "mother", "son", "daughter", "grandfather", "grandmother", "spouse", "brother", "sister"],
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  dob: Date,
  education: String,
  occupation: String,
  photoUrl: String,
  parents: [String], // tempId references
  children: [String], // tempId references
  spouse: String, // tempId reference
  siblings: [String], // tempId references for siblings
})

const familyTreeSchema = new mongoose.Schema(
  {
    familyName: {
      type: String,
      required: [true, "Family name is required"],
    },
    familyHead: {
      type: String, // tempId of the head member
      required: true,
    },
    members: [memberSchema],
    visibility: {
      type: String,
      enum: ["public", "members-only"],
      default: "public",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Method to check for cycles
familyTreeSchema.methods.hasCycle = function (memberId, potentialParentId) {
  const visited = new Set()
  const memberMap = new Map()

  this.members.forEach((m) => memberMap.set(m.tempId, m))

  const dfs = (currentId) => {
    if (currentId === memberId) return true
    if (visited.has(currentId)) return false
    visited.add(currentId)

    const member = memberMap.get(currentId)
    if (!member) return false

    for (const childId of member.children || []) {
      if (dfs(childId)) return true
    }
    return false
  }

  return dfs(potentialParentId)
}

export default mongoose.model("FamilyTree", familyTreeSchema)
