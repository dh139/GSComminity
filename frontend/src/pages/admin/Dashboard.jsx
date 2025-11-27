"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../../lib/axios"
import { FiUsers, FiFileText, FiCalendar, FiCheckCircle, FiClock } from "react-icons/fi"

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [pendingUsers, setPendingUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([api.get("/admin/stats"), api.get("/admin/pending-approvals")])
     setStats(statsRes.data.stats)

      setPendingUsers(pendingRes.data.users)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

const handleApprove = async (userId) => {
  try {
    await api.put(`/admin/approve-user/${userId}`)

    setPendingUsers((prev) => prev.filter((u) => u._id !== userId))

    setStats((prev) => ({
      ...prev,
      totalUsers: prev.totalUsers + 1,
      pendingApprovals: prev.pendingApprovals - 1,
    }))
  } catch (error) {
    console.error(error)
  }
}

const handleReject = async (userId) => {
  try {
    await api.delete(`/admin/delete-user/${userId}`)

    setPendingUsers((prev) => prev.filter((u) => u._id !== userId))

    setStats((prev) => ({
      ...prev,
      pendingApprovals: prev.pendingApprovals - 1,
    }))
  } catch (error) {
    console.error(error)
  }
}


  if (isLoading) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
              <p className="text-sm text-gray-500">Total Members</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalPosts || 0}</p>
              <p className="text-sm text-gray-500">Total Posts</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalEvents || 0}</p>
              <p className="text-sm text-gray-500">Events</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FiClock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.pendingApprovals || 0}</p>
              <p className="text-sm text-gray-500">Pending Approvals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Pending Approvals</h2>
        {pendingUsers.length === 0 ? (
          <div className="text-center py-8">
            <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-500">All caught up! No pending approvals.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="font-semibold text-primary-600">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(user._id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(user._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        <Link to="/admin/users" className="card p-6 hover:shadow-md transition-shadow">
          <FiUsers className="w-8 h-8 text-primary-600 mb-2" />
          <p className="font-semibold">Manage Users</p>
          <p className="text-sm text-gray-500">View and manage all users</p>
        </Link>
        <Link to="/admin/events" className="card p-6 hover:shadow-md transition-shadow">
          <FiCalendar className="w-8 h-8 text-primary-600 mb-2" />
          <p className="font-semibold">Manage Events</p>
          <p className="text-sm text-gray-500">Create and manage events</p>
        </Link>
        <Link to="/admin/posts" className="card p-6 hover:shadow-md transition-shadow">
          <FiFileText className="w-8 h-8 text-primary-600 mb-2" />
          <p className="font-semibold">Manage Posts</p>
          <p className="text-sm text-gray-500">Moderate community posts</p>
        </Link>
      </div>
    </div>
  )
}
