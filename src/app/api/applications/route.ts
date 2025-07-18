import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("startsmartdb");
  const applications = db.collection("applications");

  const userApplications = await applications
    .find({ userId })
    .sort({ createdAt: -1 }) // les plus récentes d'abord
    .toArray();

  return NextResponse.json(userApplications);
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("startsmartdb");
  const applications = db.collection("applications");

  const body = await request.json();

  const applicationData = {
    userId,
    jobId: body.jobId,
    status: "pending",
    createdAt: new Date(),
  };

  await applications.insertOne(applicationData);

  return NextResponse.json({ message: "Application saved" });
}
