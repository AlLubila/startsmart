"use client";

import { useEffect, useState } from "react";
import JobSuggestions from "../app/components/JobSuggestions"; // ajuste le chemin si besoin
import { fetchWithErrorHandling } from "../../utils/fetchWithErrorHandling";

type Profile = {
  skills: string[];
  bio: string;
  experience: { title: string; company: string }[];
  education: { degree: string }[];
};

type SortDirection = "newest" | "oldest";

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("newest");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoadingProfile(true);
      setErrorProfile(null);
      try {
        const data = await fetchWithErrorHandling("/api/profile");
        setProfile({
          skills: data.skills || [],
          bio: data.bio || "",
          experience: data.experience || [],
          education: data.education || [],
        });
      } catch {
        setErrorProfile("Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, []);

  const combinedWhat = profile
    ? [
        profile.bio,
        ...profile.experience.map((e) => e.title),
        ...profile.education.map((e) => e.degree),
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  function toggleFavorite(id: string) {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function toggleSortDirection() {
    setSortDirection((prev) => (prev === "newest" ? "oldest" : "newest"));
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Job Suggestions</h1>

      {/* Bouton de tri */}
      <div className="flex justify-end mb-6">
        <button
          onClick={toggleSortDirection}
          className="border px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
        >
          Sort by date: {sortDirection === "newest" ? "↓ Newest" : "↑ Oldest"}
        </button>
      </div>

      {loadingProfile && <p>Loading profile...</p>}
      {errorProfile && <div className="bg-red-600 p-2 rounded text-white">{errorProfile}</div>}

      {/* Suggestions auto selon le profil */}
      {profile && (
        <JobSuggestions
          country="" // vide = jobs globaux ou géré côté API
          skills={profile.skills}
          what={combinedWhat}
          sortBy={sortDirection}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}
