import { NextResponse } from "next/server";
import clientPromise from "@/../lib/mongodb";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const client = await clientPromise;
  const db = client.db("startsmartdb");
  const { id } = params;

  const job = await db.collection("jobs").findOne({ _id: new RegExp(`^${id}$`, "i") });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  // Convert MongoDB _id object to string if necessary
  const jobData = {
    id: job._id.toString(),
    title: job.title,
    description: job.description,
    location: job.location,
    country: job.country,
    redirectUrl: job.redirectUrl,
  };

  return NextResponse.json({ job: jobData });
}
