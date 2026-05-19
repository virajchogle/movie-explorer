"use client";

import type { MovieSummary } from "@/lib/types";

interface Props {
  movie: MovieSummary;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onViewDetails: () => void;
}

export default function MovieCard({
  movie,
  isFavorite,
  onToggleFavorite,
  onViewDetails,
}: Props) {
  return (
    <article className="card">
      <button
        className="card-poster"
        onClick={onViewDetails}
        aria-label={`View details for ${movie.title}`}
      >
        {movie.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={movie.posterUrl} alt={`${movie.title} poster`} loading="lazy" />
        ) : (
          <span className="no-poster">No poster</span>
        )}
      </button>

      <div className="card-body">
        <span className="card-title">{movie.title}</span>
        <span className="card-year">{movie.year ?? "Year unknown"}</span>
        <p className="card-overview">
          {movie.overview || "No description available."}
        </p>

        <div className="card-actions">
          <button className="fav-btn" onClick={onViewDetails}>
            Details
          </button>
          <button
            className={`fav-btn${isFavorite ? " active" : ""}`}
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
          >
            {isFavorite ? "Favorited" : "Favorite"}
          </button>
        </div>
      </div>
    </article>
  );
}
