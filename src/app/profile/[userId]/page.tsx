"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Users, Film } from "lucide-react"

export default function ProfilePage() {
  const params = useParams()
  const userId = params.userId
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetch(`/api/users/${userId}`)
        .then(res => res.json())
        .then(data => {
          setProfile(data)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [userId])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-black"><div className="text-white">Loading...</div></div>
  }

  if (!profile) {
    return <div className="flex min-h-screen items-center justify-center bg-black"><div className="text-white">User not found</div></div>
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative">
        {profile.profile?.bannerImage ? (
          <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${profile.profile.bannerImage})` }} />
        ) : (
          <div className="h-48 w-full bg-gradient-to-r from-purple-900/30 to-pink-900/30" />
        )}
        <div className="container mx-auto px-4">
          <div className="relative -mt-16 flex items-end gap-4">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-black bg-purple-600 text-5xl font-bold">
              {profile.name?.[0] || "?"}
            </div>
            <div className="mb-2">
              <h1 className="text-3xl font-bold">{profile.name || "Anonymous"}</h1>
              <p className="text-gray-400">{profile.profile?.bio || "No bio yet"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-800 bg-white/5 p-4">
              <h3 className="mb-2 font-semibold">Details</h3>
              {profile.profile?.location && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.profile.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="h-4 w-4" />
                <span>0 followers</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Film className="h-4 w-4" />
                <span>0 projects</span>
              </div>
            </div>

            {profile.profile?.skills?.length > 0 && (
              <div className="rounded-xl border border-gray-800 bg-white/5 p-4">
                <h3 className="mb-2 font-semibold">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.profile.skills.map((skill: string, i: number) => (
                    <span key={i} className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="rounded-xl border border-gray-800 bg-white/5 p-8 text-center text-gray-400">
              <p>No projects yet.</p>
              <p className="text-sm">Check back later for creations!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
