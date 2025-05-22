import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@/lib/generated/prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    
    // Extract updatable fields
    const { name, avatar, profile: profileData } = body;

    // Build user update object
    const userUpdateData: any = {};
    if (name) userUpdateData.name = name;
    if (avatar) userUpdateData.avatar = avatar;

    // Build profile update object
    const profileUpdateData: any = {};
    if (profileData?.title) profileUpdateData.title = profileData.title;
    if (profileData?.location) profileUpdateData.location = profileData.location;
    if (profileData?.bio) profileUpdateData.bio = profileData.bio;
    if (profileData?.skills) profileUpdateData.skills = profileData.skills;
    if (profileData?.endorsements) profileUpdateData.endorsements = profileData.endorsements;    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
    });    // Update or create profile data
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: profileUpdateData,
      create: {
        userId,
        bio: profileData?.bio || "",
        title: profileData?.title || null,
        location: profileData?.location || null,
        endorsements: profileData?.endorsements || [],
        skills: profileData?.skills || [],
        level: 1,
        xp: 0,
        streak: 0,
      },
    });

    return NextResponse.json({
      user: updatedUser,
      profile,
    });
  } catch (error: any) {
    console.log("[PROFILE_UPDATE_ERROR]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
