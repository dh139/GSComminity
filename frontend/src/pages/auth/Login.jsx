"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import toast from "react-hot-toast"

export default function Login() {
  const [formData, setFormData] = useState({
    sabhasadNo: "",
    password: "",
  })
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(formData.sabhasadNo, formData.password)

    if (result.success) {
      toast.success("Login successful!")
      navigate("/")
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sabhasad Number</label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter your Sabhasad number"
            value={formData.sabhasadNo}
            onChange={(e) => setFormData({ ...formData, sabhasadNo: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            className="input-field"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-center mt-6 text-gray-600">
        Don't have an account?{" "}
        <Link to="/register" className="text-primary-600 font-medium hover:underline">
          Register here
        </Link>
      </p>
    </div>
  )
}
