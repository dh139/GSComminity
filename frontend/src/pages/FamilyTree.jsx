"use client"

import { useEffect, useState } from "react"
import { useFamilyTreeStore } from "../store/familyTreeStore"
import { FiPlus, FiUsers, FiX, FiTrash2, FiCamera } from "react-icons/fi"
import toast from "react-hot-toast"

export default function FamilyTree() {
  const { tree, fetchMyTree, addMember, removeMember, isLoading } = useFamilyTreeStore()
  const [showModal, setShowModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    relation: "",
    gender: "",
    dob: "",
    isAlive: true,
    photo: null,
    photoPreview: null,
  })

  useEffect(() => {
    fetchMyTree()
  }, [])

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo must be less than 5MB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({
          ...formData,
          photo: reader.result,
          photoPreview: reader.result,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Relation options based on context
  const getRelationOptions = () => {
    if (!selectedMember) {
      return [{ value: "self", label: "Myself", icon: "👤" }]
    }

    return [
      { value: "spouse", label: `${selectedMember.name}'s Spouse (Husband/Wife)`, icon: "💑" },
      { value: "father", label: `${selectedMember.name}'s Father`, icon: "👨" },
      { value: "mother", label: `${selectedMember.name}'s Mother`, icon: "👩" },
      { value: "son", label: `${selectedMember.name}'s Son`, icon: "👦" },
      { value: "daughter", label: `${selectedMember.name}'s Daughter`, icon: "👧" },
      { value: "brother", label: `${selectedMember.name}'s Brother`, icon: "👦" },
      { value: "sister", label: `${selectedMember.name}'s Sister`, icon: "👧" },
    ]
  }

  const handleSelectRelation = (relation) => {
    let autoGender = ""
    if (["father", "son", "brother"].includes(relation)) {
      autoGender = "male"
    } else if (["mother", "daughter", "sister"].includes(relation)) {
      autoGender = "female"
    }

    setFormData({ ...formData, relation, gender: autoGender })
    setStep(2)
  }
 const handleAddMember = async () => {
    // Validate all required fields
    if (!formData.name || !formData.gender || !formData.dob || !formData.photo) {
      toast.error("Please fill in all required fields including photo")
      return
    }

    setIsSubmitting(true)

    try {
      const memberData = {
        name: formData.name,
        relation: formData.relation,
        gender: formData.gender,
        dob: formData.dob,
        relatedTo: selectedMember?.tempId || null,
        photo: formData.photo,
      }

      const result = await addMember(memberData)
      if (result.success) {
        toast.success("Family member added!")
        closeModal()
      } else {
        toast.error(result.message || "Failed to add member")
      }
    } catch (error) {
      toast.error("An error occurred while adding member")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMember = async (member) => {
    if (member.relation === "self") {
      toast.error("Cannot delete yourself from the tree")
      return
    }

    if (window.confirm(`Are you sure you want to remove ${member.name}?`)) {
      const result = await removeMember(member.tempId)
      if (result.success) {
        toast.success("Member removed")
      } else {
        toast.error(result.message || "Failed to remove member")
      }
    }
  }

  const openAddModal = (member = null) => {
    setSelectedMember(member)
    setStep(1)
    setFormData({ name: "", relation: "", gender: "", dob: "", isAlive: true, photo: null, photoPreview: null })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedMember(null)
    setStep(1)
    setIsSubmitting(false)
    setFormData({ name: "", relation: "", gender: "", dob: "", isAlive: true, photo: null, photoPreview: null })
  }

  // Get member's spouse
  const getSpouse = (member) => {
    if (!member?.spouse || !tree?.members) return null
    return tree.members.find((m) => m.tempId === member.spouse)
  }

  // Get member's children
  const getChildren = (member) => {
    if (!member?.children || !tree?.members) return []
    return tree.members.filter((m) => member.children.includes(m.tempId))
  }

  // Get member's parents
  const getParents = (member) => {
    if (!member?.parents || !tree?.members) return []
    return tree.members.filter((m) => member.parents.includes(m.tempId))
  }

  const getSiblings = (member) => {
    if (!member?.siblings || !tree?.members) return []
    return tree.members.filter((m) => member.siblings.includes(m.tempId))
  }

  const PersonCard = ({ member, onAddClick, onDeleteClick, showActions = true }) => {
    const isMale = member.gender === "male"
    const isFemale = member.gender === "female"

    return (
      <div className="flex flex-col items-center">
        <div className="relative group">
          <div
            className={`w-16 h-20 flex flex-col items-center justify-center rounded-lg shadow-md transition-all hover:shadow-lg overflow-hidden ${
              isMale
                ? "bg-blue-100 border-2 border-blue-300"
                : isFemale
                  ? "bg-pink-100 border-2 border-pink-300"
                  : "bg-gray-100 border-2 border-gray-300"
            }`}
          >
            {member.photoUrl ? (
              <img
                src={member.photoUrl || "/placeholder.svg"}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`text-2xl ${isMale ? "text-blue-600" : isFemale ? "text-pink-600" : "text-gray-600"}`}>
                {isMale ? "👨" : isFemale ? "👩" : "👤"}
              </div>
            )}
          </div>

          {showActions && (
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={() => onAddClick(member)}
                className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-green-600"
                title="Add relative"
              >
                <FiPlus />
              </button>
              {member.relation !== "self" && (
                <button
                  onClick={() => onDeleteClick(member)}
                  className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  title="Remove"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-1 text-center">
          <p className="text-xs font-medium text-gray-800 max-w-[80px] truncate">{member.name}</p>
          <p className="text-[10px] text-gray-500 capitalize">{member.relation}</p>
        </div>
      </div>
    )
  }

  const SiblingsGroup = ({ members, onAddClick, onDeleteClick }) => {
    if (members.length === 0) return null

    return (
      <div className="flex items-start gap-4">
        {members.map((member, idx) => {
          const spouse = getSpouse(member)
          return (
            <div key={member.tempId} className="flex items-start">
              {idx > 0 && <div className="w-4 h-0.5 bg-gray-300 mt-10 mr-2"></div>}
              <div className="flex items-start gap-2">
                <PersonCard member={member} onAddClick={onAddClick} onDeleteClick={onDeleteClick} />
                {spouse && (
                  <>
                    <div className="flex items-center h-20">
                      <div className="w-4 h-0.5 bg-gray-400 mt-4"></div>
                    </div>
                    <PersonCard member={spouse} onAddClick={onAddClick} onDeleteClick={onDeleteClick} />
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderFamilyTree = () => {
    if (!tree?.members || tree.members.length === 0) return null

    // Find self member
    const selfMember = tree.members.find((m) => m.relation === "self")
    if (!selfMember) return null

    // Get self's siblings
    const selfSiblings = getSiblings(selfMember)
    const selfGeneration = [selfMember, ...selfSiblings]

    // Get parents
    const parents = getParents(selfMember)
    const father = parents.find((p) => p.gender === "male")
    const mother = parents.find((p) => p.gender === "female")

    // Get grandparents from father
    const fatherParents = father ? getParents(father) : []
    const paternalGrandfather = fatherParents.find((p) => p.gender === "male")
    const paternalGrandmother = fatherParents.find((p) => p.gender === "female")

    // Get grandparents from mother
    const motherParents = mother ? getParents(mother) : []
    const maternalGrandfather = motherParents.find((p) => p.gender === "male")
    const maternalGrandmother = motherParents.find((p) => p.gender === "female")

    // Get children of self (and spouse)
    const selfChildren = getChildren(selfMember)

    return (
      <div className="flex flex-col items-center gap-6">
        {/* Grandparents Generation */}
        {(paternalGrandfather || paternalGrandmother || maternalGrandfather || maternalGrandmother) && (
          <>
            <div className="flex items-start gap-16">
              {/* Paternal Grandparents */}
              {(paternalGrandfather || paternalGrandmother) && (
                <div className="flex items-start gap-2">
                  {paternalGrandfather && (
                    <PersonCard
                      member={paternalGrandfather}
                      onAddClick={openAddModal}
                      onDeleteClick={handleDeleteMember}
                    />
                  )}
                  {paternalGrandfather && paternalGrandmother && (
                    <div className="flex items-center h-20">
                      <div className="w-4 h-0.5 bg-gray-400 mt-4"></div>
                    </div>
                  )}
                  {paternalGrandmother && (
                    <PersonCard
                      member={paternalGrandmother}
                      onAddClick={openAddModal}
                      onDeleteClick={handleDeleteMember}
                    />
                  )}
                </div>
              )}

              {/* Maternal Grandparents */}
              {(maternalGrandfather || maternalGrandmother) && (
                <div className="flex items-start gap-2">
                  {maternalGrandfather && (
                    <PersonCard
                      member={maternalGrandfather}
                      onAddClick={openAddModal}
                      onDeleteClick={handleDeleteMember}
                    />
                  )}
                  {maternalGrandfather && maternalGrandmother && (
                    <div className="flex items-center h-20">
                      <div className="w-4 h-0.5 bg-gray-400 mt-4"></div>
                    </div>
                  )}
                  {maternalGrandmother && (
                    <PersonCard
                      member={maternalGrandmother}
                      onAddClick={openAddModal}
                      onDeleteClick={handleDeleteMember}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Connector to parents */}
            <div className="w-0.5 h-6 bg-gray-400"></div>
          </>
        )}

        {/* Parents Generation */}
        {(father || mother) && (
          <>
            <div className="flex items-start gap-2">
              {father && <PersonCard member={father} onAddClick={openAddModal} onDeleteClick={handleDeleteMember} />}
              {father && mother && (
                <div className="flex items-center h-20">
                  <div className="w-4 h-0.5 bg-gray-400 mt-4"></div>
                </div>
              )}
              {mother && <PersonCard member={mother} onAddClick={openAddModal} onDeleteClick={handleDeleteMember} />}
            </div>

            {/* Connector to self generation */}
            <div className="w-0.5 h-6 bg-gray-400"></div>
          </>
        )}

        {/* Self Generation (Self + Siblings) */}
        <div className="flex items-start gap-6">
          <SiblingsGroup members={selfGeneration} onAddClick={openAddModal} onDeleteClick={handleDeleteMember} />
        </div>

        {/* Children Generation */}
        {selfChildren.length > 0 && (
          <>
            <div className="w-0.5 h-6 bg-gray-400"></div>

            {selfChildren.length > 1 && (
              <div className="relative w-full flex justify-center">
                <div
                  className="h-0.5 bg-gray-400"
                  style={{ width: `${Math.max(selfChildren.length - 1, 1) * 80}px` }}
                ></div>
              </div>
            )}

            <div className="flex gap-6">
              {selfChildren.map((child) => {
                const childSpouse = getSpouse(child)
                const grandChildren = getChildren(child)

                return (
                  <div key={child.tempId} className="flex flex-col items-center">
                    {selfChildren.length > 1 && <div className="w-0.5 h-4 bg-gray-400"></div>}

                    <div className="flex items-start gap-2">
                      <PersonCard member={child} onAddClick={openAddModal} onDeleteClick={handleDeleteMember} />
                      {childSpouse && (
                        <>
                          <div className="flex items-center h-20">
                            <div className="w-4 h-0.5 bg-gray-400 mt-4"></div>
                          </div>
                          <PersonCard
                            member={childSpouse}
                            onAddClick={openAddModal}
                            onDeleteClick={handleDeleteMember}
                          />
                        </>
                      )}
                    </div>

                    {/* Grandchildren */}
                    {grandChildren.length > 0 && (
                      <>
                        <div className="w-0.5 h-4 bg-gray-400"></div>
                        <div className="flex gap-4">
                          {grandChildren.map((gc) => (
                            <PersonCard
                              key={gc.tempId}
                              member={gc}
                              onAddClick={openAddModal}
                              onDeleteClick={handleDeleteMember}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Family Tree</h1>
          <p className="text-gray-500 text-sm">Click on any person to add their relatives</p>
        </div>
        {tree?.members?.length > 0 && (
          <div className="text-sm text-gray-500">
            {tree.members.length} member{tree.members.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Tree Display */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-500">Loading family tree...</p>
        </div>
      ) : tree?.members?.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 overflow-x-auto">
          {/* Legend */}
          <div className="flex items-center gap-6 mb-8 pb-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
              <span className="text-sm text-gray-600">Male</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-100 border-2 border-pink-300 rounded"></div>
              <span className="text-sm text-gray-600">Female</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-gray-500">Hover on a person to add or remove</span>
            </div>
          </div>

          {/* Tree visualization */}
          <div className="flex justify-center min-w-max py-4">{renderFamilyTree()}</div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUsers className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Start Your Family Tree</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Begin by adding yourself, then you can add your parents, spouse, children, and other family members.
          </p>
          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            Add Myself
          </button>
        </div>
      )}

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {step === 1 ? "Select Relationship" : "Add Details"}
                </h2>
                {selectedMember && <p className="text-sm text-gray-500">Adding relative of {selectedMember.name}</p>}
              </div>
              <button 
                onClick={closeModal} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isSubmitting}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {step === 1 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedMember
                      ? `Who do you want to add to ${selectedMember.name}'s family?`
                      : "Let's start by adding yourself to the tree"}
                  </p>

                  {getRelationOptions().map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSelectRelation(option.value)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <span className="font-medium text-gray-800">{option.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl mb-4">
                    <p className="text-sm text-blue-800">
                      Adding: <strong className="capitalize">{formData.relation}</strong>
                      {selectedMember && <span> of {selectedMember.name}</span>}
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photo (Optional)</label>
                    <div className="relative">
                      <div
                        className={`w-24 h-24 rounded-full overflow-hidden border-4 ${
                          formData.gender === "male"
                            ? "border-blue-200 bg-blue-50"
                            : formData.gender === "female"
                              ? "border-pink-200 bg-pink-50"
                              : "border-gray-200 bg-gray-50"
                        } flex items-center justify-center`}
                      >
                        {formData.photoPreview ? (
                          <img
                            src={formData.photoPreview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl">
                            {formData.gender === "male" ? "👨" : formData.gender === "female" ? "👩" : "👤"}
                          </span>
                        )}
                      </div>
                      <label
                        htmlFor="member-photo"
                        className={`absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors ${
                          isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                        }`}
                      >
                        <FiCamera className="w-4 h-4" />
                      </label>
                      <input
                        type="file"
                        id="member-photo"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        disabled={isSubmitting}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Click camera icon to upload</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter full name"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: "male" })}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                          formData.gender === "male"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        disabled={isSubmitting}
                      >
                        <span className="text-xl mr-2">👨</span> Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: "female" })}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                          formData.gender === "female"
                            ? "border-pink-500 bg-pink-50 text-pink-700"
                            : "border-gray-200 hover:border-gray-300"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        disabled={isSubmitting}
                      >
                        <span className="text-xl mr-2">👩</span> Female
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (Optional)</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleAddMember}
                      disabled={!formData.name || !formData.gender || isSubmitting}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        "Add Member"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}