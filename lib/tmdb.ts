// Server-side only. Keep this out of client components so the token
// never ends up in the browser bundle.

import type { MovieDetails, MovieSummary } from "./types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN?.trim();
const API_KEY = process.env.TMDB_API_KEY?.trim();

export class TmdbError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "TmdbError";
    this.status = status;
  }
}

function posterUrl(path: string | null | undefined, size = "w500"): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

function yearFromDate(date: string | null | undefined): string | null {
  return date ? date.slice(0, 4) : null;
}

async function tmdbFetch(path: string, params: Record<string, string> = {}) {
  if (!ACCESS_TOKEN && !API_KEY) {
    throw new TmdbError("TMDB credentials are not configured on the server.", 500);
  }

  const url = new URL(`${TMDB_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  // Prefer the v4 read token (Bearer); fall back to a v3 api_key.
  const headers: Record<string, string> = { Accept: "application/json" };
  if (ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  } else if (API_KEY) {
    url.searchParams.set("api_key", API_KEY);
  }

  let res: Response;
  try {
    res = await fetch(url, { headers, next: { revalidate: 60 } });
  } catch {
    throw new TmdbError("Could not reach the movie service.", 502);
  }

  if (!res.ok) {
    if (res.status === 404) throw new TmdbError("Movie not found.", 404);
    if (res.status === 401) throw new TmdbError("Invalid TMDB credentials.", 500);
    throw new TmdbError("The movie service returned an error.", 502);
  }

  return res.json();
}

export async function searchMovies(
  query: string,
  page = 1,
): Promise<{ results: MovieSummary[]; totalResults: number; page: number; totalPages: number }> {
  const data = await tmdbFetch("/search/movie", {
    query,
    page: String(page),
    include_adult: "false",
  });

  const results: MovieSummary[] = (data.results ?? []).map((m: any) => ({
    id: m.id,
    title: m.title ?? m.original_title ?? "Untitled",
    year: yearFromDate(m.release_date),
    overview: m.overview ?? "",
    posterUrl: posterUrl(m.poster_path),
  }));

  return {
    results,
    totalResults: data.total_results ?? results.length,
    page: data.page ?? page,
    totalPages: data.total_pages ?? 1,
  };
}

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  const m = await tmdbFetch(`/movie/${id}`);
  return {
    id: m.id,
    title: m.title ?? m.original_title ?? "Untitled",
    year: yearFromDate(m.release_date),
    overview: m.overview ?? "",
    posterUrl: posterUrl(m.poster_path),
    runtime: m.runtime ?? null,
    releaseDate: m.release_date ?? null,
    voteAverage: typeof m.vote_average === "number" ? m.vote_average : null,
    genres: (m.genres ?? []).map((g: any) => g.name).filter(Boolean),
  };
}
