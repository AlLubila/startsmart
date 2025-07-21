'use client';

import React from "react";
import JobSuggestions from "@/app/components/JobSuggestions";
import { useFavorites } from "../../context/FavoritesContext";

export default function FavoritesPage() {
  const { favorites, toggleFavorite, loading } = useFavorites();

  const favoriteJobs = Object.values(favorites);

  if (loading) return <p>Loading favorites...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Favorite Jobs</h1>
      {favoriteJobs.length === 0 ? (
        <p>You have no favorite jobs yet.</p>
      ) : (
        <JobSuggestions
          jobs={favoriteJobs}
          sortBy="newest"
        />
      )}
    </div>
  );
}
