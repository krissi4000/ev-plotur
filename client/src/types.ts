export type Album = {
  title: string;
  artist: string;
  releaseYear: number | null;
  genre: string | null;
  coverArtUrl: string | null;
};

export type SearchAlbum = Album & {
  id: string;
  artistMbid: string | null;
  score: number;
};

export type LibraryEntry = {
  id: string;
  status: string;
  rating: number | null;
  review: string | null;
  addedAt: string;
  album: Album;
};
