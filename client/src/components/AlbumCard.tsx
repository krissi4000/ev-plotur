type Album = {
  id: string;
  title: string;
  artist: string;
  releaseYear?: number | null;
  genre?: string | null;
  coverArtUrl?: string | null;
  score?: number;
};

export default function AlbumCard({ album }: { album: Album }) {
  return (
    <div>
      {album.coverArtUrl && (
        <img src={album.coverArtUrl} alt={album.title} width={50} />
      )}
      <strong>{album.title}</strong> — {album.artist}
      {album.releaseYear ? ` (${album.releaseYear})` : ""}
      {album.genre ? ` · ${album.genre}` : ""}
      {album.score !== undefined ? ` · ${album.score}% samsvörun` : ""}
    </div>
  );
}
