import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/../lib/mongodb";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { job } = await request.json();

  const client = await clientPromise;
  const db = client.db("startsmartdb");
  const profile = await db.collection("profiles").findOne({ userId });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // 🧠 Construct a robust, English prompt for OpenAI
  const prompt = `
You are an intelligent job-matching assistant.

Here is a user profile:
Bio: ${profile.bio || "Not provided"}
Skills: ${(profile.skills || []).join(", ")}
Experience: ${profile.experience || "Not specified"}
Education: ${profile.education || "Not specified"}

And here is a job listing:
Title: ${job.title || "Not specified"}
Description: ${job.description || "Not provided"}
Required Skills: ${(job.tags || []).join(", ")}

Your task:
1. Estimate a compatibility percentage (0 to 100) between the profile and the job.
2. Suggest one improvement the user could make to their profile to improve their chances for this specific job.

Return only valid JSON in the format:
{
  "match": 85,
  "suggestion": "Add experience with React to better match this position."
}
`;

  let matchJson = { match: 0, suggestion: "No suggestion available." };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content || "{}";
    matchJson = JSON.parse(content);
  } catch (error) {
    console.error("OpenAI match error:", error);
    matchJson = {
      match: 0,
      suggestion: "AI analysis failed. Please try again later.",
    };
  }

  return NextResponse.json(matchJson);
}
