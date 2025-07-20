"use client";

import { useEffect, useState } from "react";
import JobSuggestions from "../app/components/JobSuggestions";
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

  // Country state with localStorage persistence
  const [country, setCountry] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

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

  useEffect(() => {
    // Try to get country from localStorage first
    const storedCountry = localStorage.getItem("userCountry");
    if (storedCountry) {
      setCountry(storedCountry);
      return; // no need to ask again
    }

    // If no stored country, ask for geolocation
    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported by your browser.");
      // fallback default
      setCountry("fr");
      localStorage.setItem("userCountry", "fr");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Using geocode.xyz API to get country code
          const res = await fetch(
            `https://geocode.xyz/${latitude},${longitude}?geoit=json`
          );
          if (!res.ok) throw new Error("Failed to fetch location info");
          const data = await res.json();
          if (data && data.country) {
            const countryCode = data.country.toLowerCase();
            setCountry(countryCode);
            localStorage.setItem("userCountry", countryCode);
            setLocationError(null);
          } else {
            setLocationError(
              "Unable to detect your country from your location."
            );
            // fallback
            setCountry("fr");
            localStorage.setItem("userCountry", "fr");
          }
        } catch {
          setLocationError("Failed to fetch country info.");
          setCountry("fr");
          localStorage.setItem("userCountry", "fr");
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            "Please enable location access to get job suggestions for your country."
          );
        } else {
          setLocationError("Failed to get your location.");
        }
        // fallback country
        setCountry("fr");
        localStorage.setItem("userCountry", "fr");
      }
    );
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

      <div className="flex justify-end mb-6">
        <button
          onClick={toggleSortDirection}
          className="border px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
        >
          Sort by date: {sortDirection === "newest" ? "↓ Newest" : "↑ Oldest"}
        </button>
      </div>

      {loadingProfile && <p>Loading profile...</p>}
      {errorProfile && (
        <div className="bg-red-600 p-2 rounded text-white">{errorProfile}</div>
      )}

      {locationError && (
        <div className="bg-yellow-400 p-4 rounded mb-4 text-black">
          {locationError}
        </div>
      )}

      {/* Show suggestions only if profile & country exist */}
      {profile && country && (
        <JobSuggestions
          country={country}
          skills={profile.skills}
          what={combinedWhat}
          sortBy={sortDirection}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      )}

      {/* If location error, optionally show message or fallback */}
      {!country && !locationError && <p>Detecting your location...</p>}
    </div>
  );
}
