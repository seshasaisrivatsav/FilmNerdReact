import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { image, loadCatalog, sample } from './catalog';
import './styles.css';

function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; }
    catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}

function useCatalog(route) {
  const [result, setResult] = useState({});
  useEffect(() => {
    if (!route) return;
    const controller = new AbortController();
    loadCatalog(route, controller.signal)
      .then(data => setResult({ route, data }))
      .catch(() => {
        if (!controller.signal.aborted) setResult({ route, offline: true });
      });
    return () => controller.abort();
  }, [route]);
  return route && result.route === route ? result : {};
}

function Poster({ movie }) {
  return <div className="poster">
    {movie.poster_path && <img src={image(movie.poster_path)} alt="" loading="lazy"
      onError={event => { event.currentTarget.hidden = true; }} />}
    <span aria-hidden="true">FILM<br/>NERD</span>
  </div>;
}

function MovieGrid({ movies }) {
  return <div className="grid">{movies.map(movie => (
    <a className="card" key={movie.id} href={'#/movie/' + movie.id}>
      <Poster movie={movie} />
      <strong>{movie.title}</strong>
      <small>{movie.release_date?.slice(0, 4) || 'Year unknown'} <span>★ {movie.vote_average?.toFixed(1)}</span></small>
    </a>
  ))}</div>;
}

function MoviePage({ movie, reviews, saveReview, removeReview, saved, toggleSaved }) {
  const review = reviews[movie.id];
  const [rating, setRating] = useState(review?.rating ?? '5');
  const [text, setText] = useState(review?.text ?? '');
  const [notice, setNotice] = useState('');
  return <>
    <a className="back" href="#/">← Discover</a>
    <section className="detail">
      <Poster movie={movie} />
      <div>
        <p className="eyebrow">{movie.genres?.map(genre => genre.name).join(' / ')}</p>
        <h1>{movie.title}</h1>
        <p className="muted">{movie.release_date?.slice(0, 4)} · {movie.runtime || '—'} min · ★ {movie.vote_average?.toFixed(1)}</p>
        <p>{movie.overview}</p>
        <button onClick={() => toggleSaved(movie)}>{saved ? 'Remove from watchlist' : '+ Add to watchlist'}</button>
      </div>
    </section>
    <section><h2>Cast</h2><ul className="cast">{movie.credits?.cast?.slice(0, 12).map(person =>
      <li key={person.id}><a href={'#/person/' + person.id}>{person.name}</a><small>{person.character}</small></li>
    )}</ul></section>
    <section className="review">
      <h2>{review ? 'Edit your review' : 'Rate and review'}</h2>
      <form onSubmit={event => {
        event.preventDefault();
        if (!text.trim()) { setNotice('Enter a review before saving.'); return; }
        saveReview(movie.id, { rating, text: text.trim() });
        setNotice('Review saved on this device.');
      }}>
        <label>Rating<select value={rating} onChange={event => setRating(event.target.value)}>
          {[5, 4, 3, 2, 1].map(stars => <option key={stars} value={stars}>{stars} / 5</option>)}
        </select></label>
        <label>Review<textarea required maxLength={2000} rows={4} value={text} onChange={event => setText(event.target.value)} /></label>
        <button type="submit">Save review</button>{' '}
        {review && <button type="button" className="secondary" onClick={() => {
          removeReview(movie.id); setText(''); setRating('5'); setNotice('Review removed.');
        }}>Delete review</button>}
        <p role="status">{notice}</p>
      </form>
    </section>
  </>;
}

function App() {
  const [hash, setHash] = useState(location.hash);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('US');
  const [saved, setSaved] = useStored('filmnerd-watchlist', []);
  const [reviews, setReviews] = useStored('filmnerd-reviews', {});
  useEffect(() => {
    function navigate() { setHash(location.hash); window.scrollTo(0, 0); }
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  const url = new URL(hash.slice(1) || '/', location.origin);
  const term = url.searchParams.get('q')?.trim() ?? '';
  const watchlist = url.pathname === '/watchlist';
  const popular = url.pathname === '/popular';
  const match = /^\/(movie|person)\/(\d+)$/.exec(url.pathname);
  const id = Number(match?.[2]);
  const detail = match?.[1] === 'movie';
  const person = match?.[1] === 'person';
  const route = match ? match[1] + '/' + id : watchlist ? null : term
    ? 'search?query=' + encodeURIComponent(term)
    : (popular ? 'popular' : 'now_playing') + '?region=' + region;
  const { data, offline } = useCatalog(route);
  const fallbackMovie = sample.find(movie => movie.id === id) ?? saved.find(movie => movie.id === id);
  const fallbackCredits = sample.filter(movie => movie.credits.cast.some(member => member.id === id));
  const fallbackPerson = fallbackCredits[0]?.credits.cast.find(member => member.id === id);
  const movies = watchlist ? saved : data?.results ?? sample.filter(movie => movie.title.toLowerCase().includes(term.toLowerCase()));
  const featured = movies[0];
  const knownPage = match || watchlist || popular || url.pathname === '/';
  function toggleSaved(movie) {
    setSaved(previous => previous.some(item => item.id === movie.id)
      ? previous.filter(item => item.id !== movie.id) : [...previous, movie]);
  }
  return <>
    <a className="button skip-link" href="#main" onClick={event => { event.preventDefault(); document.getElementById('main').focus(); }}>Skip to content</a>
    <header><nav aria-label="Main navigation">
      <a href="#/" className="brand">FILM<span>NERD</span></a>
      <div className="navlinks"><a href="#/" aria-current={!match && !watchlist && !popular ? 'page' : undefined}>Discover</a><a href="#/popular" aria-current={popular ? 'page' : undefined}>Popular</a><a href="#/watchlist" aria-current={watchlist ? 'page' : undefined}>Watchlist</a></div>
      <form role="search" onSubmit={event => {
        event.preventDefault();
        location.hash = query.trim() ? '/?q=' + encodeURIComponent(query.trim()) : '/';
      }}>
        <input type="search" aria-label="Search movies" placeholder="Search movies" value={query} onChange={event => setQuery(event.target.value)} />
        <button type="submit">Search</button>
      </form>
    </nav></header>
    <main id="main" tabIndex={-1}>
      {!knownPage ? <h1>Page not found</h1> : detail ? (
        data || fallbackMovie ? <MoviePage key={id} movie={data ?? fallbackMovie} reviews={reviews}
          saved={saved.some(item => item.id === id)} toggleSaved={toggleSaved}
          saveReview={(id, review) => setReviews(previous => ({ ...previous, [id]: review }))}
          removeReview={id => setReviews(previous => {
            const next = { ...previous }; delete next[id]; return next;
          })} /> : <p role="status">{offline ? 'This movie is unavailable in the sample catalog.' : 'Loading movie…'}</p>
      ) : person ? <>
        <a className="back" href="#/">← Discover</a>
        <h1>{data?.name ?? fallbackPerson?.name ?? (offline ? 'Cast profile unavailable' : 'Loading cast…')}</h1>
        {data?.biography && <p className="bio">{data.biography}</p>}
        <MovieGrid movies={(data?.movie_credits?.cast ?? fallbackCredits).slice(0, 24)} />
      </> : <>
        {!watchlist && !term && featured && <section className="hero">
          {(featured.backdrop_path || featured.poster_path) && <img key={featured.id}
            className={'hero-art' + (featured.backdrop_path ? '' : ' poster-art')}
            src={image(featured.backdrop_path || featured.poster_path, featured.backdrop_path ? 'w1280' : 'w780')} alt=""
            onError={event => {
              const poster = image(featured.poster_path, 'w780');
              if (poster && event.currentTarget.src !== poster) {
                event.currentTarget.classList.add('poster-art');
                event.currentTarget.src = poster;
              } else event.currentTarget.hidden = true;
            }} />}
          <p className="eyebrow">Featured film</p>
          <h1>{featured.title}</h1>
          <p>{featured.overview}</p>
          <a className="button" href={'#/movie/' + featured.id}>View film →</a>
        </section>}
        <section>
          <div className="section-head">
            <div><h2>{watchlist ? 'Your watchlist' : term ? 'Results for “' + term + '”' : !data ? 'Sample catalog' : popular ? 'Popular movies' : 'Now playing'}</h2>
              {!watchlist && !data && <small>{offline ? 'Browsing the sample catalog' : 'Checking for live movies…'}</small>}</div>
            {data && !watchlist && !term && !popular && <label>Region <select value={region} onChange={event => setRegion(event.target.value)}>
              <option value="US">United States</option><option value="CA">Canada</option><option value="GB">United Kingdom</option><option value="IN">India</option><option value="AU">Australia</option>
            </select></label>}
          </div>
          {movies.length ? <MovieGrid movies={movies} /> : <p>{watchlist ? 'Add a film to start your watchlist.' : 'No movies found.'}</p>}
        </section>
      </>}
    </main>
    <footer><strong>FILMNERD</strong><small>This product uses the TMDB API but is not endorsed or certified by TMDB.</small></footer>
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
