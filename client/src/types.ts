export type Album = {
  title: string;
  artist: string;
  releaseYear: number | null;
  genres: string[];
  coverArtUrl: string | null;
};

export type SearchAlbum = Album & {
  lastfmKey: string;
};

export type LibraryEntry = {
  id: string;
  status: string;
  rating: number | null;
  review: string | null;
  addedAt: string;
  album: Album;
};
