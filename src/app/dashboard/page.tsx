"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  User, Plus, FolderOpen, Users, Bell, LogOut,
  Sparkles, Film, PenTool, Mic, Music
} from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
    if (session?.user?.id) {
      fetch(`/api/users/${session.user.id}`)
        .then(res => res.json())
        .then(data => setUserData(data))
        .catch(err => console.error(err))
    }
  }, [status, router, session])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-2xl font-bold text-purple-400">
            AnimForge
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/notifications" className="rounded-full p-2 hover:bg-white/10">
              <Bell className="h-5 w-5" />
            </Link>
            <Link href={`/profile/${session.user.id}`} className="rounded-full p-2 hover:bg-white/10">
              <User className="h-5 w-5" />
            </Link>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-full p-2 hover:bg-white/10">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {session.user.name || "Creator"}! 👋</h1>
          <p className="text-gray-400">Ready to bring your animation ideas to life?</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/projects/new" className="flex items-center gap-3 rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 transition hover:bg-purple-500/20">
            <Plus className="h-6 w-6 text-purple-400" />
            <div><div className="font-semibold">New Project</div><div className="text-sm text-gray-400">Start from scratch</div></div>
          </Link>
          <Link href="/projects" className="flex items-center gap-3 rounded-xl border border-gray-800 bg-white/5 p-4 transition hover:bg-white/10">
            <FolderOpen className="h-6 w-6 text-blue-400" />
            <div><div className="font-semibold">My Projects</div><div className="text-sm text-gray-400">View all your projects</div></div>
          </Link>
          <Link href="/discover" className="flex items-center gap-3 rounded-xl border border-gray-800 bg-white/5 p-4 transition hover:bg-white/10">
            <Users className="h-6 w-6 text-green-400" />
            <div><div className="font-semibold">Find Talent</div><div className="text-sm text-gray-400">Discover collaborators</div></div>
          </Link>
          <Link href="/profile/edit" className="flex items-center gap-3 rounded-xl border border-gray-800 bg-white/5 p-4 transition hover:bg-white/10">
            <Sparkles className="h-6 w-6 text-pink-400" />
            <div><div className="font-semibold">Edit Profile</div><div className="text-sm text-gray-400">Update your portfolio</div></div>
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">What's your craft?</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {[
              { icon: Film, label: "Animator", color: "purple" },
              { icon: PenTool, label: "Artist", color: "pink" },
              { icon: Mic, label: "Voice Actor", color: "blue" },
              { icon: Music, label: "Composer", color: "green" },
              { icon: Users, label: "Writer", color: "orange" },
            ].map((role, index) => (
              <button key={index} className="flex flex-col items-center gap-2 rounded-xl border border-gray-800 bg-white/5 p-4 transition hover:bg-white/10">
                <role.icon className={`h-8 w-8 text-${role.color}-400`} />
                <span className="text-sm">{role.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          <div className="rounded-xl border border-gray-800 bg-white/5 p-8 text-center text-gray-400">
            <p>No projects yet.</p>
            <Link href="/projects/new" className="mt-2 inline-block text-purple-400 hover:underline">Create your first project →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
