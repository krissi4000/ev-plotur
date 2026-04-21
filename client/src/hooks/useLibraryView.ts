import { useState, useEffect } from "react";
import { NATURAL_DIRECTION, type SortDirection } from "../../../src/shared/sort";

export type LibraryView = "grid" | "table";

export type LibraryViewState = {
  view: LibraryView;
  sort: string;
  sortDir: SortDirection;
};

export const STORAGE_KEY = "library:view";

export const DEFAULTS: LibraryViewState = {
  view: "grid",
  sort: "addedAt",
  sortDir: "desc",
};

function readStored(): LibraryViewState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      view: parsed.view === "table" ? "table" : "grid",
      sort: typeof parsed.sort === "string" ? parsed.sort : DEFAULTS.sort,
      sortDir: parsed.sortDir === "asc" ? "asc" : "desc",
    };
  } catch {
    return DEFAULTS;
  }
}

export default function useLibraryView() {
  const [state, setState] = useState<LibraryViewState>(() => readStored());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage disabled / quota — ignore
    }
  }, [state]);

  function setView(view: LibraryView) {
    setState((prev) => ({ ...prev, view }));
  }

  function setSort(sort: string) {
    const sortDir = NATURAL_DIRECTION[sort] ?? "desc";
    setState((prev) => ({ ...prev, sort, sortDir }));
  }

  function toggleTableSort(column: string) {
    setState((prev) =>
      prev.sort === column
        ? { ...prev, sortDir: prev.sortDir === "asc" ? "desc" : "asc" }
        : { ...prev, sort: column, sortDir: "asc" }
    );
  }

  return { state, setView, setSort, toggleTableSort };
}
