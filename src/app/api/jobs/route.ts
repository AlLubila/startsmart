import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { fetchAdzunaJobs } from "../../../../lib/adzunaClient";

function calculateMatchPercentage(jobSkills: string[], userSkills: string[]) {
  if (!jobSkills || jobSkills.length === 0) return 0;

  const lowerJobSkills = jobSkills.map((j) => j.toLowerCase());
  const lowerUserSkills = userSkills.map((s) => s.toLowerCase());

  const matches = lowerUserSkills.filter((s) =>
    lowerJobSkills.some((j) => j.includes(s) || s.includes(j))
  );

  const score = (matches.length / jobSkills.length) * 100;

  return Math.min(Math.round(score), 100);
}

function formatJob(job: any, userSkills: string[] = []) {
  return {
    id: job._id ? job._id.toString() : job.id || "",
    title: job.title,
    company: job.company,
    country: job.country,
    location: job.location,
    city: job.city,
    remoteType: job.remoteType,
    postedDate: job.postedAt
      ? job.postedAt.toISOString()
      : job.postedDate || null,
    description: job.description,
    redirectUrl: job.redirectUrl || "",
    matchPercentage: calculateMatchPercentage(job.tags || [], userSkills),
  };
}

// 🌍 Localisation IP fallback
async function detectCountryFromIP(ip: string | null): Promise<string> {
  if (!ip) return "fr";
  try {
    const res = await fetch(`https://ipapi.co/${ip}/country/`);
    if (!res.ok) return "fr";
    return (await res.text()).toLowerCase();
  } catch {
    return "fr";
  }
}

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("startsmartdb");
    const jobsCollection = db.collection("jobs");

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const rawCountry = searchParams.get("country");
    const location = searchParams.get("location") || "";
    const what = searchParams.get("what") || "";
    const skills = searchParams.getAll("skills");
    const page = parseInt(searchParams.get("page") || "1");

    // 📍 IP localisation
    const ip =
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      null;

    const country = rawCountry || (await detectCountryFromIP(ip));

    if (id) {
      const job = await jobsCollection.findOne({ _id: new ObjectId(id) });
      if (!job) return NextResponse.json(null, { status: 404 });
      return NextResponse.json(formatJob(job, skills));
    }

    const mongoFilter: any = {};
    if (country) mongoFilter.country = country.toLowerCase();

    if (location)
      mongoFilter.location = { $regex: new RegExp(location, "i") };

    if (what) {
      mongoFilter.$or = [
        { title: { $regex: new RegExp(what, "i") } },
        { description: { $regex: new RegExp(what, "i") } },
      ];
    }

    if (skills.length > 0)
      mongoFilter.tags = {
        $all: skills.map((s) => new RegExp(s, "i")),
      };

    const jobsFromDB = await jobsCollection.find(mongoFilter).toArray();

    if (jobsFromDB.length > 0) {
      const jobsFormatted = jobsFromDB.map((job) =>
        formatJob(job, skills)
      );
      return NextResponse.json(jobsFormatted);
    }

    // 🌐 Fallback : Adzuna
    const adzunaQuery: {
      country: string;
      what?: string;
      skills?: string[];
      location?: string;
      page?: number;
    } = { country, page };

    if (what) adzunaQuery.what = what;
    if (location) adzunaQuery.location = location;
    if (skills.length > 0) adzunaQuery.skills = skills;

    const adzunaJobs = await fetchAdzunaJobs(adzunaQuery);
    const jobsArray = Array.isArray(adzunaJobs.results)
      ? adzunaJobs.results
      : [];

    // Tu peux enrichir ici aussi le match pour Adzuna si leurs jobs ont des tags
    const enrichedAdzunaJobs = jobsArray.map((job: any) =>
      formatJob(job, skills)
    );

    return NextResponse.json(enrichedAdzunaJobs);
  } catch (error) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("startsmartdb");
    const jobsCollection = db.collection("jobs");

    const job = await request.json();

    if (!job.title || !job.company || !job.description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await jobsCollection.insertOne({
      ...job,
      postedAt: new Date(),
    });

    return NextResponse.json({
      message: "Job added",
      jobId: result.insertedId,
    });
  } catch (error) {
    console.error("POST /api/jobs error:", error);
    return NextResponse.json({ error: "Could not add job" }, { status: 500 });
  }
}
