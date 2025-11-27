import { create } from "zustand"
import api from "../lib/axios"

export const useEventStore = create((set, get) => ({
  events: [],
  isLoading: false,

  fetchEvents: async (status = "upcoming") => {
    set({ isLoading: true })
    try {
      const { data } = await api.get(`/events?status=${status}`)
      set({ events: data.events })
    } catch (error) {
      console.error(error)
    } finally {
      set({ isLoading: false })
    }
  },

  rsvp: async (eventId, status) => {
    try {
      await api.post(`/events/${eventId}/rsvp`, { status })
      get().fetchEvents()
    } catch (error) {
      console.error(error)
    }
  },
}))
