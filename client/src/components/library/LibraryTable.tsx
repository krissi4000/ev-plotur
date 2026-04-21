import { useNavigate } from "react-router-dom";
import type { LibraryEntry } from "../../types";
import type { SortDirection } from "../../../../src/shared/sort";

type Column = {
  key: string | null;
  label: string;
};

const COLUMNS: Column[] = [
  { key: null, label: "" },
  { key: "title", label: "Titill" },
  { key: "artist", label: "Listamaður" },
  { key: "releaseYear", label: "Ár" },
  { key: null, label: "Tegundir" },
  { key: "rating", label: "Einkunn" },
  { key: "status", label: "Staða" },
  { key: null, label: "Umsögn" },
  { key: "addedAt", label: "Bætt við" },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${d.getFullYear()}`;
}

function statusLabel(status: string): string {
  return status === "LISTENED" ? "Hlustað" : "Á að hlusta";
}

export default function LibraryTable({
  entries,
  sort,
  sortDir,
  onSort,
}: {
  entries: LibraryEntry[];
  sort: string;
  sortDir: SortDirection;
  onSort: (column: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {COLUMNS.map((col, idx) => {
              const isActive = col.key !== null && col.key === sort;
              const arrow = isActive ? (sortDir === "asc" ? " ↑" : " ↓") : "";
              const base = "text-left px-2 py-2 border-b border-zinc-800 font-medium uppercase tracking-wide text-xs whitespace-nowrap";
              const tone = isActive ? "text-orange-400" : "text-zinc-400";
              const clickable = col.key !== null;
              return (
                <th
                  key={idx}
                  scope="col"
                  className={`${base} ${tone} ${clickable ? "cursor-pointer select-none" : "cursor-default"}`}
                  onClick={clickable ? () => onSort(col.key!) : undefined}
                >
                  {col.label}{arrow}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr
              key={e.id}
              onClick={() => navigate(`/library/${e.id}`, { state: { entry: e } })}
              className="cursor-pointer hover:bg-zinc-900/50 border-b border-zinc-900"
            >
              <td className="px-2 py-1.5 w-10">
                {e.album.coverArtUrl ? (
                  <img src={e.album.coverArtUrl} alt="" className="w-10 aspect-square rounded-lg object-cover block" />
                ) : (
                  <div className="w-10 aspect-square rounded-lg bg-zinc-800" />
                )}
              </td>
              <td className="px-2 py-1.5 text-zinc-100 whitespace-nowrap">{e.album.title}</td>
              <td className="px-2 py-1.5 text-zinc-300 whitespace-nowrap">{e.album.artist}</td>
              <td className="px-2 py-1.5 text-zinc-400 whitespace-nowrap">{e.album.releaseYear ?? "—"}</td>
              <td className="px-2 py-1.5">
                {e.album.genres.length === 0
                  ? <span className="text-zinc-600">—</span>
                  : (
                    <div className="flex flex-wrap gap-1">
                      {e.album.genres.map((g) => (
                        <span key={g} className="inline-block bg-zinc-800 text-zinc-300 rounded px-1 py-0.5 text-[10px] leading-tight">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
              </td>
              <td className="px-2 py-1.5 text-zinc-300 whitespace-nowrap">
                {e.rating != null ? `${e.rating}/10` : "—"}
              </td>
              <td className="px-2 py-1.5 text-zinc-400 whitespace-nowrap">{statusLabel(e.status)}</td>
              <td className="px-2 py-1.5 text-zinc-500 italic max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                {e.review ?? "—"}
              </td>
              <td className="px-2 py-1.5 text-zinc-400 whitespace-nowrap">
                {formatDate(typeof e.addedAt === "string" ? e.addedAt : e.addedAt.toISOString())}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
