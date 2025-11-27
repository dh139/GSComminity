"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "../store/authStore"
import { FiCamera, FiSave } from "react-icons/fi"
import toast from "react-hot-toast"

export default function Profile() {
  const { user, updateProfile, isLoading } = useAuthStore()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    dob: "",
    gender: "",
    occupation: "",
    education: "",
    bio: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
  })

  const [profilePhoto, setProfilePhoto] = useState(null)
  const [preview, setPreview] = useState(null)

  // CRITICAL FIX: Trigger useEffect whenever user data actually becomes available
  useEffect(() => {
    if (!user) {
      // Reset form if no user
      setFormData({
        firstName: "",
        lastName: "",
        mobile: "",
        dob: "",
        gender: "",
        occupation: "",
        education: "",
        bio: "",
        address: { street: "", city: "", state: "", pincode: "" },
      })
      setPreview(null)
      return
    }

    // Safely extract values with fallbacks
    const dobISO = user.dob ? new Date(user.dob).toISOString().split("T")[0] : ""

    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      mobile: user.mobile || "",
      dob: dobISO,
      gender: user.gender || "",
      occupation: user.occupation || "",
      education: user.education || "",
      bio: user.bio || "",
      address: {
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        pincode: user.address?.pincode || "",
      },
    })

    // Set profile photo preview (even if empty string, we set null to show initials)
    setPreview(user.profilePhoto && user.profilePhoto.trim() !== "" ? user.profilePhoto : null)
    setProfilePhoto(null) // Reset uploaded photo on load

  }, [
    user,
    user?.firstName,
    user?.lastName,
    user?.mobile,
    user?.dob,
    user?.gender,
    user?.address?.street,
    user?.email, // This is key — triggers when user fully loads
  ])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith("address.")) {
      const field = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result
        setProfilePhoto(result)
        setPreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const dataToSend = {
      ...formData,
      ...(profilePhoto && { profilePhoto }),
    }

    const result = await updateProfile(dataToSend)
    if (result?.success) {
      toast.success("Profile updated successfully!")
    } else {
      toast.error(result?.message || "Failed to update profile")
    }
  }

  // Show initials if no photo
  const initials = `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase()

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Profile Photo */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              {preview ? (
                <img src={preview} alt="Profile" className="w-full h-full object-cover" />
              ) : initials ? (
                <span className="text-3xl font-bold text-primary-600">{initials}</span>
              ) : (
                <span className="text-3xl font-bold text-gray-400">?</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 shadow-lg border-4 border-white">
              <FiCamera className="text-white w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Personal Info */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
            <input
              type="text"
              name="education"
              value={formData.education}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="input-field resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        {/* Address Section */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Address</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                name="address.pincode"
                value={formData.address.pincode}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-lg font-medium disabled:opacity-70"
        >
          <FiSave className="w-5 h-5" />
          {isLoading ? "Saving Changes..." : "Save Changes"}
        </button>
      </form>
    </div>
  )
}