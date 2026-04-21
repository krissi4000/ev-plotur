import AlbumCard from "../AlbumCard";
import type { LibraryEntry } from "../../types";

export default function LibraryGrid({ entries }: { entries: LibraryEntry[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {entries.map((entry) => (
        <AlbumCard
          key={entry.id}
          album={entry.album}
          linkTo={`/library/${entry.id}`}
          linkState={{ entry }}
        />
      ))}
    </div>
  );
}
