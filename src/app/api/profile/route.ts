import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { auth } from "@clerk/nextjs/server";

// 🔹 PATCH — mettre à jour un profil
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("startsmartdb");
    const profiles = db.collection("profiles");

    const profileData = await request.json();

    await profiles.updateOne(
      { userId },
      { $set: { ...profileData, userId, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ message: "Profile updated" });
  } catch (error) {
    console.error("PATCH /api/profile error:", error);
    return NextResponse.json({ error: "Could not update profile" }, { status: 500 });
  }
}

// 🔹 GET — récupérer le profil existant
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("startsmartdb");
    const profiles = db.collection("profiles");

    const profile = await profiles.findOne({ userId });

    return NextResponse.json(profile || {});
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json({ error: "Could not load profile" }, { status: 500 });
  }
}

// 🔹 POST — create or replace profile
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("startsmartdb");
    const profiles = db.collection("profiles");

    const profileData = await request.json();

    // ✅ Delete existing profiles for this user
    await profiles.deleteMany({ userId });

    // ✅ Insert the new one
    await profiles.insertOne({
      ...profileData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: "Profile created/replaced" });
  } catch (error) {
    console.error("POST /api/profile error:", error);
    return NextResponse.json({ error: "Could not create profile" }, { status: 500 });
  }
}

