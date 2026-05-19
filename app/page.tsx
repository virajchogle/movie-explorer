"use client";

import { useCallback, useState } from "react";
import type { MovieSummary } from "@/lib/types";
import { useFavorites } from "@/hooks/useFavorites";
import MovieCard from "@/components/MovieCard";
import MovieDetailsModal from "@/components/MovieDetailsModal";
import FavoritesPanel from "@/components/FavoritesPanel";

type Tab = "search" | "favorites";

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("search");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieSummary[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { favorites, hydrated, isFavorite, addFavorite, removeFavorite, updateFavorite } =
    useFavorites();

  const runSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) {
      setError("Please enter a movie title to search.");
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(term)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed.");
      setResults(data.results);
    } catch (err) {
      setResults([]);
      setError(err instanceof Error ? err.message : "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  const toggleFavorite = useCallback(
    (movie: MovieSummary) => {
      if (isFavorite(movie.id)) {
        removeFavorite(movie.id);
      } else {
        addFavorite(movie);
      }
    },
    [isFavorite, addFavorite, removeFavorite],
  );

  return (
    <div className="container">
      <header>
        <h1>Movie Explorer</h1>
        <p>Search films, view details, and save favorites with your own rating.</p>
      </header>

      <nav className="tabs">
        <button
          className={`tab${tab === "search" ? " active" : ""}`}
          onClick={() => setTab("search")}
        >
          Search
        </button>
        <button
          className={`tab${tab === "favorites" ? " active" : ""}`}
          onClick={() => setTab("favorites")}
        >
          Favorites{hydrated && favorites.length > 0 ? ` (${favorites.length})` : ""}
        </button>
      </nav>

      {tab === "search" && (
        <section>
          <form className="search-form" onSubmit={runSearch}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title"
              aria-label="Movie title"
            />
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Searching…" : "Search"}
            </button>
          </form>

          {error && <div className="banner">{error}</div>}

          {loading && <div className="state">Searching movies…</div>}

          {!loading && !error && searched && results.length === 0 && (
            <div className="state">
              <p>No films found for “{query.trim()}”.</p>
              <p className="state-sub">Try a different title or check the spelling.</p>
            </div>
          )}

          {!loading && !searched && (
            <div className="state">Search for a movie to get started.</div>
          )}

          {!loading && results.length > 0 && (
            <div className="grid">
              {results.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isFavorite={isFavorite(movie.id)}
                  onToggleFavorite={() => toggleFavorite(movie)}
                  onViewDetails={() => setSelectedId(movie.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "favorites" && (
        <section>
          {!hydrated ? (
            <div className="state">Loading favorites…</div>
          ) : (
            <FavoritesPanel
              favorites={favorites}
              onUpdate={updateFavorite}
              onRemove={removeFavorite}
            />
          )}
        </section>
      )}

      {selectedId !== null && (
        <MovieDetailsModal
          movieId={selectedId}
          isFavorite={isFavorite(selectedId)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
