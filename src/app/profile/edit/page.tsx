"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function EditProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    bio: "",
    skills: "",
    location: "",
    bannerImage: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
    if (session?.user?.id) {
      fetch(`/api/users/${session.user.id}/profile`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setFormData({
              bio: data.bio || "",
              skills: data.skills?.join(", ") || "",
              location: data.location || "",
              bannerImage: data.bannerImage || "",
            })
          }
        })
        .catch(err => console.error(err))
    }
  }, [status, router, session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const skillsArray = formData.skills.split(",").map(s => s.trim()).filter(s => s.length > 0)

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, skills: skillsArray }),
      })

      if (res.ok) {
        setMessage("✅ Profile updated successfully!")
        setTimeout(() => router.push("/dashboard"), 1500)
      } else {
        const error = await res.json()
        setMessage(`❌ ${error.error || "Something went wrong"}`)
      }
    } catch (err) {
      setMessage("❌ Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-black"><div className="text-white">Loading...</div></div>
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-2xl font-bold text-purple-400">AnimForge</Link>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">← Back to Dashboard</Link>
        </div>
      </nav>

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">Edit Profile</h1>
        <p className="mb-8 text-gray-400">Tell the community about yourself and your skills.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-black/50 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              placeholder="Tell us about yourself, your animation style, and what you're passionate about..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Skills (comma-separated)</label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-black/50 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              placeholder="e.g., 2D Animation, Character Design, Storyboarding"
            />
            <p className="mt-1 text-xs text-gray-500">Separate multiple skills with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-black/50 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              placeholder="e.g., Mumbai, India"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Banner Image URL (optional)</label>
            <input
              type="url"
              value={formData.bannerImage}
              onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-black/50 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              placeholder="https://example.com/banner.jpg"
            />
          </div>

          {message && (
            <div className={`rounded-lg p-3 ${message.includes("✅") ? "border border-green-500/20 bg-green-500/10 text-green-400" : "border border-red-500/20 bg-red-500/10 text-red-400"}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-purple-600 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  )
}
