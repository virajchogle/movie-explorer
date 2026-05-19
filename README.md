# Movie Explorer

A small web app for searching movies, viewing their details, and keeping a
personal list of favorites with your own rating and notes. Movie data comes
from TMDB, fetched through a server-side proxy so the API token never reaches
the browser.

**Live app:** https://movie-explorer-teal-chi.vercel.app

## Features

- **Search** movies by title, with poster, year, and a short description.
- **Details** view (modal) showing the poster, overview, year, runtime,
  genres, and TMDB rating.
- **Favorites** that you can add or remove, each with a 1 to 5 star rating and
  an optional note.
- **Persistence** through LocalStorage, so favorites survive a page refresh.
- **Error handling** for empty searches, no results, invalid input, and
  network or API failures.

## Tech stack

- Next.js 14 (App Router) and React
- TypeScript
- Next.js API routes as the TMDB proxy
- Plain CSS, no UI library
- LocalStorage for persistence
- Deployed on Vercel

## Running locally

Requires Node 18 or newer.

```bash
npm install
cp .env.example .env.local   # then add your TMDB token
npm run dev                  # http://localhost:3000
```

Get a free TMDB v4 Read Access Token from
https://www.themoviedb.org/settings/api and put it in `.env.local` as
`TMDB_ACCESS_TOKEN`.

```bash
npm run build && npm run start   # production build
```

### Deploying

The app runs on Vercel. Import the repo, and set `TMDB_ACCESS_TOKEN` as an
environment variable in the project settings. That is the only configuration
needed, since `.env.local` is not committed.

## Project structure

```
app/
  page.tsx                 Main UI: search and favorites tabs, details modal
  layout.tsx, globals.css
  api/search/route.ts      Proxy: GET /api/search?query=&page=
  api/movie/[id]/route.ts  Proxy: GET /api/movie/[id]
components/                MovieCard, MovieDetailsModal, FavoritesPanel, StarRating
hooks/useFavorites.ts      Favorites state, backed by LocalStorage
lib/tmdb.ts                TMDB client, runs server-side only
lib/types.ts               Shared TypeScript types
```

## Decisions & tradeoffs

**API proxy.** TMDB is called from Next.js API routes, never from the browser.
The token is read from the environment inside `lib/tmdb.ts`, which only runs on
the server, so it is never bundled into the client. The routes also trim
TMDB's large responses down to the few fields the UI needs and map upstream
failures to clean status codes (400, 404, 502).

**State management.** Plain React state plus one `useFavorites` hook. The app
is a single screen with a modal, so a state library would be unnecessary
weight. The hook keeps all favorites and storage logic in one place, which
keeps the page component focused on layout.

**Persistence.** LocalStorage, which was the baseline requirement. Favorites
survive a refresh with no backend, which keeps deployment simple. The tradeoff
is that favorites are per-browser and do not sync across devices. A `hydrated`
flag ensures the empty initial state never overwrites stored data before the
first read completes.

**Images.** Posters use a plain `<img>` tag rather than `next/image`. For a
grid of external, fixed-ratio poster images the optimizer adds little, and
`<img>` keeps the configuration simpler.

## Known limitations & what I'd improve with more time

- **Single page of results.** Search shows only the first page from TMDB. The
  API route already accepts a `page` parameter, so adding pagination or a
  "load more" button is the natural next step.
- **No server-side persistence.** Favorites live in the browser. The next step
  would be a small database behind `/api/favorites` routes, with the hook
  reading and writing through those instead of LocalStorage.
- **Search runs on submit.** Debounced search-as-you-type would be a nicer
  experience.
- **No automated tests.** I would start with unit tests for `lib/tmdb.ts`
  (response mapping and error handling) and a couple of tests for the API
  routes.
