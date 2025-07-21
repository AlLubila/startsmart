import { NextResponse } from "next/server";
import clientPromise from "@/../lib/mongodb";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  req: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobId = params.jobId;
    const client = await clientPromise;
    const db = client.db("startsmartdb");
    const applications = db.collection("applications");

    // Match the exact structure used in POST
    const query = {
      userId,
      "job.id": String(jobId) // Consistent with POST operation
    };

    const deleteResult = await applications.deleteOne(query);
    
    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}