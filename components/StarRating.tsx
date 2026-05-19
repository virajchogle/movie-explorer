"use client";

// Read-only unless an onChange handler is passed.

interface Props {
  value: number;
  onChange?: (value: number) => void;
  label?: string;
}

export default function StarRating({ value, onChange, label }: Props) {
  const interactive = typeof onChange === "function";

  return (
    <div
      className="stars"
      role={interactive ? "radiogroup" : undefined}
      aria-label={label ?? "Rating"}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const className = `star${filled ? " filled" : ""}${
          interactive ? " interactive" : ""
        }`;
        if (!interactive) {
          return (
            <span key={star} className={className} aria-hidden="true">
              ★
            </span>
          );
        }
        return (
          <button
            key={star}
            type="button"
            className={className}
            onClick={() => onChange?.(star)}
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
