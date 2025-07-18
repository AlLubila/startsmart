"use client";

import { useEffect, useState } from "react";

type Job = {
  id: string;
  title: string;
  company: string;
  country: string;
  location: string;
  city?: string;
  remoteType?: "remote" | "onsite" | "hybrid";
  postedDate: string;
  description: string;
  redirectUrl: string;
  tags?: string[];
  matchPercentage?: number;
};

type Props = {
  country: string; // Ignoré maintenant
  skills: string[];
  what: string;
  sortBy: "newest" | "oldest";
  favorites: Record<string, boolean>;
  toggleFavorite: (id: string) => void;
};

export default function JobSuggestions({
  skills,
  what,
  sortBy,
  favorites,
  toggleFavorite,
}: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError(null);

      try {
        const skillParams = skills.map((s) => `skills=${encodeURIComponent(s)}`).join("&");
        const whatParam = what ? `&what=${encodeURIComponent(what)}` : "";

        const url = `/api/jobs?${skillParams}${whatParam}`;
        const res = await fetch(url);

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data: Job[] = await res.json();

        const enriched = data.map((job) => ({
          ...job,
          matchPercentage: job.matchPercentage ?? 0,
        }));

        enriched.sort((a, b) => {
          const dateA = new Date(a.postedDate).getTime();
          const dateB = new Date(b.postedDate).getTime();
          return sortBy === "newest" ? dateB - dateA : dateA - dateB;
        });

        setJobs(enriched);
      } catch (err) {
        setError((err as Error).message || "Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    }

    if (skills.length > 0) {
      fetchJobs();
    } else {
      setJobs([]);
      setLoading(false);
    }
  }, [skills, what, sortBy]);

  return (
    <div className="mt-10 space-y-4">
      <h2 className="text-xl font-bold">Suggested Jobs</h2>

      {loading && <p>Loading job offers...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && jobs.length === 0 && <p>No matching jobs found.</p>}

      {jobs.map((job) => {
        const isFavorite = favorites[job.id] || false;

        return (
          <div
            key={job.id}
            className="relative block p-4 bg-gray-800 rounded hover:bg-gray-700 transition"
          >
            <a
              href={job.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <h3 className="font-semibold">{job.title}</h3>
              <p className="text-sm text-gray-300">
                {job.company} – {job.city || job.location}
                {job.remoteType && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-600 text-xs rounded">
                    {job.remoteType === "remote"
                      ? "Remote"
                      : job.remoteType === "onsite"
                      ? "On-site"
                      : "Hybrid"}
                  </span>
                )}
              </p>
              <p className="text-xs mt-1 text-gray-400">
                {job.description.slice(0, 120)}...
              </p>
              {job.matchPercentage !== undefined && (
                <p className="text-xs mt-1 text-green-400">
                  🔍 Match (future IA): {Math.round(job.matchPercentage)}%
                </p>
              )}
              <p className="text-xs mt-1 text-gray-400">
                Posted on: {new Date(job.postedDate).toLocaleDateString()}
              </p>
            </a>

            <button
              onClick={() => toggleFavorite(job.id)}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              className={`absolute top-3 right-3 text-2xl transition-colors ${
                isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"
              }`}
              type="button"
            >
              {isFavorite ? "❤️" : "🤍"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
