import type { LibraryView } from "../../hooks/useLibraryView";

export default function ViewToggle({
  value,
  onChange,
}: {
  value: LibraryView;
  onChange: (value: LibraryView) => void;
}) {
  const active = "text-zinc-900";
  const inactive = "text-zinc-400 hover:text-zinc-200";
  const activeStyle = { background: "var(--gradient-orange)" };

  return (
    <div className="inline-flex bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <button
        type="button"
        aria-label="Grid view"
        aria-pressed={value === "grid"}
        onClick={() => onChange("grid")}
        className={`px-3 py-1.5 text-lg ${value === "grid" ? active : inactive}`}
        style={value === "grid" ? activeStyle : undefined}
      >
        ▦
      </button>
      <button
        type="button"
        aria-label="Table view"
        aria-pressed={value === "table"}
        onClick={() => onChange("table")}
        className={`px-3 py-1.5 text-lg ${value === "table" ? active : inactive}`}
        style={value === "table" ? activeStyle : undefined}
      >
        ≡
      </button>
    </div>
  );
}
