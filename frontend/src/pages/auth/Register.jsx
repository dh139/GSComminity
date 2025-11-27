"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import toast from "react-hot-toast"
import { FiCamera, FiUser } from "react-icons/fi"

export default function Register() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    sabhasadNo: "",
    firstName: "",
    lastName: "",
    gender: "male",
    mobile: "",
    email: "",
    dob: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
    education: "",
    occupation: "",
    password: "",
    confirmPassword: "",
    profilePhoto: null,
    profilePhotoPreview: null,
  })
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith("address.")) {
      const field = name.split(".")[1]
      setFormData({
        ...formData,
        address: { ...formData.address, [field]: value },
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

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
          profilePhoto: reader.result,
          profilePhotoPreview: reader.result,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const validateStep1 = () => {
    if (!formData.sabhasadNo || !formData.firstName || !formData.lastName || !formData.dob) {
      toast.error("Please fill in all required fields")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.mobile || !formData.email) {
      toast.error("Please fill in all required fields")
      return false
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return false
    }
    // Validate mobile format (10 digits)
    const mobileRegex = /^[0-9]{10}$/
    if (!mobileRegex.test(formData.mobile)) {
      toast.error("Please enter a valid 10-digit mobile number")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.password || !formData.confirmPassword) {
      toast.error("Please fill in password fields")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (!formData.profilePhoto) {
      toast.error("Please upload a profile photo")
      return
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      profilePhoto: formData.profilePhoto,
    }
    delete submitData.confirmPassword
    delete submitData.profilePhotoPreview

    const result = await register(submitData)

    if (result.success) {
      toast.success("Registration successful! Your account is pending approval.")
      navigate("/")
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-6">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary-600 text-white" : "bg-gray-200"}`}
        >
          1
        </div>
        <div className={`w-16 h-1 ${step >= 2 ? "bg-primary-600" : "bg-gray-200"}`} />
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary-600 text-white" : "bg-gray-200"}`}
        >
          2
        </div>
        <div className={`w-16 h-1 ${step >= 3 ? "bg-primary-600" : "bg-gray-200"}`} />
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary-600 text-white" : "bg-gray-200"}`}
        >
          3
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 && (
          <>
            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo *</label>
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-200 bg-gray-100 flex items-center justify-center">
                  {formData.profilePhotoPreview ? (
                    <img
                      src={formData.profilePhotoPreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <label
                  htmlFor="profile-photo"
                  className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors shadow-lg"
                >
                  <FiCamera className="w-5 h-5" />
                </label>
                <input
                  type="file"
                  id="profile-photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">Click camera icon to upload (Required)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sabhasad Number *</label>
              <input
                type="text"
                name="sabhasadNo"
                className="input-field"
                value={formData.sabhasadNo}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  className="input-field"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  className="input-field"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select name="gender" className="input-field" value={formData.gender} onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                name="dob"
                className="input-field"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setStep(2)
              }}
              className="btn-primary w-full"
            >
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
              <input
                type="tel"
                name="mobile"
                className="input-field"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                className="input-field"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                name="address.street"
                className="input-field"
                value={formData.address.street}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="address.city"
                  className="input-field"
                  value={formData.address.city}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="address.state"
                  className="input-field"
                  value={formData.address.state}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                name="address.pincode"
                className="input-field"
                value={formData.address.pincode}
                onChange={handleChange}
              />
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setStep(3)
                }}
                className="btn-primary flex-1"
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
              <input
                type="text"
                name="education"
                className="input-field"
                value={formData.education}
                onChange={handleChange}
                placeholder="e.g., Bachelor's Degree"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
              <input
                type="text"
                name="occupation"
                className="input-field"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="e.g., Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                name="password"
                className="input-field"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className="input-field"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter your password"
              />
            </div>

            {/* Summary of uploaded photo */}
            {formData.profilePhotoPreview && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <img
                  src={formData.profilePhotoPreview}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Profile photo uploaded</p>
                  <p className="text-xs text-green-600">Ready to submit</p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">
                Back
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register"}
              </button>
            </div>
          </>
        )}
      </form>

      <p className="text-center mt-6 text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">
          Login here
        </Link>
      </p>
    </div>
  )
}