// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import LibraryGrid from "./LibraryGrid";
import type { LibraryEntry } from "../../types";

const entry: LibraryEntry = {
  id: "e1",
  status: "LISTENED",
  rating: 8,
  review: null,
  addedAt: "2026-01-01T00:00:00Z",
  album: {
    title: "In Rainbows",
    artist: "Radiohead",
    releaseYear: 2007,
    genres: ["rock"],
    coverArtUrl: null,
  },
};

describe("LibraryGrid", () => {
  it("renders one link per entry pointing to /library/:id", () => {
    render(
      <MemoryRouter>
        <LibraryGrid entries={[entry, { ...entry, id: "e2", album: { ...entry.album, title: "Kid A" } }]} />
      </MemoryRouter>
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/library/e1");
    expect(links[1]).toHaveAttribute("href", "/library/e2");
  });

  it("does not render any '+' add button", () => {
    render(
      <MemoryRouter>
        <LibraryGrid entries={[entry]} />
      </MemoryRouter>
    );
    expect(screen.queryByRole("button", { name: "+" })).not.toBeInTheDocument();
  });
});
