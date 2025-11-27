"use client"

import { useEffect } from "react"
import { Link } from "react-router-dom"
import { usePostStore } from "../store/postStore"
import { useAuthStore } from "../store/authStore"
import PostCard from "../components/PostCard"
import { FiPlus } from "react-icons/fi"

export default function Feed() {
  const { posts, isLoading, fetchPosts } = usePostStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  if (isLoading) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/6" />
                </div>
              </div>
              <div className="h-64 bg-gray-200 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Community Feed</h1>
        {user?.isApproved && (
          <Link to="/create-post" className="btn-primary flex items-center gap-2">
            <FiPlus /> New Post
          </Link>
        )}
      </div>

      {!user?.isApproved && (
        <div className="card p-4 bg-yellow-50 border-yellow-200 mb-6">
          <p className="text-yellow-800">
            Your account is pending approval. You can view posts but cannot create or interact with them.
          </p>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
