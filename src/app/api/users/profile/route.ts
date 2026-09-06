import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { bio, skills, location, bannerImage } = await request.json()

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        bio,
        skills,
        location,
        bannerImage,
      },
      create: {
        userId: session.user.id,
        bio,
        skills,
        location,
        bannerImage,
      },
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
