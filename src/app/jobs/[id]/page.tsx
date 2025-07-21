"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  country: string;
  redirectUrl: string;
  // add more fields if necessary
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch job");
        const data = await res.json();
        setJob(data.job);
      } catch (err) {
        setError("Job not found");
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [params.id]);

  if (loading) return <p>Loading job details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!job) return <p>No job found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 bg-gray-800 rounded-md">
      <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
      <p className="mb-2">
        <strong>Location:</strong> {job.location}, {job.country}
      </p>
      <p className="mb-6 whitespace-pre-wrap">{job.description}</p>

      <a
        href={job.redirectUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Apply for this job
      </a>
    </div>
  );
}
