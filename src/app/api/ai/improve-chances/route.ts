// src/app/api/ai/improve-chances/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/../lib/mongodb";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { job } = await request.json();

  const client = await clientPromise;
  const db = client.db("startsmartdb");
  const profile = await db.collection("profiles").findOne({ userId });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const prompt = `
You are a job advisor. Given the job details and a candidate's profile, provide specific actionable advice on how the candidate can increase their chances of being hired for this job.

Job:
- Title: ${job.title}
- Description: ${job.description}
- Location: ${job.location}, ${job.country}

Candidate:
- Bio: ${profile.bio}
- Skills: ${(profile.skills || []).join(", ")}
- Experience: ${JSON.stringify(profile.experience)}
- Education: ${JSON.stringify(profile.education)}

Give bullet points with 3–5 personalized suggestions.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const tips = completion.choices[0].message.content;
    return NextResponse.json({ tips });
  } catch (error) {
    console.error("Tips generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
