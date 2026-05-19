"use client";

import type { Favorite } from "@/lib/types";
import StarRating from "./StarRating";

interface Props {
  favorites: Favorite[];
  onUpdate: (id: number, patch: Partial<Pick<Favorite, "rating" | "note">>) => void;
  onRemove: (id: number) => void;
}

export default function FavoritesPanel({ favorites, onUpdate, onRemove }: Props) {
  if (favorites.length === 0) {
    return (
      <div className="state">
        <p>No favorites yet.</p>
        <p className="state-sub">Search for a film and tap Favorite to start your list.</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      {favorites.map((fav) => (
        <div className="fav-row" key={fav.id}>
          <div className="fav-poster">
            {fav.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fav.posterUrl} alt={`${fav.title} poster`} loading="lazy" />
            ) : (
              <span className="no-poster" style={{ fontSize: "0.7rem" }}>
                No poster
              </span>
            )}
          </div>

          <div className="fav-main">
            <div className="fav-head">
              <div>
                <div className="card-title">{fav.title}</div>
                <div className="card-year">{fav.year ?? "Year unknown"}</div>
              </div>
              <button className="link-btn" onClick={() => onRemove(fav.id)}>
                Remove
              </button>
            </div>

            <div>
              <span className="label">Your rating</span>
              <div>
                <StarRating
                  value={fav.rating}
                  onChange={(rating) => onUpdate(fav.id, { rating })}
                  label={`Your rating for ${fav.title}`}
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor={`note-${fav.id}`}>
                Your note
              </label>
              <textarea
                id={`note-${fav.id}`}
                className="fav-note"
                placeholder="Add a personal note (optional)…"
                value={fav.note}
                maxLength={500}
                onChange={(e) => onUpdate(fav.id, { note: e.target.value })}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
