import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/../lib/mongodb";

function calculateMatch(jobTags: string[], userSkills: string[]): number {
  if (!jobTags?.length || !userSkills?.length) return 0;

  const lowerJobTags = jobTags.map((tag) => tag.toLowerCase());
  const lowerUserSkills = userSkills.map((skill) => skill.toLowerCase());

  const matches = lowerUserSkills.filter((skill) =>
    lowerJobTags.some((tag) => tag.includes(skill) || skill.includes(tag))
  );

  return Math.round((matches.length / jobTags.length) * 100);
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("startsmartdb");

    const profile = await db.collection("profiles").findOne({ userId });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    type Job = {
      _id: any;
      title: string;
      company: string;
      location: string;
      city: string;
      description: string;
      tags: string[];
      postedAt?: Date;
    };

    const jobs = (await db.collection("jobs").find({}).toArray()) as Job[];

    const userSkills = Array.isArray(profile.skills) ? profile.skills : [];

    const recommendedJobs = jobs
      .map((job) => {
        const jobTags = Array.isArray(job.tags) ? job.tags : [];
        return {
          ...job,
          match: calculateMatch(jobTags, userSkills),
        };
      })
      .filter((job) => job.match > 20)
      .sort((a, b) => b.match - a.match)
      .slice(0, 10);

    const formatted = recommendedJobs.map((job) => ({
      id: job._id.toString(),
      title: job.title,
      company: job.company,
      location: job.location,
      city: job.city,
      description: job.description,
      match: job.match,
      postedDate:
        job.postedAt instanceof Date
          ? job.postedAt.toISOString()
          : null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/recommendations error:", error);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}
