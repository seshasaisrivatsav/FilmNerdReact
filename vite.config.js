import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const { TMDB_TOKEN } = loadEnv(mode, process.cwd(), '');
  function catalog(req, res, next) {
    const url = new URL(req.url, 'http://localhost');
    if (!/^\/api\/catalog\/(now_playing|popular|search|movie\/\d+|person\/\d+)$/.test(url.pathname)) return next();
    function send(status, data) {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    }
    if (!TMDB_TOKEN) return send(503, { message: 'Live catalog is not configured.' });
    let route = url.pathname.slice('/api/catalog/'.length);
    const params = new URLSearchParams({ language: 'en-US' });
    if (route === 'search') {
      route = 'search/movie';
      params.set('query', url.searchParams.get('query') ?? '');
      params.set('include_adult', 'false');
    } else if (route.startsWith('movie/')) {
      params.set('append_to_response', 'credits');
    } else if (route.startsWith('person/')) {
      params.set('append_to_response', 'movie_credits');
    } else {
      route = 'movie/' + route;
      if (url.searchParams.has('region')) params.set('region', url.searchParams.get('region'));
    }
    fetch('https://api.themoviedb.org/3/' + route + '?' + params, {
      headers: { Authorization: 'Bearer ' + TMDB_TOKEN },
      signal: AbortSignal.timeout(8000),
    }).then(async response => {
      if (!response.ok) return send(502, { message: 'Live catalog could not be loaded.' });
      send(200, await response.json());
    }).catch(() => send(502, { message: 'Live catalog could not be loaded.' }));
  }
  return {
    plugins: [{ name: 'filmnerd-catalog', configureServer(server) {
      server.middlewares.use(catalog);
    }, configurePreviewServer(server) {
      server.middlewares.use(catalog);
    } }],
  };
});
