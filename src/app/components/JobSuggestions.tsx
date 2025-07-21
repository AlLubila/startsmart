'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useFavorites } from '@/context/FavoritesContext';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  redirectUrl: string;
};

type SortDirection = 'newest' | 'oldest';

type JobSuggestionsProps = {
  jobs?: Job[];
  sortBy?: SortDirection;
};

// Dummy implementations (replace with your own)
const downloadPdf = (title: string, content: string) => {
  console.log(`Downloading PDF for ${title}`, content);
};

const openModal = (jobId: string, modalType: string, content: string) => {
  alert(`Modal (${modalType}) for job ${jobId}:\n\n${content}`);
};

export default function JobSuggestions({
  jobs = [],
  sortBy = 'newest',
}: JobSuggestionsProps) {
  const { favorites, toggleFavorite } = useFavorites();
  const [cvCache, setCvCache] = useState<Record<string, string>>({});
  const [tipsCache, setTipsCache] = useState<Record<string, string>>({});
  const [buttonLoading, setButtonLoading] = useState<string | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      const aId = String(a.id ?? '');
      const bId = String(b.id ?? '');
      if (sortBy === 'newest') return bId.localeCompare(aId);
      if (sortBy === 'oldest') return aId.localeCompare(bId);
      return 0;
    });
  }, [jobs, sortBy]);

  const handleCvClick = async (job: Job) => {
    if (cvCache[job.id]) {
      downloadPdf(job.title, cvCache[job.id]);
      return;
    }

    setButtonLoading(`cv-${job.id}`);
    toast.loading('Generating CV...', { id: `cv-${job.id}` });

    try {
      const res = await fetch('/api/ai/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate CV');
      }

      setCvCache((prev) => ({ ...prev, [job.id]: data.cv }));
      downloadPdf(job.title, data.cv);
      toast.success('AI CV generated and downloaded!', { id: `cv-${job.id}` });
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate CV', { id: `cv-${job.id}` });
    } finally {
      setButtonLoading(null);
    }
  };

  const handleTipsClick = async (job: Job) => {
    if (tipsCache[job.id]) {
      openModal(job.id, 'tips', tipsCache[job.id]);
      return;
    }

    setButtonLoading(`tips-${job.id}`);
    toast.loading('Generating tips...', { id: `tips-${job.id}` });

    try {
      const res = await fetch('/api/ai/improve-chances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate tips');
      }

      setTipsCache((prev) => ({ ...prev, [job.id]: data.tips }));
      openModal(job.id, 'tips', data.tips);
      toast.success('Tips generated!', { id: `tips-${job.id}` });
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate tips', { id: `tips-${job.id}` });
    } finally {
      setButtonLoading(null);
    }
  };

  const handleFavoriteClick = async (job: Job) => {
    setFavoriteLoading(job.id);
    const isFav = !!favorites[job.id];
    try {
      await toggleFavorite(job);
      toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
    } catch (err) {
      toast.error('Error updating favorites');
      console.error(err);
    } finally {
      setFavoriteLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 text-gray-300 font-sans">
      {sortedJobs.length === 0 && (
        <p className="text-center text-lg text-gray-500 mt-16">No jobs available.</p>
      )}

      {sortedJobs.map((job) => (
        <article
          key={job.id}
          tabIndex={0}
          aria-label={`Job listing: ${job.title} at ${job.company}`}
          className="bg-gray-900 rounded-xl p-6 mb-6 shadow-lg shadow-black/70 focus:outline-none focus:ring-4 focus:ring-blue-500 hover:shadow-blue-500/50 transition-transform transform hover:-translate-y-1"
        >
          <header className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-purple-400">{job.title}</h2>
            <button
              onClick={() => handleFavoriteClick(job)}
              disabled={favoriteLoading === job.id}
              aria-pressed={!!favorites[job.id]}
              aria-label={favorites[job.id] ? 'Remove from favorites' : 'Add to favorites'}
              className="text-2xl focus:outline-none"
            >
              {favorites[job.id] ? '★' : '☆'}
            </button>
          </header>

          <p className="text-gray-400 mb-5 select-none">
            {job.company} <span className="mx-2 text-gray-600">•</span> {job.location}
          </p>

          <div className="flex flex-wrap gap-4 mt-4">
            <button
              onClick={() => handleCvClick(job)}
              disabled={buttonLoading === `cv-${job.id}`}
              className={`px-5 py-2 rounded-lg text-white bg-blue-600 shadow-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex-1 min-w-[140px] ${
                buttonLoading === `cv-${job.id}` ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {buttonLoading === `cv-${job.id}` ? 'Generating CV...' : 'Generate CV'}
            </button>

            <button
              onClick={() => handleTipsClick(job)}
              disabled={buttonLoading === `tips-${job.id}`}
              className={`px-5 py-2 rounded-lg border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-gray-900 disabled:border-gray-600 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex-1 min-w-[140px] ${
                buttonLoading === `tips-${job.id}` ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {buttonLoading === `tips-${job.id}` ? 'Generating Tips...' : 'Get Tips'}
            </button>

            <a
              href={job.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-lg text-white bg-green-600 shadow-md hover:bg-green-700 transition-colors duration-200 flex-1 min-w-[140px] text-center cursor-pointer"
            >
              Apply
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
