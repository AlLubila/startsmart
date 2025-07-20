"use client";

import { useEffect, useState } from "react";
import parse from "html-react-parser";
import Link from "next/link";
import DOMPurify from "dompurify"; // optional: to clean the HTML

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
  country: string;
  skills: string[];
  what: string;
  sortBy: "newest" | "oldest";
  favorites: Record<string, boolean>;
  toggleFavorite: (id: string) => void;
};

export default function JobSuggestions({
  country,
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
        const skillParams = skills
          .map((s) => `skills=${encodeURIComponent(s)}`)
          .join("&");
        const whatParam = what ? `&what=${encodeURIComponent(what)}` : "";
        const countryParam = country
          ? `&country=${encodeURIComponent(country)}`
          : "";

        const url = `/api/jobs?${skillParams}${whatParam}${countryParam}`;
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
  }, [skills, what, sortBy, country]);

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
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <Link
                  href={job.redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-blue-400 hover:underline"
                >
                  {job.title}
                </Link>
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
                  Posted on: {new Date(job.postedDate).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => toggleFavorite(job.id)}
                aria-label={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
                className={`text-2xl transition-colors ${
                  isFavorite
                    ? "text-red-500"
                    : "text-gray-400 hover:text-red-500"
                }`}
                type="button"
              >
                {isFavorite ? "❤️" : "🤍"}
              </button>
            </div>

            {/* ✅ Render HTML safely without <a> tags */}
            <div className="text-xs mt-2 text-gray-400 line-clamp-4">
              {parse(
                DOMPurify.sanitize(job.description, {
                  ALLOWED_TAGS: ["b", "strong", "i", "em", "p", "ul", "li", "br"],
                  ALLOWED_ATTR: [],
                })
              )}
            </div>

            {job.matchPercentage !== undefined && (
              <p className="text-xs mt-1 text-green-400">
                🔍 Match (future AI): {Math.round(job.matchPercentage)}%
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
