import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("startsmartdb");

    const collections = await db.listCollections().toArray();

    return NextResponse.json({ collections });
  } catch (error) {
    return NextResponse.json({ error: "Unable to connect to database" }, { status: 500 });
  }
}
