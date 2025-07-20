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

  // 🧠 Structured, English prompt
  const prompt = `
You are a career assistant. Generate a modern, tailored resume (CV) for the following job opportunity.

Job:
Title: ${job.title || "Not specified"}
Description: ${job.description || "Not provided"}
Country: ${job.country || "Unknown"}
Location: ${job.location || "Unknown"}

Candidate Profile:
Name: ${profile.name || "Not specified"}
Bio: ${profile.bio || "Not provided"}
Skills: ${(profile.skills || []).join(", ") || "None listed"}
Experience: ${profile.experience || "No experience specified"}
Education: ${profile.education || "No education listed"}

Instructions:
- Format the output as a modern, well-structured resume.
- Start with a brief, professional summary or personal statement.
- Highlight relevant skills and achievements.
- Use clean headings like "Summary", "Skills", "Experience", and "Education".
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const generatedCV = completion.choices[0].message.content || "";

    return NextResponse.json({ cv: generatedCV });
  } catch (error) {
    console.error("CV generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate CV. Please try again later." },
      { status: 500 }
    );
  }
}
