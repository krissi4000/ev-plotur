export interface Sortable {
  status: string;
  rating: number | null;
  addedAt: string | Date;
  album: {
    artist: string;
    title: string;
    releaseYear: number | null;
    genre: string | null;
  };
}

export const VALID_SORT_KEYS = ["addedAt", "rating", "artist", "title", "releaseYear", "genre", "status"];

function toTime(d: string | Date): number {
  return typeof d === "string" ? new Date(d).getTime() : d.getTime();
}

export function sortEntries<T extends Sortable>(entries: T[], sort: string): T[] {
  return [...entries].sort((a, b) => {
    switch (sort) {
      case "rating":      return (b.rating ?? -1) - (a.rating ?? -1);
      case "artist":      return a.album.artist.localeCompare(b.album.artist);
      case "releaseYear": return (b.album.releaseYear ?? 0) - (a.album.releaseYear ?? 0);
      case "genre":       return (a.album.genre ?? "zzz").localeCompare(b.album.genre ?? "zzz");
      case "title":       return a.album.title.localeCompare(b.album.title);
      case "status":      return a.status.localeCompare(b.status);
      default:            return toTime(b.addedAt) - toTime(a.addedAt);
    }
  });
}
