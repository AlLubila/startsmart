'use client';

import { useEffect, useState } from 'react';
import JobSuggestions from '../app/components/JobSuggestions';
import { fetchWithErrorHandling } from '../../utils/fetchWithErrorHandling';
import { detectUserCountry } from '../../utils/geoUtils';

type Profile = {
  skills: string[];
  bio: string;
  experience: { title: string; company: string }[];
  education: { degree: string }[];
};

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
   redirectUrl: string; 
};

type SortDirection = 'newest' | 'oldest';

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('newest');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);

  const [country, setCountry] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [errorJobs, setErrorJobs] = useState<string | null>(null);

  // Fetch user profile on mount
  useEffect(() => {
    async function fetchProfile() {
      setLoadingProfile(true);
      setErrorProfile(null);
      try {
        const data = await fetchWithErrorHandling('/api/profile');
        console.log('Profile:', data);
        setProfile({
          skills: data.skills || [],
          bio: data.bio || '',
          experience: data.experience || [],
          education: data.education || [],
        });
      } catch {
        setErrorProfile('Failed to load profile');
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, []);

  // Detect user country on mount
  useEffect(() => {
    async function fetchCountry() {
      try {
        const code = await detectUserCountry();
        console.log('Country:', code);
        if (code) {
          setCountry(code);
          setLocationError(null);
        } else {
          setLocationError(
            'Unable to detect your country. Please enable location services or check your connection.'
          );
        }
      } catch (error: any) {
        if (
          error?.message?.toLowerCase().includes('permission') ||
          error?.code === 1 // GeolocationPositionError.PERMISSION_DENIED
        ) {
          setLocationError(
            'Location access denied. Please enable location permissions in your browser settings and reload the page.'
          );
        } else {
          setLocationError('Error detecting your location.');
        }
      }
    }

    fetchCountry();
  }, []);

  // Compose combinedWhat text for filtering/searching jobs
  const combinedWhat = profile
    ? [
        profile.bio,
        ...profile.experience.map((e) => e.title),
        ...profile.education.map((e) => e.degree),
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  // Fetch jobs when profile and country are ready
  useEffect(() => {
    async function fetchJobs() {
      if (!profile || !country) {
        console.log('No profile or country yet, skipping jobs fetch');
        return;
      }

      setLoadingJobs(true);
      setErrorJobs(null);

      try {
        const response = await fetch(
          `/api/jobs?country=${country}&skills=${encodeURIComponent(
            profile.skills.join(',')
          )}&what=${encodeURIComponent(combinedWhat)}&sort=${sortDirection}`
        );
        if (!response.ok) throw new Error('Failed to fetch jobs');

        const data = await response.json();

        console.log('Jobs API response:', data.jobs);

        setJobs(data.jobs || []);
      } catch (error: any) {
        setErrorJobs(error.message || 'Failed to load jobs');
      } finally {
        setLoadingJobs(false);
      }
    }

    fetchJobs();
  }, [profile, country, sortDirection, combinedWhat]);

  // Log when jobs state updates
  useEffect(() => {
    console.log('Jobs state changed:', jobs);
  }, [jobs]);

  // Toggle favorite job
  function toggleFavorite(id: string) {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  // Toggle sort direction for jobs
  function toggleSortDirection() {
    setSortDirection((prev) => (prev === 'newest' ? 'oldest' : 'newest'));
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Job Suggestions</h1>

      <div className="flex justify-end mb-6">
        <button
          onClick={toggleSortDirection}
          className="border px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
        >
          Sort by date: {sortDirection === 'newest' ? '↓ Newest' : '↑ Oldest'}
        </button>
      </div>

      {loadingProfile && <p>Loading profile...</p>}
      {errorProfile && (
        <div className="bg-red-600 p-2 rounded text-white">{errorProfile}</div>
      )}

      {locationError && (
        <div className="bg-yellow-400 p-4 rounded mb-4 text-black flex items-center">
          <span>{locationError}</span>
          <button
            onClick={() => {
              setLocationError(null);
              setCountry(null);
              detectUserCountry()
                .then((code) => {
                  if (code) {
                    setCountry(code);
                    setLocationError(null);
                  } else {
                    setLocationError(
                      'Still unable to detect your country. Please enable location services.'
                    );
                  }
                })
                .catch(() => {
                  setLocationError('Error detecting your location. Please try again.');
                });
            }}
            className="ml-4 px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Retry
          </button>
        </div>
      )}

      {loadingJobs && <p>Loading jobs...</p>}
      {errorJobs && <p className="text-red-600">{errorJobs}</p>}

      {/* Render JobSuggestions only when we have jobs */}
      {jobs.length > 0 ? (
        <JobSuggestions
          jobs={jobs}
          sortBy={sortDirection}
          favorites={favorites}          // <--- Pass favorites here
          toggleFavorite={toggleFavorite} // <--- Pass toggle function here
        />
      ) : (
        !loadingJobs && <p>No job suggestions available at the moment.</p>
      )}

      {!country && !locationError && <p>Detecting your location...</p>}
    </div>
  );
}
