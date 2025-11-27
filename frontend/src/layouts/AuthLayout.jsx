import { Outlet, Link, Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">Gajjar Samaj</h1>
          <p className="text-gray-600 mt-1">Community Portal</p>
        </Link>
        <div className="card p-6 sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
