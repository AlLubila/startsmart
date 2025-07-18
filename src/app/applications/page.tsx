"use client";

import { useEffect, useState } from "react";

type Application = {
  _id: string;
  jobId: string;
  status: "pending" | "accepted" | "rejected" | string;
  createdAt: string;
  // Tu peux étendre avec plus de champs si besoin
};

type Job = {
  _id: string;
  title: string;
  company: string;
  description?: string;
  location?: string;
  tags?: string[];
};

// Spinner simple
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

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "";
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobsMap, setJobsMap] = useState<Record<string, Job>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FILTRE
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "accepted" | "rejected"
  >("all");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // MODAL
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      const appsRes = await fetch("/api/applications");
      if (!appsRes.ok) throw new Error("Failed to load applications.");
      const apps = await appsRes.json();
      setApplications(apps);

      const jobIds = [...new Set(apps.map((a: Application) => a.jobId))];
      const jobFetches = jobIds.map((id) =>
        fetch(`/api/jobs?id=${id}`).then((res) => res.json())
      );
      const jobs = await Promise.all(jobFetches);

      const map: Record<string, Job> = {};
      jobs.forEach((job) => {
        if (job?._id) map[job._id] = job;
      });
      setJobsMap(map);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrer les applications selon le statut
  const filteredApps =
    filterStatus === "all"
      ? applications
      : applications.filter((app) => app.status === filterStatus);

  // Pagination
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function openModal(app: Application) {
    setSelectedApp(app);
  }

  function closeModal() {
    setSelectedApp(null);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-4xl font-extrabold text-indigo-400">My Applications</h1>

        <button
          onClick={fetchData}
          disabled={loading}
          className={`text-indigo-400 font-semibold hover:text-indigo-600 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label="Refresh applications"
        >
          {loading ? (
            <Spinner />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582M20 20v-5h-.581M4 14a8 8 0 0113.998-3.366M20 10a8 8 0 01-13.998 3.366"
              />
            </svg>
          )}
        </button>
      </div>

      {/* FILTRES */}
      <div className="mb-6 flex gap-3 justify-center sm:justify-start">
        {["all", "pending", "accepted", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilterStatus(status as any);
              setCurrentPage(1); // reset page
            }}
            className={`px-4 py-2 rounded-full font-semibold capitalize transition
              ${
                filterStatus === status
                  ? "bg-indigo-500 text-white shadow-lg"
                  : "bg-gray-700 text-gray-400 hover:bg-indigo-600 hover:text-white"
              }
            `}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center font-semibold">{error}</p>
      ) : filteredApps.length === 0 ? (
        <p className="text-gray-400 text-center text-lg mt-20">
          No applications found.
        </p>
      ) : (
        <>
          <ul className="space-y-5">
            {paginatedApps.map((app) => {
              const job = jobsMap[app.jobId];
              return (
                <li
                  key={app._id}
                  className="p-5 rounded-2xl bg-gray-800 border border-gray-700 shadow-sm hover:shadow-indigo-500 transition cursor-pointer"
                  tabIndex={0}
                  aria-label={`Application for ${job?.title || "Unknown job"} at ${job?.company || "unknown company"
                    }, status: ${app.status}`}
                  onClick={() => openModal(app)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      openModal(app);
                    }
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-semibold text-indigo-300">
                        {job?.title || "Unknown Title"}
                      </h2>
                      <p className="text-gray-400 mt-1">{job?.company || "Unknown Company"}</p>
                    </div>
                    <span
                      className={`px-4 py-2 text-sm rounded-full font-semibold select-none ${
                        app.status === "pending"
                          ? "bg-yellow-500 text-yellow-900"
                          : app.status === "accepted"
                          ? "bg-green-600 text-green-100"
                          : "bg-red-600 text-red-100"
                      } capitalize`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <p className="text-gray-400 mt-3 text-sm">
                    Applied {timeAgo(app.createdAt)}
                  </p>
                </li>
              );
            })}
          </ul>

          {/* Pagination controls */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={`px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Previous
            </button>
            <span className="text-gray-400 pt-2">
              Page {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={`px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* MODAL */}
      {selectedApp && (
        <Modal onClose={closeModal}>
          <h2 className="text-3xl font-bold mb-4 text-indigo-400">
            {jobsMap[selectedApp.jobId]?.title || "Unknown Job"}
          </h2>
          <p className="text-gray-400 mb-2">
            Company: {jobsMap[selectedApp.jobId]?.company || "Unknown"}
          </p>
          <p className="text-gray-300 mb-4 whitespace-pre-line">
            {jobsMap[selectedApp.jobId]?.description || "No description available."}
          </p>
          {jobsMap[selectedApp.jobId]?.location && (
            <p className="text-gray-400 mb-2">Location: {jobsMap[selectedApp.jobId]?.location}</p>
          )}
          {jobsMap[selectedApp.jobId]?.tags && (
            <div className="flex flex-wrap gap-2 mb-4">
              {jobsMap[selectedApp.jobId]?.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-indigo-700 px-3 py-1 rounded-full text-indigo-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-gray-300 mb-2">
            Status:{" "}
            <span
              className={`font-semibold capitalize ${
                selectedApp.status === "pending"
                  ? "text-yellow-500"
                  : selectedApp.status === "accepted"
                  ? "text-green-400"
                  : "text-red-500"
              }`}
            >
              {selectedApp.status}
            </span>
          </p>
          <p className="text-gray-400 mb-6">
            Applied on: {new Date(selectedApp.createdAt).toLocaleString()}
          </p>

          <button
            onClick={closeModal}
            className="mt-4 px-6 py-2 bg-indigo-600 rounded hover:bg-indigo-700 text-white font-semibold transition"
          >
            Close
          </button>
        </Modal>
      )}
    </div>
  );
}

// Modal simple avec overlay sombre
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  // Fermer au clavier (Esc)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-70 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gray-900 rounded-xl max-w-xl w-full p-8 shadow-lg max-h-[80vh] overflow-auto">
          {children}
        </div>
      </div>
    </>
  );
}
