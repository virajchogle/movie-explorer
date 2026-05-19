# Movie Explorer

Search movies, view details, and save favorites with your own rating and note.
Built with Next.js and TypeScript. Movie data is from TMDB, fetched through a
server-side proxy so the API token isn't exposed to the browser.

Live app: _add deployed URL here_

## Running locally

Needs Node 18+.

```bash
npm install
cp .env.example .env.local   # then add your TMDB token
npm run dev                  # http://localhost:3000
```

You need a TMDB v4 Read Access Token (free) from
https://www.themoviedb.org/settings/api. Put it in `.env.local` as
`TMDB_ACCESS_TOKEN`.

To deploy on Vercel, import the repo and set that same `TMDB_ACCESS_TOKEN`
env var in the project settings. That's the only config.

## How it's laid out

- `app/page.tsx` is the UI: search/favorites tabs and the details modal
- `app/api/search` and `app/api/movie/[id]` are the proxy routes to TMDB
- `lib/tmdb.ts` holds the TMDB calls, kept server-side
- `hooks/useFavorites.ts` is the favorites state plus LocalStorage
- `components/` has MovieCard, MovieDetailsModal, FavoritesPanel, StarRating

## Decisions & tradeoffs

**API proxy.** TMDB is called from API routes, not the browser. The token is
read from env inside `lib/tmdb.ts`, which only runs server-side, so it never
gets bundled into the client. The routes also trim TMDB's large response down
to the few fields the UI uses and turn upstream failures into clean status
codes (400 / 404 / 502).

**State.** Just React state and one `useFavorites` hook. It's a single-screen
app, so a state library would be overkill. The hook keeps all the favorites and
storage logic in one place so the page component stays mostly markup.

**Persistence.** LocalStorage, which was the baseline ask. Favorites survive a
refresh with no backend, so deployment is trivial. Downside: it's per-browser
and doesn't sync across devices. There's a `hydrated` flag so the empty initial
state doesn't clobber stored data before the first read.

**Images.** Plain `<img>` instead of `next/image`. For a grid of external
fixed-ratio posters the optimizer doesn't buy much, and `<img>` keeps the
config simpler.

## Limitations / what I'd do next

- Search only shows the first page of results. The API route already takes a
  `page` param, so pagination or "load more" is the obvious next step.
- No server-side persistence; favorites are browser-local. Next step would be
  a small DB behind `/api/favorites` and having the hook call that.
- Search runs on submit; debounced search-as-you-type would be nicer.
- No tests. I'd start with `lib/tmdb.ts` (the mapping and error handling).
