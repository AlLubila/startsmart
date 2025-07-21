"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  redirectUrl: string;
};

type FavoritesContextType = {
  favorites: Record<string, Job>;
  toggleFavorite: (job: Job) => Promise<void>;
  loading: boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Record<string, Job>>({});
  const [loading, setLoading] = useState(true);

  // Fetch favorites from /api/favorites (GET)
  useEffect(() => {
    async function loadFavorites() {
      try {
        const res = await fetch("/api/favorites");
        const data: { job: Job }[] = await res.json(); // MongoDB returns objects with `.job`

        const favs: Record<string, Job> = {};
        data.forEach((entry) => {
          favs[entry.job.id] = entry.job;
        });

        setFavorites(favs);
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

const toggleFavorite = async (job: Job) => {
  const isFavorited = Boolean(favorites[job.id]);

  try {
    if (isFavorited) {
      const res = await fetch(`/api/favorites/${job.id}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Delete error details:", errorData);
        throw new Error(errorData.error || "Failed to remove favorite");
      }

      setFavorites(prev => {
        const newFavorites = { ...prev };
        delete newFavorites[job.id];
        return newFavorites;
      });
    } else {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job }),
      });
      
      if (!res.ok) throw new Error("Failed to add favorite");
      
      setFavorites(prev => ({ ...prev, [job.id]: job }));
    }
  } catch (err) {
    console.error("Error toggling favorite:", err);
    // Optionally show error to user
  }
};


  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
