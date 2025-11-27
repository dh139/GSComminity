import { create } from "zustand"
import api from "../lib/axios"

export const usePostStore = create((set, get) => ({
  posts: [],
  currentPost: null,
  isLoading: false,
  pagination: null,

  fetchPosts: async (page = 1) => {
    set({ isLoading: true })
    try {
      const { data } = await api.get(`/posts?page=${page}`)
      set({ posts: data.posts, pagination: data.pagination, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
    }
  },

  createPost: async (postData) => {
    try {
      const { data } = await api.post("/posts", postData)
      set({ posts: [data.post, ...get().posts] })
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message }
    }
  },

  toggleLike: async (postId) => {
    try {
      const { data } = await api.put(`/posts/${postId}/like`)
      const postsResponse = await api.get("/posts")
      set({ posts: postsResponse.data.posts })
    } catch (error) {
      console.error("Like error:", error)
    }
  },

  addComment: async (postId, text) => {
    try {
      const { data } = await api.post(`/posts/${postId}/comment`, { text })
      set({
        posts: get().posts.map((post) => (post._id === postId ? { ...post, comments: data.comments } : post)),
      })
      return { success: true }
    } catch (error) {
      return { success: false }
    }
  },

  deletePost: async (postId) => {
    try {
      await api.delete(`/posts/${postId}`)
      set({
        posts: get().posts.filter((post) => post._id !== postId),
      })
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message }
    }
  },
}))
