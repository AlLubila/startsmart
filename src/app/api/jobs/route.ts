import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { fetchAdzunaJobs } from "../../../../lib/adzunaClient";
import { fetchRemoteOKJobs } from "../../../../lib/remoteokClient";
import { fetchJoobleJobs } from "../../../../lib/joobleClient"; // Optional if Jooble is enabled

function calculateMatchPercentage(jobSkills: string[], userSkills: string[]) {
  if (!jobSkills || jobSkills.length === 0) return 0;
  const lowerJobSkills = jobSkills.map((j) => j.toLowerCase());
  const lowerUserSkills = userSkills.map((s) => s.toLowerCase());

  const matches = lowerUserSkills.filter((s) =>
    lowerJobSkills.some((j) => j.includes(s) || s.includes(j))
  );

  return Math.min(Math.round((matches.length / jobSkills.length) * 100), 100);
}

function formatJob(job: any, userSkills: string[] = []) {
  return {
    id: job._id ? job._id.toString() : job.id || "",
    title: job.title,
    company: job.company,
    country: job.country || "",
    location: job.location || "",
    city: job.city || "",
    remoteType: job.remoteType || "",
    postedDate: job.postedAt
      ? job.postedAt.toISOString()
      : job.postedDate || null,
    description: job.description,
    redirectUrl: job.redirectUrl || "",
    matchPercentage: calculateMatchPercentage(job.tags || [], userSkills),
  };
}

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

// Supported country mapping for Adzuna
const countryNameToCode: Record<string, string> = {
  austria: "at",
  australia: "au",
  belgium: "be",
  brazil: "br",
  canada: "ca",
  switzerland: "ch",
  germany: "de",
  spain: "es",
  france: "fr",
  "united kingdom": "gb",
  india: "in",
  italy: "it",
  mexico: "mx",
  netherlands: "nl",
  newzealand: "nz",
  poland: "pl",
  singapore: "sg",
  "united states": "us",
  southafrica: "za",
};

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

    const ip =
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      null;

    const detectedCountry = await detectCountryFromIP(ip);
    const country = rawCountry || detectedCountry;
    const countryCode = countryNameToCode[country.toLowerCase()] || "fr";

    // If a specific job is requested by ID
    if (id) {
      try {
        const job = await jobsCollection.findOne({ _id: new ObjectId(id) });
        if (!job) return NextResponse.json(null, { status: 404 });
        return NextResponse.json(formatJob(job, skills));
      } catch {
        return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
      }
    }

    // MongoDB Query
    const mongoFilter: any = {};
    if (country) mongoFilter.country = country.toLowerCase();
    if (location) mongoFilter.location = { $regex: new RegExp(location, "i") };
    if (what) {
      mongoFilter.$or = [
        { title: { $regex: new RegExp(what, "i") } },
        { description: { $regex: new RegExp(what, "i") } },
      ];
    }
    if (skills.length > 0) {
      mongoFilter.tags = { $in: skills.map((s) => new RegExp(s, "i")) };
    }

    const jobsFromDB = await jobsCollection.find(mongoFilter).toArray();
    const combined: any[] = [];

    if (jobsFromDB.length > 0) {
      const jobsFormatted = jobsFromDB.map((job) =>
        formatJob(job, skills)
      );
      combined.push(...jobsFormatted);
    }

    // Fallback to Adzuna
    if (combined.length < 10) {
      try {
        const adzunaJobs = await fetchAdzunaJobs({
          country: countryCode,
          what,
          location,
          skills,
          page,
        });

        const adzunaFormatted = (adzunaJobs.results || []).map((job: any) =>
          formatJob(job, skills)
        );
        combined.push(...adzunaFormatted.slice(0, 10));
      } catch (e) {
        console.error("Adzuna fetch failed:", e);
      }
    }

    // Fallback to RemoteOK
    if (combined.length < 10) {
      try {
        const remoteOKJobs = await fetchRemoteOKJobs(skills);
        const remoteOKFormatted = remoteOKJobs.map((job: any) => ({
          id: job.id?.toString() || job.url,
          title: job.position || job.title,
          company: job.company,
          country: "remote",
          location: job.location || "Remote",
          city: "",
          remoteType: "remote",
          postedDate: job.date || null,
          description: job.description || "",
          redirectUrl: job.url || "",
          matchPercentage: calculateMatchPercentage(job.tags || [], skills),
        }));
        combined.push(...remoteOKFormatted.slice(0, 10));
      } catch (e) {
        console.error("RemoteOK fetch failed:", e);
      }
    }

    // Optional: Jooble
    
    if (combined.length < 10) {
      try {
        const joobleJobs = await fetchJoobleJobs({ country, what, skills });
        const joobleFormatted = joobleJobs.map((job: any) => ({
          id: job.id || job.link,
          title: job.title,
          company: job.company || "Unknown",
          country,
          location: job.location,
          city: "",
          remoteType: job.type?.includes("Remote") ? "remote" : undefined,
          postedDate: job.updated || null,
          description: job.snippet || "",
          redirectUrl: job.link,
          matchPercentage: calculateMatchPercentage([], skills),
        }));
        combined.push(...joobleFormatted.slice(0, 10));
      } catch (e) {
        console.error("Jooble fetch failed:", e);
      }
    }
    

    return NextResponse.json(combined);
  } catch (error) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json(
      { error: "Server error while fetching jobs." },
      { status: 500 }
    );
  }
}
