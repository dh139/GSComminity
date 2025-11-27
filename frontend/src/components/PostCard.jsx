"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { usePostStore } from "../store/postStore"
import { useAuthStore } from "../store/authStore"
import { FiHeart, FiMessageCircle, FiTrash2, FiMoreHorizontal } from "react-icons/fi"
import toast from "react-hot-toast"

export default function PostCard({ post }) {
  const { user } = useAuthStore()
  const { toggleLike, addComment, deletePost } = usePostStore()
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState("")
  const [showMenu, setShowMenu] = useState(false)

  const isLiked = post.likes?.includes(user?._id)
  const isOwner = post.userId?._id === user?._id

  const handleLike = async () => {
    if (!user?.isApproved) {
      toast.error("Your account is pending approval")
      return
    }
    await toggleLike(post._id)
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    if (!user?.isApproved) {
      toast.error("Your account is pending approval")
      return
    }
    await addComment(post._id, comment)
    setComment("")
  }

  const handleDelete = async () => {
    if (confirm("Delete this post?")) {
      const result = await deletePost(post._id)
      if (result.success) {
        toast.success("Post deleted")
      } else {
        toast.error("Failed to delete post")
      }
    }
    setShowMenu(false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="card overflow-hidden">
      {/* Header - Use userId instead of author */}
      <div className="p-4 flex items-center justify-between">
        <Link to={`/members/${post.userId?._id}`} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
            {post.userId?.profilePhoto ? (
              <img src={post.userId.profilePhoto || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-semibold text-primary-600">
                {post.userId?.firstName?.[0]}
                {post.userId?.lastName?.[0]}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium">
              {post.userId?.firstName} {post.userId?.lastName}
            </p>
            <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </Link>

        {isOwner && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 rounded-full">
              <FiMoreHorizontal />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 z-10">
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                >
                  <FiTrash2 size={16} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {post.caption && (
        <div className="px-4 pb-3">
          <p className="text-gray-800 whitespace-pre-wrap">{post.caption}</p>
        </div>
      )}

      {/* Images - Use imageUrls instead of images */}
      {post.imageUrls?.length > 0 && (
        <div className={`grid ${post.imageUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-0.5`}>
          {post.imageUrls.map((image, index) => (
            <img
              key={index}
              src={image || "/placeholder.svg"}
              alt=""
              className={`w-full object-cover ${post.imageUrls.length === 1 ? "max-h-[500px]" : "aspect-square"}`}
            />
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="px-4 pt-3 flex flex-wrap gap-2">
          {post.tags.map((tag, index) => (
            <span key={index} className="text-primary-600 text-sm">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 flex items-center gap-6">
        <button onClick={handleLike} className="flex items-center gap-2 text-gray-600 hover:text-primary-600">
          <FiHeart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          <span className="text-sm">{post.likes?.length || 0}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
        >
          <FiMessageCircle className="w-5 h-5" />
          <span className="text-sm">{post.comments?.length || 0}</span>
        </button>
      </div>

      {/* Comments Section - Use userId instead of user for comments */}
      {showComments && (
        <div className="px-4 pb-4 border-t">
          {post.comments?.length > 0 && (
            <div className="pt-4 space-y-3 max-h-60 overflow-y-auto">
              {post.comments.map((c, index) => (
                <div key={index} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {c.userId?.profilePhoto ? (
                      <img
                        src={c.userId.profilePhoto || "/placeholder.svg"}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium">
                        {c.userId?.firstName?.[0]}
                        {c.userId?.lastName?.[0]}
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1">
                    <p className="text-sm font-medium">
                      {c.userId?.firstName} {c.userId?.lastName}
                    </p>
                    <p className="text-sm text-gray-700">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {user?.isApproved && (
            <form onSubmit={handleComment} className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="input-field flex-1 py-2"
              />
              <button type="submit" className="btn-primary px-4 py-2">
                Post
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
