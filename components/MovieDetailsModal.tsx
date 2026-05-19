"use client";

import { useEffect, useState } from "react";
import type { MovieDetails } from "@/lib/types";

interface Props {
  movieId: number;
  isFavorite: boolean;
  onToggleFavorite: (movie: MovieDetails) => void;
  onClose: () => void;
}

function formatRuntime(minutes: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function MovieDetailsModal({
  movieId,
  isFavorite,
  onToggleFavorite,
  onClose,
}: Props) {
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/movie/${movieId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load movie.");
        return data as MovieDetails;
      })
      .then((data) => {
        if (!cancelled) setMovie(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load movie.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [movieId]);

  const runtime = movie ? formatRuntime(movie.runtime) : null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Movie details"
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {loading && <div className="state">Loading details…</div>}

        {error && (
          <div className="state error">
            <p>{error}</p>
            <button className="btn" style={{ marginTop: 16 }} onClick={onClose}>
              Close
            </button>
          </div>
        )}

        {movie && !loading && !error && (
          <div className="modal-body">
            <div className="modal-poster">
              {movie.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={movie.posterUrl} alt={`${movie.title} poster`} />
              ) : (
                <span className="no-poster">No poster</span>
              )}
            </div>

            <div className="modal-info">
              <h2>{movie.title}</h2>
              <p className="modal-meta">
                {[
                  movie.year ?? "Year unknown",
                  runtime,
                  movie.voteAverage
                    ? `TMDB ${movie.voteAverage.toFixed(1)}/10`
                    : null,
                ]
                  .filter(Boolean)
                  .join("  •  ")}
              </p>

              <button
                className={`modal-fav-btn${isFavorite ? " active" : ""}`}
                onClick={() => onToggleFavorite(movie)}
                aria-pressed={isFavorite}
              >
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </button>

              {movie.genres.length > 0 && (
                <div className="chip-row">
                  {movie.genres.map((g) => (
                    <span key={g} className="chip">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              <p className="modal-overview">
                {movie.overview || "No overview available for this movie."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
