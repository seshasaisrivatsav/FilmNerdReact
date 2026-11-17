# FilmNerdReact

React and Vite port of [FilmNerd](https://github.com/seshasaisrivatsav/FilmNerd), an AngularJS movie discovery project by Sesha Sai Srivatsav.

## Run locally

Run these commands from the repository with Node.js and npm installed.

```sh
npm ci
npm run dev
```

Open the local URL Vite prints. The sample catalog works without credentials. Poster and backdrop images are fetched from TMDB.

For live search, popular movies, now playing by country, and cast information, copy `.env.example` to `.env.local`, set `TMDB_TOKEN` to a TMDB API Read Access Token, and restart the server. The token is used by the server-side catalog proxy.

```sh
npm run build
npm run preview
```

The preview server includes the catalog proxy. A static deployment serves the sample catalog unless a compatible server implements `/api/catalog/*`.

## Port scope

Movie discovery, search, film and cast pages, ratings, and review editing are available. Reviews and watchlist entries are stored in this browser. Shared accounts, Google sign-in, following, cross-device reviews, and admin moderation from the original application are outside this port. Now Playing lists releases for the selected country.

The original FilmNerd project and its license notice are linked above.
