const MB_BASE = "https://musicbrainz.org/ws/2";
const CAA_BASE = "https://coverartarchive.org";
const USER_AGENT = "tónlistar-letterboxd/0.1 (https://github.com/placeholder)";

export interface MBReleaseGroup {
  id: string;
  title: string;
  artist: string;
  artistMbid: string | null;
  releaseYear: number | null;
  genre: string | null;
  coverArtUrl: string | null;
  score: number;
}

interface MBSearchResult {
  "release-groups": Array<{
    id: string;
    title: string;
    score: number;
    "first-release-date"?: string;
    "artist-credit": Array<{
      artist: { id: string; name: string };
    }>;
    tags?: Array<{ name: string; count: number }>;
  }>;
}

// sækir plötur frá musicbrainz eftir leitarstreng
export async function searchReleaseGroups(query: string, limit = 10, offset = 0): Promise<MBReleaseGroup[]> {
  const url = `${MB_BASE}/release-group?query=${encodeURIComponent(query)}&type=album&fmt=json&limit=${limit}&offset=${offset}`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`MusicBrainz API error: ${res.status}`);

  const data = (await res.json()) as MBSearchResult;

  return data["release-groups"].map((rg) => {
    const artistCredit = rg["artist-credit"][0];
    const year = rg["first-release-date"]
      ? parseInt(rg["first-release-date"].slice(0, 4), 10)
      : null;
    const topTag = rg.tags?.sort((a, b) => b.count - a.count)[0]?.name ?? null;

    return {
      id: rg.id,
      title: rg.title,
      artist: artistCredit?.artist.name ?? "Unknown Artist",
      artistMbid: artistCredit?.artist.id ?? null,
      releaseYear: isNaN(year!) ? null : year,
      genre: topTag,
      coverArtUrl: `${CAA_BASE}/release-group/${rg.id}/front-250`,
      score: rg.score,
    };
  });
}
