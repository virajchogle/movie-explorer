"use client";

import { useCallback, useEffect, useState } from "react";
import type { Favorite, MovieSummary } from "@/lib/types";

const STORAGE_KEY = "movie-explorer:favorites";

function readStored(): Favorite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (f): f is Favorite => f && typeof f.id === "number" && typeof f.rating === "number",
    );
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  // Don't persist until we've loaded once, otherwise the empty initial
  // state would overwrite whatever is in storage.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFavorites(readStored());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // storage full or blocked (private mode); nothing we can do
    }
  }, [favorites, hydrated]);

  const isFavorite = useCallback(
    (id: number) => favorites.some((f) => f.id === id),
    [favorites],
  );

  const addFavorite = useCallback((movie: MovieSummary) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === movie.id)) return prev;
      const fav: Favorite = {
        id: movie.id,
        title: movie.title,
        year: movie.year,
        posterUrl: movie.posterUrl,
        rating: 3,
        note: "",
        addedAt: Date.now(),
      };
      return [fav, ...prev];
    });
  }, []);

  const removeFavorite = useCallback((id: number) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateFavorite = useCallback(
    (id: number, patch: Partial<Pick<Favorite, "rating" | "note">>) => {
      setFavorites((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      );
    },
    [],
  );

  return { favorites, hydrated, isFavorite, addFavorite, removeFavorite, updateFavorite };
}
