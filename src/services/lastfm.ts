const LASTFM_BASE = "https://ws.audioscrobbler.com/2.0";

function getApiKey(): string {
  const key = process.env.LASTFM_API_KEY;
  if (!key) throw new Error("LASTFM_API_KEY environment variable is required");
  return key;
}

export interface LastfmAlbum {
  lastfmKey: string;
  title: string;
  artist: string;
  releaseYear: number | null;
  genres: string[];
  coverArtUrl: string | null;
}

interface SearchResponse {
  results: {
    albummatches: {
      album: Array<{
        name: string;
        artist: string;
        image: Array<{ "#text": string; size: string }>;
      }>;
    };
  };
}

interface GetInfoResponse {
  album: {
    name: string;
    artist: string;
    tags?: { tag: Array<{ name: string; url: string }> };
    wiki?: { published?: string };
    image: Array<{ "#text": string; size: string }>;
  };
}

function buildKey(artist: string, album: string): string {
  return `${artist.toLowerCase().trim()}:${album.toLowerCase().trim()}`;
}

function extractYear(wiki?: { published?: string }): number | null {
  if (!wiki?.published) return null;
  const match = wiki.published.match(/\b(\d{4})\b/);
  return match ? parseInt(match[1], 10) : null;
}

function getLargestImage(images: Array<{ "#text": string; size: string }>): string | null {
  const priority = ["extralarge", "large", "medium", "small"];
  for (const size of priority) {
    const img = images.find((i) => i.size === size);
    if (img && img["#text"]) return img["#text"];
  }
  return null;
}

function filterGenres(tags?: { tag: Array<{ name: string; url: string }> }): string[] {
  if (!tags?.tag || !Array.isArray(tags.tag)) return [];
  return tags.tag
    .slice(0, 4)
    .map((t) => t.name);
}

async function getAlbumInfo(artist: string, album: string): Promise<GetInfoResponse | null> {
  const apiKey = getApiKey();
  const url = `${LASTFM_BASE}?method=album.getinfo&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&api_key=${apiKey}&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json() as Promise<GetInfoResponse>;
}

export async function searchAlbums(query: string, limit = 10, page = 1): Promise<LastfmAlbum[]> {
  const apiKey = getApiKey();
  const url = `${LASTFM_BASE}?method=album.search&album=${encodeURIComponent(query)}&api_key=${apiKey}&format=json&limit=${limit}&page=${page}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Last.fm API error: ${res.status}`);

  const data = (await res.json()) as SearchResponse;
  const albums = data.results.albummatches.album;

  const enriched: LastfmAlbum[] = [];

  for (const album of albums) {
    const info = await getAlbumInfo(album.artist, album.name);

    const genres = filterGenres(info?.album?.tags);
    const releaseYear = extractYear(info?.album?.wiki);
    const coverArtUrl = getLargestImage(info?.album?.image ?? album.image);

    enriched.push({
      lastfmKey: buildKey(album.artist, album.name),
      title: album.name,
      artist: album.artist,
      releaseYear,
      genres,
      coverArtUrl,
    });
  }

  return enriched;
}
