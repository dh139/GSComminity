"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { usePostStore } from "../store/postStore"
import { FiImage, FiX } from "react-icons/fi"
import toast from "react-hot-toast"

export default function CreatePost() {
  const [caption, setCaption] = useState("")
  const [tags, setTags] = useState("")
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { createPost } = usePostStore()
  const navigate = useNavigate()

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result])
        setPreviews((prev) => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!caption.trim() && images.length === 0) {
      toast.error("Please add a caption or image")
      return
    }

    setIsLoading(true)
    const result = await createPost({
      caption,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      images,
    })

    if (result.success) {
      toast.success("Post created!")
      navigate("/feed")
    } else {
      toast.error(result.message || "Failed to create post")
    }
    setIsLoading(false)
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square">
                  <img src={preview || "/placeholder.svg"} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-primary-500 transition-colors">
            <FiImage className="w-6 h-6 text-gray-400" />
            <span className="text-gray-600">Click to upload images</span>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
          </label>
        </div>

        {/* Caption */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
          <textarea
            className="input-field min-h-[120px] resize-none"
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <input
            type="text"
            className="input-field"
            placeholder="Add tags separated by commas"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={() => navigate("/feed")} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
            {isLoading ? "Posting..." : "Share Post"}
          </button>
        </div>
      </form>
    </div>
  )
}
