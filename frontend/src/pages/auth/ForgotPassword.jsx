"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import api from "../../lib/axios"
import toast from "react-hot-toast"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await api.post("/auth/forgot-password", { email })
      setSent(true)
      toast.success("Password reset link sent!")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link")
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Check your email</h2>
        <p className="text-gray-600 mb-6">We've sent a password reset link to your email address.</p>
        <Link to="/login" className="text-primary-600 font-medium hover:underline">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-2">Forgot Password</h2>
      <p className="text-gray-600 text-center mb-6">Enter your email and we'll send you a reset link.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            className="input-field"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="text-center mt-6">
        <Link to="/login" className="text-primary-600 font-medium hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  )
}
