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
    Provide 5 personalized tips to improve the chances of getting hired for the following job:

    Job Title: ${job.title}
    Company: ${job.company}
    Location: ${job.location}
    Description: ${job.description}

    Give practical advice tailored to this position.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // cheaper and faster
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    const tips =
      completion.choices[0].message && completion.choices[0].message.content
        ? completion.choices[0].message.content.trim()
        : "";

    return NextResponse.json({ tips });
  } catch (error: any) {
    console.error("Error generating tips:", error);

    if (error.status === 429) {
      return NextResponse.json(
        { error: "API quota exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate tips. Please try again later." },
      { status: 500 }
    );
  }
}
