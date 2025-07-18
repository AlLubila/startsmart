"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Job = {
  _id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  tags: string[];
};

function Spinner() {
  return (
    <svg
      className="animate-spin h-8 w-8 text-indigo-500 mx-auto"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
      role="img"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );
}

export default function JobDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`/api/jobs?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Job not found");
        return res.json();
      })
      .then(setJob)
      .catch(() => {
        alert("Job not found");
        router.push("/");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!job) {
    return <p className="text-center text-gray-400 mt-20">Job not found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-indigo-400 mb-4">{job.title}</h1>
      <p className="text-gray-400 mb-1">
        <strong>Company:</strong> {job.company}
      </p>
      <p className="text-gray-400 mb-1">
        <strong>Location:</strong> {job.location}
      </p>
      <div className="my-4 whitespace-pre-wrap text-gray-300">{job.description}</div>
      <div className="flex flex-wrap gap-3 mb-6">
        {job.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs bg-indigo-700 text-indigo-100 rounded-full px-3 py-1 select-none"
          >
            #{tag}
          </span>
        ))}
      </div>

      <button
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg py-3 px-6 transition"
        onClick={() => window.open(`https://externaljobsite.com/job/${job._id}`, "_blank")}
        aria-label="Apply to this job"
      >
        Apply Now
      </button>
    </div>
  );
}
