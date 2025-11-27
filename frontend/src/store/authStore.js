import { create } from "zustand"
import { persist } from "zustand/middleware"
import api from "../lib/axios"

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (sabhasadNo, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post("/auth/login", { sabhasadNo, password })
          localStorage.setItem("token", data.token)
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          })
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || "Login failed"
          set({ error: message, isLoading: false })
          return { success: false, message }
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post("/auth/register", userData)
          localStorage.setItem("token", data.token)
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          })
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || "Registration failed"
          set({ error: message, isLoading: false })
          return { success: false, message }
        }
      },

      logout: () => {
        localStorage.removeItem("token")
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.put("/users/me", profileData)
          set({
            user: data.user,
            isLoading: false,
          })
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || "Failed to update profile"
          set({ error: message, isLoading: false })
          return { success: false, message }
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem("token")
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }

        try {
          const { data } = await api.get("/auth/me")
          set({ user: data.user, isAuthenticated: true })
        } catch (error) {
          localStorage.removeItem("token")
          set({ isAuthenticated: false, user: null })
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    },
  ),
)
