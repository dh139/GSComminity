"use client"

import { Outlet, Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuthStore } from "../store/authStore"
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiImage,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiSettings,
  FiGitBranch,
} from "react-icons/fi"

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const navItems = [
    { to: "/", icon: FiHome, label: "Home" },
    { to: "/feed", icon: FiImage, label: "Feed", auth: true },
    { to: "/members", icon: FiUsers, label: "Members", auth: true },
    { to: "/events", icon: FiCalendar, label: "Events", auth: true },
    { to: "/family-tree", icon: FiGitBranch, label: "Family Tree", auth: true },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="p-2">
          <FiMenu size={24} />
        </button>
        <Link to="/" className="text-xl font-bold text-primary-600">
          GS
        </Link>
        <div className="w-10" />
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r z-50 transform transition-transform duration-300
        lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <Link to="/" className="text-xl font-bold text-primary-600">
            GS
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2">
            <FiX size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            if (item.auth && !isAuthenticated) return null
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}

          {isAuthenticated && user?.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FiSettings size={20} />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {isAuthenticated && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
            <Link
              to="/profile"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors mb-2"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto || "/placeholder.svg"}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <FiUser size={16} className="text-primary-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">#{user?.sabhasadNo}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
            >
              <FiLogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white space-y-2">
            <Link to="/login" onClick={() => setSidebarOpen(false)} className="block w-full btn-primary text-center">
              Login
            </Link>
            <Link to="/register" onClick={() => setSidebarOpen(false)} className="block w-full btn-outline text-center">
              Register
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
