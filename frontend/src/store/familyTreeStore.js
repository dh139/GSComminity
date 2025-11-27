import { create } from "zustand"
import api from "../lib/axios"

export const useFamilyTreeStore = create((set, get) => ({
  familyTrees: [],
  currentTree: null,
  tree: null,
  isLoading: false,

  fetchMyTree: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get("/familytrees/my-tree")
      set({ tree: data.familyTree, currentTree: data.familyTree, isLoading: false })
      return { success: true, familyTree: data.familyTree }
    } catch (error) {
      // If no tree exists, create one
      if (error.response?.status === 404) {
        try {
          const { data } = await api.post("/familytrees", { familyName: "My Family Tree" })
          set({ tree: data.familyTree, currentTree: data.familyTree, isLoading: false })
          return { success: true, familyTree: data.familyTree }
        } catch (createError) {
          set({ isLoading: false })
          return { success: false, message: createError.response?.data?.message }
        }
      }
      set({ isLoading: false })
      return { success: false, message: error.response?.data?.message }
    }
  },

  fetchUserTree: async (userId) => {
    set({ isLoading: true })
    try {
      const { data } = await api.get(`/familytrees/user/${userId}`)
      set({ currentTree: data.familyTree, isLoading: false })
      return { success: true, familyTree: data.familyTree }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, message: error.response?.data?.message }
    }
  },

  fetchFamilyTrees: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get("/familytrees")
      set({ familyTrees: data.familyTrees, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
    }
  },

  fetchFamilyTree: async (id) => {
    set({ isLoading: true })
    try {
      const { data } = await api.get(`/familytrees/${id}`)
      set({ currentTree: data.familyTree, tree: data.familyTree, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
    }
  },

  createFamilyTree: async (treeData) => {
    try {
      const { data } = await api.post("/familytrees", treeData)
      set({ familyTrees: [...get().familyTrees, data.familyTree] })
      return { success: true, familyTree: data.familyTree }
    } catch (error) {
      return { success: false, message: error.response?.data?.message }
    }
  },

  addMember: async (memberData) => {
    const tree = get().tree
    if (!tree) {
      return { success: false, message: "No family tree found" }
    }
    try {
      const { data } = await api.post(`/familytrees/${tree._id}/add-member`, memberData)
      set({ currentTree: data.familyTree, tree: data.familyTree })
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message }
    }
  },

  updateMember: async (memberId, memberData) => {
    const tree = get().tree
    if (!tree) {
      return { success: false, message: "No family tree found" }
    }
    try {
      const { data } = await api.put(`/familytrees/${tree._id}/update-member/${memberId}`, memberData)
      set({ currentTree: data.familyTree, tree: data.familyTree })
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message }
    }
  },

  removeMember: async (memberId) => {
    const tree = get().tree
    if (!tree) {
      return { success: false, message: "No family tree found" }
    }
    try {
      const { data } = await api.delete(`/familytrees/${tree._id}/remove-member/${memberId}`)
      set({ currentTree: data.familyTree, tree: data.familyTree })
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message }
    }
  },
}))
