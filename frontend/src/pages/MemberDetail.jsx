"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import api from "../lib/axios"
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiBriefcase, FiBook, FiArrowLeft, FiUsers } from "react-icons/fi"

export default function MemberDetail() {
  const { id } = useParams()
  const [member, setMember] = useState(null)
  const [familyTree, setFamilyTree] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [treeLoading, setTreeLoading] = useState(false)
  const [showTree, setShowTree] = useState(false)

  useEffect(() => {
    fetchMember()
  }, [id])

  const fetchMember = async () => {
    try {
      const { data } = await api.get(`/users/${id}`)
      setMember(data.user)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFamilyTree = async () => {
    if (familyTree) {
      setShowTree(!showTree)
      return
    }

    setTreeLoading(true)
    try {
      const { data } = await api.get(`/familytrees/user/${id}`)
      setFamilyTree(data.familyTree)
      setShowTree(true)
    } catch (error) {
      console.error(error)
      setFamilyTree(null)
    } finally {
      setTreeLoading(false)
    }
  }

  const getSpouse = (member) => {
    if (!member?.spouse || !familyTree?.members) return null
    return familyTree.members.find((m) => m.tempId === member.spouse)
  }

  const getChildren = (member) => {
    if (!member?.children || !familyTree?.members) return []
    return familyTree.members.filter((m) => member.children.includes(m.tempId))
  }

  const getParents = (member) => {
    if (!member?.parents || !familyTree?.members) return []
    return familyTree.members.filter((m) => member.parents.includes(m.tempId))
  }

  // Person card for tree
// Person card for tree
  const PersonCard = ({ treeMember }) => {
    const isMale = treeMember.gender === "male"
    const isFemale = treeMember.gender === "female"

    const formatDate = (dateString) => {
      if (!dateString) return null
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    return (
      <div className="flex flex-col items-center">
        <div
          className={`w-14 h-14 flex items-center justify-center rounded-full shadow-sm overflow-hidden ${
            isMale
              ? "bg-blue-100 border-2 border-blue-300"
              : isFemale
                ? "bg-pink-100 border-2 border-pink-300"
                : "bg-gray-100 border-2 border-gray-300"
          }`}
        >
          {treeMember.photoUrl ? (
            <img
              src={treeMember.photoUrl}
              alt={treeMember.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`text-xl ${isMale ? "text-blue-600" : isFemale ? "text-pink-600" : "text-gray-600"}`}>
              {isMale ? "👨" : isFemale ? "👩" : "👤"}
            </div>
          )}
        </div>
        <p className="text-xs font-medium text-gray-800 mt-1 max-w-[70px] truncate text-center">{treeMember.name}</p>
        <p className="text-[10px] text-gray-500 capitalize">{treeMember.relation}</p>
        {treeMember.dob && (
          <p className="text-[10px] text-black-400 mt-0.5">{formatDate(treeMember.dob)}</p>
        )}
      </div>
    )
  }
  // Render couple
  const CoupleNode = ({ treeMember, spouse }) => (
    <div className="flex items-start gap-2">
      <PersonCard treeMember={treeMember} />
      {spouse && (
        <>
          <div className="flex items-center h-16">
            <div className="w-3 h-0.5 bg-gray-400 mt-3"></div>
          </div>
          <PersonCard treeMember={spouse} />
        </>
      )}
    </div>
  )

  // Render tree node recursively
  const renderTreeNode = (treeMember) => {
    if (!treeMember) return null

    const spouse = getSpouse(treeMember)
    const children = getChildren(treeMember)

    return (
      <div key={treeMember.tempId} className="flex flex-col items-center">
        <CoupleNode treeMember={treeMember} spouse={spouse} />

        {children.length > 0 && (
          <>
            <div className="w-0.5 h-4 bg-gray-400"></div>
            {children.length > 1 && (
              <div className="relative w-full flex justify-center">
                <div
                  className="h-0.5 bg-gray-400"
                  style={{ width: `${Math.max(children.length - 1, 1) * 80}px` }}
                ></div>
              </div>
            )}
            <div className="flex gap-6 mt-0">
              {children.map((child) => (
                <div key={child.tempId} className="flex flex-col items-center">
                  <div className="w-0.5 h-3 bg-gray-400"></div>
                  {renderTreeNode(child)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  const getRootMembers = () => {
    if (!familyTree?.members) return []

    const selfMember = familyTree.members.find((m) => m.relation === "self")
    if (selfMember) {
      const parents = getParents(selfMember)
      if (parents.length > 0) {
        let topParent = parents[0]
        let topParentParents = getParents(topParent)
        while (topParentParents.length > 0) {
          topParent = topParentParents[0]
          topParentParents = getParents(topParent)
        }
        return [topParent]
      }
      return [selfMember]
    }

    return familyTree.members.filter((m) => !m.parents || m.parents.length === 0)
  }

  if (isLoading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="card p-6 animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full" />
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="card p-8 text-center">
          <p className="text-gray-500">Member not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Link to="/members" className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4">
        <FiArrowLeft /> Back to Members
      </Link>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
            {member.profilePhoto ? (
              <img src={member.profilePhoto || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-primary-600">
                {member.firstName[0]}
                {member.lastName[0]}
              </span>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">
              {member.firstName} {member.lastName}
            </h1>
            <p className="text-gray-600">Sabhasad #{member.sabhasadNo}</p>
            {member.gender && (
              <span className="inline-block mt-2 px-3 py-1 bg-gray-100 rounded-full text-sm capitalize">
                {member.gender}
              </span>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {member.email && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <FiMail className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{member.email}</p>
              </div>
            </div>
          )}

          {member.mobile && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <FiPhone className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium">{member.mobile}</p>
              </div>
            </div>
          )}

          {member.dob && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <FiCalendar className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{new Date(member.dob).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {member.occupation && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <FiBriefcase className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Occupation</p>
                <p className="font-medium">{member.occupation}</p>
              </div>
            </div>
          )}

          {member.education && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <FiBook className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Education</p>
                <p className="font-medium">{member.education}</p>
              </div>
            </div>
          )}

          {member.address?.city && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <FiMapPin className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{[member.address.city, member.address.state].filter(Boolean).join(", ")}</p>
              </div>
            </div>
          )}
        </div>

        {member.bio && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-gray-600">{member.bio}</p>
          </div>
        )}

        {/* Family Tree Section */}
        <div className="mt-6 pt-6 border-t">
          <button
            onClick={fetchFamilyTree}
            disabled={treeLoading}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <FiUsers className="w-5 h-5" />
            {treeLoading ? "Loading..." : showTree ? "Hide Family Tree" : "View Family Tree"}
          </button>

          {showTree && familyTree && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl overflow-x-auto">
              <h3 className="font-semibold mb-4 text-gray-800">{familyTree.familyName}</h3>

              {/* Legend */}
              <div className="flex items-center gap-4 mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                  <span className="text-xs text-gray-600">Male</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-pink-100 border border-pink-300 rounded"></div>
                  <span className="text-xs text-gray-600">Female</span>
                </div>
              </div>

              {/* Tree */}
              <div className="flex justify-center min-w-max py-2">
                <div className="flex gap-8">{getRootMembers().map((m) => renderTreeNode(m))}</div>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                {familyTree.members.length} member{familyTree.members.length !== 1 ? "s" : ""} in this family tree
              </p>
            </div>
          )}

          {showTree && !familyTree && !treeLoading && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-gray-500 text-sm">This member has not created a family tree yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
