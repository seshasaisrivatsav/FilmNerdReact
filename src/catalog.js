function movie(id, title, year, vote_average, poster_path, backdrop_path, genre, runtime, overview, credits) {
  return {
    id, title, release_date: String(year), vote_average, poster_path, backdrop_path,
    genres: [{ name: genre }], runtime, overview,
    credits: { cast: credits.map(([id, name, character]) => ({ id, name, character })) },
  };
}

export const sample = [
  movie(438631, 'Dune: Part Two', 2024, 8.1, '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', '/xOMo8BRK7PfcJv2jqPaXnvu1eYf.jpg', 'Science fiction', 166, 'Paul Atreides joins Chani and the Fremen in their fight for Arrakis.', [[1190668, 'Timothée Chalamet', 'Paul Atreides'], [505710, 'Zendaya', 'Chani']]),
  movie(157336, 'Interstellar', 2014, 8.5, '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', '/xJHokMbljvjADYdit5fK5VQsXEG.jpg', 'Science fiction', 169, 'A team of explorers travels through a wormhole in search of a new home for humanity.', [[10297, 'Matthew McConaughey', 'Cooper'], [1813, 'Anne Hathaway', 'Brand']]),
  movie(155, 'The Dark Knight', 2008, 8.5, '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', null, 'Crime', 152, 'Batman faces the Joker as a new wave of crime threatens Gotham City.', [[3894, 'Christian Bale', 'Bruce Wayne'], [1810, 'Heath Ledger', 'The Joker']]),
  movie(545611, 'Everything Everywhere All at Once', 2022, 7.8, '/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg', null, 'Adventure', 139, 'A laundromat owner discovers that the fate of the multiverse depends on her.', [[1620, 'Michelle Yeoh', 'Evelyn Wang'], [69041, 'Ke Huy Quan', 'Waymond Wang']]),
  movie(496243, 'Parasite', 2019, 8.5, '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', null, 'Thriller', 132, 'The Kim family finds work in a wealthy household, with consequences neither family expects.', [[20738, 'Song Kang-ho', 'Kim Ki-taek'], [241819, 'Choi Woo-shik', 'Kim Ki-woo']]),
  movie(569094, 'Spider-Man: Across the Spider-Verse', 2023, 8.3, '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', null, 'Animation', 140, 'Miles Morales crosses the multiverse and faces a new choice about what it means to be Spider-Man.', [[587506, 'Shameik Moore', 'Miles Morales'], [130640, 'Hailee Steinfeld', 'Gwen Stacy']]),
];

export function image(path, size = 'w500') {
  return path && 'https://image.tmdb.org/t/p/' + size + path;
}

export async function loadCatalog(route, signal) {
  const response = await fetch('/api/catalog/' + route, { signal });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
}
