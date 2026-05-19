export interface MovieSummary {
  id: number;
  title: string;
  year: string | null;
  overview: string;
  posterUrl: string | null;
}

export interface MovieDetails extends MovieSummary {
  runtime: number | null;
  releaseDate: string | null;
  voteAverage: number | null;
  genres: string[];
}

export interface Favorite {
  id: number;
  title: string;
  year: string | null;
  posterUrl: string | null;
  rating: number; // 1-5
  note: string;
  addedAt: number;
}

export interface ApiError {
  error: string;
}
