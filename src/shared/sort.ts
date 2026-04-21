export interface Sortable {
  status: string;
  rating: number | null;
  addedAt: string | Date;
  album: {
    artist: string;
    title: string;
    releaseYear: number | null;
    genres: string[];
  };
}

export type SortDirection = "asc" | "desc";

export const VALID_SORT_KEYS = ["addedAt", "rating", "artist", "title", "releaseYear", "genre", "status"];

export const NATURAL_DIRECTION: Record<string, SortDirection> = {
  addedAt: "desc",
  rating: "desc",
  releaseYear: "desc",
  title: "asc",
  artist: "asc",
  genre: "asc",
  status: "asc",
};

function toTime(d: string | Date): number {
  return typeof d === "string" ? new Date(d).getTime() : d.getTime();
}

export function sortEntries<T extends Sortable>(
  entries: T[],
  sort: string,
  direction?: SortDirection,
): T[] {
  const sorted = [...entries].sort((a, b) => {
    switch (sort) {
      case "rating":      return (b.rating ?? -1) - (a.rating ?? -1);
      case "artist":      return a.album.artist.localeCompare(b.album.artist);
      case "releaseYear": return (b.album.releaseYear ?? 0) - (a.album.releaseYear ?? 0);
      case "genre":       return (a.album.genres[0] ?? "zzz").localeCompare(b.album.genres[0] ?? "zzz");
      case "title":       return a.album.title.localeCompare(b.album.title);
      case "status":      return a.status.localeCompare(b.status);
      default:            return toTime(b.addedAt) - toTime(a.addedAt);
    }
  });

  const natural = NATURAL_DIRECTION[sort] ?? "desc";
  const effective = direction ?? natural;
  return effective === natural ? sorted : sorted.reverse();
}
