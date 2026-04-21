// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LibraryPage from "./LibraryPage";

const entries = [
  {
    id: "e1",
    status: "LISTENED",
    rating: 9,
    review: null,
    addedAt: "2026-02-01T00:00:00Z",
    album: { title: "Alpha", artist: "A", releaseYear: 2020, genres: [], coverArtUrl: null },
  },
  {
    id: "e2",
    status: "UNLISTENED",
    rating: null,
    review: null,
    addedAt: "2026-03-01T00:00:00Z",
    album: { title: "Bravo", artist: "B", releaseYear: 2021, genres: [], coverArtUrl: null },
  },
];

beforeEach(() => {
  const store: Record<string, string> = {};
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach((key) => delete store[key]); },
    length: Object.keys(store).length,
    key: (index: number) => Object.keys(store)[index] || null,
  } as Storage);
  vi.stubGlobal("fetch", vi.fn((url: string) => {
    if (url === "/auth/me") {
      return Promise.resolve({ ok: true, json: async () => ({ username: "u" }) } as Response);
    }
    if (url === "/library/api") {
      return Promise.resolve({ ok: true, json: async () => entries } as Response);
    }
    return Promise.resolve({ ok: false, json: async () => null } as Response);
  }));
});

describe("LibraryPage", () => {
  it("renders the grid view by default and shows the sort dropdown", async () => {
    render(<MemoryRouter><LibraryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());
    expect(screen.getByText(/Raða eftir/)).toBeInTheDocument();
    expect(screen.getAllByRole("link").some((a) => a.getAttribute("href") === "/library/e1")).toBe(true);
  });

  it("switches to table view when the table toggle is clicked, hiding the sort dropdown", async () => {
    render(<MemoryRouter><LibraryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /table/i }));
    expect(screen.getByRole("columnheader", { name: /Titill/ })).toBeInTheDocument();
    expect(screen.queryByText(/Raða eftir/)).not.toBeInTheDocument();
  });
});
