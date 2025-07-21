"use client";

import { useEffect, useRef, useState } from "react";
import parse from "html-react-parser";
import Link from "next/link";
import DOMPurify from "dompurify";
import toast from "react-hot-toast";

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
  const [tipsCache, setTipsCache] = useState<Record<string, string>>({});
  const [cvCache, setCvCache] = useState<Record<string, string>>({});
  const [activeModal, setActiveModal] = useState<{ jobId: string; type: "cv" | "tips" } | null>(
    null
  );
  const [modalContent, setModalContent] = useState<string>("");
  const [buttonLoading, setButtonLoading] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError(null);
      try {
        const skillParams = skills.map((s) => `skills=${encodeURIComponent(s)}`).join("&");
        const whatParam = what ? `&what=${encodeURIComponent(what)}` : "";
        const countryParam = country ? `&country=${encodeURIComponent(country)}` : "";
        const res = await fetch(`/api/jobs?${skillParams}${whatParam}${countryParam}`);
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

  const handleTipsClick = async (job: Job) => {
    if (tipsCache[job.id]) {
      openModal(job.id, "tips", tipsCache[job.id]);
      return;
    }

    setButtonLoading(`tips-${job.id}`);
    toast.loading("Generating tips...", { id: `tips-${job.id}` });

    try {
      const res = await fetch("/api/ai/improve-chances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job }),
      });
      const data = await res.json();
      const content = data.tips || data.error || "No response";
      setTipsCache((prev) => ({ ...prev, [job.id]: content }));
      openModal(job.id, "tips", content);
      toast.success("Tips generated!", { id: `tips-${job.id}` });
    } catch (err) {
      toast.error("Failed to generate tips", { id: `tips-${job.id}` });
    } finally {
      setButtonLoading(null);
    }
  };

  const handleCvClick = async (job: Job) => {
    if (cvCache[job.id]) {
      openModal(job.id, "cv", cvCache[job.id]);
      return;
    }

    setButtonLoading(`cv-${job.id}`);
    toast.loading("Generating CV...", { id: `cv-${job.id}` });

    try {
      const res = await fetch("/api/ai/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job }),
      });
      const data = await res.json();
      const content = data.cv || data.error || "No response";
      setCvCache((prev) => ({ ...prev, [job.id]: content }));
      openModal(job.id, "cv", content);
      toast.success("AI CV generated!", { id: `cv-${job.id}` });
    } catch (err) {
      toast.error("Failed to generate CV", { id: `cv-${job.id}` });
    } finally {
      setButtonLoading(null);
    }
  };

  const openModal = (jobId: string, type: "cv" | "tips", content: string) => {
    setModalContent(content);
    setActiveModal({ jobId, type });
    setTimeout(() => {
      modalRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

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
                className={`text-2xl transition-colors ${
                  isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"
                }`}
              >
                {isFavorite ? "❤️" : "🤍"}
              </button>
            </div>

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

            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={job.redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Apply
              </a>

              <button
                className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 flex items-center"
                onClick={() => handleCvClick(job)}
              >
                {buttonLoading === `cv-${job.id}` ? "Loading..." : "Generate AI CV"}
              </button>

              <button
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center"
                onClick={() => handleTipsClick(job)}
              >
                {buttonLoading === `tips-${job.id}` ? "Loading..." : "How to increase my chances?"}
              </button>
            </div>
          </div>
        );
      })}

      {activeModal && (
        <div
          ref={modalRef}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white text-black max-w-2xl w-full p-6 rounded-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-2 right-3 text-xl text-gray-600 hover:text-black"
            >
              ×
            </button>
            <h3 className="text-lg font-bold mb-4">
              {activeModal.type === "cv" ? "Generated AI CV" : "Personalized Job Tips"}
            </h3>
            <pre className="whitespace-pre-wrap">{modalContent}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
