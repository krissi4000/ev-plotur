import { describe, it, expect } from "vitest";
import { sortEntries, type Sortable } from "./sort.js";

function make(parts: Partial<Sortable> & { albumTitle?: string; albumArtist?: string; year?: number | null; genres?: string[] }): Sortable {
  return {
    status: parts.status ?? "LISTENED",
    rating: parts.rating ?? null,
    addedAt: parts.addedAt ?? "2026-01-01T00:00:00Z",
    album: {
      title: parts.albumTitle ?? "Title",
      artist: parts.albumArtist ?? "Artist",
      releaseYear: parts.year ?? null,
      genres: parts.genres ?? [],
    },
  };
}

describe("sortEntries direction parameter", () => {
  const a = make({ albumTitle: "Alpha", rating: 5, year: 2000, addedAt: "2026-01-01T00:00:00Z" });
  const b = make({ albumTitle: "Bravo", rating: 9, year: 2010, addedAt: "2026-02-01T00:00:00Z" });
  const c = make({ albumTitle: "Charlie", rating: 1, year: 1995, addedAt: "2026-03-01T00:00:00Z" });

  it("uses natural (default) direction when `direction` is undefined", () => {
    const sorted = sortEntries([a, b, c], "rating");
    expect(sorted.map((e: Sortable) => e.album.title)).toEqual(["Bravo", "Alpha", "Charlie"]);
  });

  it("forces ascending direction when `direction='asc'`", () => {
    const sorted = sortEntries([a, b, c], "rating", "asc");
    expect(sorted.map((e: Sortable) => e.album.title)).toEqual(["Charlie", "Alpha", "Bravo"]);
  });

  it("forces descending direction when `direction='desc'`", () => {
    const sorted = sortEntries([a, b, c], "title", "desc");
    expect(sorted.map((e: Sortable) => e.album.title)).toEqual(["Charlie", "Bravo", "Alpha"]);
  });

  it("returns reversed order when `direction` contradicts the natural order", () => {
    const naturalAsc = sortEntries([a, b, c], "title").map((e: Sortable) => e.album.title);
    const forcedDesc = sortEntries([a, b, c], "title", "desc").map((e: Sortable) => e.album.title);
    expect(forcedDesc).toEqual([...naturalAsc].reverse());
  });

  it("unknown sort key returns input unchanged regardless of direction", () => {
    const input = [a, b, c];
    const result = sortEntries(input, "nope", "asc");
    expect(result).toHaveLength(3);
  });
});
