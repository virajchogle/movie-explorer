import { NextResponse } from "next/server";
import { getMovieDetails, TmdbError } from "@/lib/tmdb";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id, 10);
  if (Number.isNaN(id) || id < 1) {
    return NextResponse.json({ error: "Invalid movie id." }, { status: 400 });
  }

  try {
    const movie = await getMovieDetails(id);
    return NextResponse.json(movie);
  } catch (err) {
    const status = err instanceof TmdbError ? err.status : 500;
    const message =
      err instanceof TmdbError ? err.message : "Something went wrong loading this movie.";
    return NextResponse.json({ error: message }, { status });
  }
}
