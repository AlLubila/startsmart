'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Sparkles, Download, Lightbulb, Star, StarOff } from 'lucide-react';

type Job = {
  id: string | number;
  title: string;
  company: string;
  location: string;
  description: string;
};

type SortDirection = 'newest' | 'oldest';

type JobSuggestionsProps = {
  jobs?: Job[];
  sortBy?: SortDirection;
  favorites?: Record<string, boolean>;
  toggleFavorite?: (id: string) => void;
};

const downloadPdf = (title: string, content: string) => {
  console.log(`Downloading PDF for ${title}`, content);
};

const openModal = (jobId: string | number, modalType: string, content: string) => {
  alert(`Modal (${modalType}) for job ${jobId}:\n\n${content}`);
};

export default function JobSuggestions({
  jobs = [],
  sortBy = 'newest',
  favorites = {},
  toggleFavorite = () => {},
}: JobSuggestionsProps) {
  const [cvCache, setCvCache] = useState<Record<string, string>>({});
  const [tipsCache, setTipsCache] = useState<Record<string, string>>({});
  const [buttonLoading, setButtonLoading] = useState<string | null>(null);

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      const aId = String(a.id);
      const bId = String(b.id);
      return sortBy === 'newest'
        ? bId.localeCompare(aId)
        : aId.localeCompare(bId);
    });
  }, [jobs, sortBy]);

  const handleCvClick = async (job: Job) => {
    const jobIdStr = String(job.id);
    if (cvCache[jobIdStr]) {
      downloadPdf(job.title, cvCache[jobIdStr]);
      return;
    }

    setButtonLoading(`cv-${jobIdStr}`);
    toast.loading('Generating CV...', { id: `cv-${jobIdStr}` });

    try {
      const res = await fetch('/api/ai/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to generate CV');

      setCvCache((prev) => ({ ...prev, [jobIdStr]: data.cv }));
      downloadPdf(job.title, data.cv);
      toast.success('AI CV generated and downloaded!', { id: `cv-${jobIdStr}` });
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate CV', { id: `cv-${jobIdStr}` });
    } finally {
      setButtonLoading(null);
    }
  };

  const handleTipsClick = async (job: Job) => {
    const jobIdStr = String(job.id);
    if (tipsCache[jobIdStr]) {
      openModal(job.id, 'tips', tipsCache[jobIdStr]);
      return;
    }

    setButtonLoading(`tips-${jobIdStr}`);
    toast.loading('Generating tips...', { id: `tips-${jobIdStr}` });

    try {
      const res = await fetch('/api/ai/improve-chances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to generate tips');

      setTipsCache((prev) => ({ ...prev, [jobIdStr]: data.tips }));
      openModal(job.id, 'tips', data.tips);
      toast.success('Tips generated!', { id: `tips-${jobIdStr}` });
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate tips', { id: `tips-${jobIdStr}` });
    } finally {
      setButtonLoading(null);
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {sortedJobs.length === 0 ? (
        <p className="text-gray-500 col-span-full text-center mt-8">No jobs available.</p>
      ) : (
        sortedJobs.map((job) => {
          const jobIdStr = String(job.id);
          const isFavorited = favorites[jobIdStr];

          return (
            <div
              key={jobIdStr}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
              <p className="text-sm text-gray-600 mb-4">{job.company} • {job.location}</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleCvClick(job)}
                  disabled={buttonLoading === `cv-${jobIdStr}`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  <Download size={16} />
                  {buttonLoading === `cv-${jobIdStr}` ? 'Generating...' : 'Generate CV'}
                </button>

                <button
                  onClick={() => handleTipsClick(job)}
                  disabled={buttonLoading === `tips-${jobIdStr}`}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-xl text-sm hover:bg-yellow-600 disabled:opacity-60"
                >
                  <Lightbulb size={16} />
                  {buttonLoading === `tips-${jobIdStr}` ? 'Generating...' : 'Get Tips'}
                </button>

                <button
                  onClick={() => toggleFavorite(jobIdStr)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${
                    isFavorited
                      ? 'bg-pink-600 text-white hover:bg-pink-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-pressed={isFavorited}
                >
                  {isFavorited ? <Star size={16} /> : <StarOff size={16} />}
                  {isFavorited ? 'Favorited' : 'Favorite'}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
