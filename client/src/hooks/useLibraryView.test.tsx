// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import useLibraryView, { STORAGE_KEY, DEFAULTS } from "./useLibraryView";

beforeEach(() => {
  // Clear localStorage by recreating it
  const store: Record<string, string> = {};
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    length: Object.keys(store).length,
    key: (index: number) => Object.keys(store)[index] || null,
  } as Storage);
});

describe("useLibraryView", () => {
  it("returns defaults when localStorage is empty", () => {
    const { result } = renderHook(() => useLibraryView());
    expect(result.current.state).toEqual(DEFAULTS);
  });

  it("hydrates from localStorage", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ view: "table", sort: "rating", sortDir: "asc" })
    );
    const { result } = renderHook(() => useLibraryView());
    expect(result.current.state).toEqual({ view: "table", sort: "rating", sortDir: "asc" });
  });

  it("falls back to defaults on corrupt JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    const { result } = renderHook(() => useLibraryView());
    expect(result.current.state).toEqual(DEFAULTS);
  });

  it("persists state on change", () => {
    const { result } = renderHook(() => useLibraryView());
    act(() => result.current.setView("table"));
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toMatchObject({ view: "table" });
  });

  it("setSort applies the per-column default direction", () => {
    const { result } = renderHook(() => useLibraryView());
    act(() => result.current.setSort("rating"));
    expect(result.current.state.sort).toBe("rating");
    expect(result.current.state.sortDir).toBe("desc");

    act(() => result.current.setSort("title"));
    expect(result.current.state.sort).toBe("title");
    expect(result.current.state.sortDir).toBe("asc");
  });

  it("toggleTableSort on a new column sets asc", () => {
    const { result } = renderHook(() => useLibraryView());
    act(() => result.current.toggleTableSort("rating"));
    expect(result.current.state.sort).toBe("rating");
    expect(result.current.state.sortDir).toBe("asc");
  });

  it("toggleTableSort on the current column flips the direction", () => {
    const { result } = renderHook(() => useLibraryView());
    act(() => result.current.toggleTableSort("rating")); // asc
    act(() => result.current.toggleTableSort("rating")); // desc
    expect(result.current.state.sortDir).toBe("desc");
    act(() => result.current.toggleTableSort("rating")); // asc again
    expect(result.current.state.sortDir).toBe("asc");
  });
});
