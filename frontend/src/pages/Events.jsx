"use client"

import { useEffect, useState } from "react"
import api from "../lib/axios"
import { FiCalendar, FiMapPin, FiClock, FiUsers } from "react-icons/fi"

export default function Events() {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("upcoming")

  useEffect(() => {
    fetchEvents()
  }, [filter])

  const fetchEvents = async () => {
    try {
      const { data } = await api.get(`/events?status=${filter}`)
      setEvents(data.events)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRSVP = async (eventId, status) => {
    try {
      await api.post(`/events/${eventId}/rsvp`, { status })
      fetchEvents()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Community Events</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["upcoming", "past", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === f ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="card p-8 text-center">
          <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No events found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event._id} className="card p-6">
              {event.coverImage && (
                <img
                  src={event.coverImage || "/placeholder.svg"}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-4">{event.description}</p>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" />
                      <span>{new Date(event.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4" />
                      <span>
                        {new Date(event.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <FiMapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FiUsers className="w-4 h-4" />
                      <span>{event.attendees?.length || 0} attending</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={() => handleRSVP(event._id, "attending")} className="btn-primary text-sm">
                    Attend
                  </button>
                  <button onClick={() => handleRSVP(event._id, "maybe")} className="btn-secondary text-sm">
                    Maybe
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
