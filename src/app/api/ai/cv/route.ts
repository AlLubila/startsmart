import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { job } = await req.json();
    if (!job) {
      return NextResponse.json({ error: "Missing job data" }, { status: 400 });
    }

    const prompt = `
    Create a professional CV tailored for the following job:

    Job Title: ${job.title}
    Company: ${job.company}
    Location: ${job.location}
    Description: ${job.description}

    Please generate a concise, relevant CV.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // cheaper and faster model
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500, // reduced tokens
      temperature: 0.7,
    });

    const cv =
      completion.choices[0].message && completion.choices[0].message.content
        ? completion.choices[0].message.content.trim()
        : "";

    return NextResponse.json({ cv });
  } catch (error: any) {
    console.error("Error generating CV:", error);

    // Check if quota exceeded
    if (error.status === 429) {
      return NextResponse.json(
        { error: "API quota exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate CV. Please try again later." },
      { status: 500 }
    );
  }
}
