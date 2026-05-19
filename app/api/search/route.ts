import { NextResponse } from "next/server";
import { searchMovies, TmdbError } from "@/lib/tmdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") ?? "").trim();
  const pageParam = searchParams.get("page") ?? "1";

  if (!query) {
    return NextResponse.json({ error: "A search term is required." }, { status: 400 });
  }

  const page = Number.parseInt(pageParam, 10);
  if (Number.isNaN(page) || page < 1 || page > 500) {
    return NextResponse.json({ error: "Invalid page number." }, { status: 400 });
  }

  try {
    const data = await searchMovies(query, page);
    return NextResponse.json(data);
  } catch (err) {
    const status = err instanceof TmdbError ? err.status : 500;
    const message =
      err instanceof TmdbError ? err.message : "Something went wrong while searching.";
    return NextResponse.json({ error: message }, { status });
  }
}
