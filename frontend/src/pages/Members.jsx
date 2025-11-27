"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../lib/axios"
import { FiSearch, FiUser } from "react-icons/fi"

export default function Members() {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async (query = "") => {
    setIsLoading(true)
    try {
      const { data } = await api.get(`/users?search=${query}`)
      setMembers(data.users)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchMembers(search)
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Community Members</h1>

        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search by name or sabhasad no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">No members found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {members.map((member) => (
            <Link key={member._id} to={`/members/${member._id}`} className="card p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                  {member.profilePhoto ? (
                    <img
                      src={member.profilePhoto || "/placeholder.svg"}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-5 h-5 text-primary-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">#{member.sabhasadNo}</p>
                </div>
              </div>
              {member.occupation && <p className="mt-3 text-sm text-gray-600">{member.occupation}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
