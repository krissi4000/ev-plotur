// @vitest-environment jsdom
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import LibraryTable from "./LibraryTable";
import type { LibraryEntry } from "../../types";

const entry: LibraryEntry = {
  id: "e1",
  status: "LISTENED",
  rating: 8,
  review: "Great record",
  addedAt: "2026-01-01T00:00:00Z",
  album: {
    title: "In Rainbows",
    artist: "Radiohead",
    releaseYear: 2007,
    genres: ["rock", "alt"],
    coverArtUrl: null,
  },
};

function renderTable(props: Partial<React.ComponentProps<typeof LibraryTable>> = {}) {
  return render(
    <MemoryRouter initialEntries={["/library"]}>
      <Routes>
        <Route
          path="/library"
          element={
            <LibraryTable
              entries={[entry]}
              sort="addedAt"
              sortDir="desc"
              onSort={props.onSort ?? (() => {})}
              {...props}
            />
          }
        />
        <Route path="/library/:id" element={<div>Entry page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("LibraryTable", () => {
  it("renders all 9 headers in the documented order", () => {
    renderTable();
    const headers = screen.getAllByRole("columnheader").map((th) => th.textContent?.trim() ?? "");
    expect(headers).toHaveLength(9);
    expect(headers[1]).toMatch(/Titill/);
    expect(headers[2]).toMatch(/Listamaður/);
    expect(headers[3]).toMatch(/Ár/);
    expect(headers[4]).toMatch(/Tegundir/);
    expect(headers[5]).toMatch(/Einkunn/);
    expect(headers[6]).toMatch(/Staða/);
    expect(headers[7]).toMatch(/Umsögn/);
    expect(headers[8]).toMatch(/Bætt við/);
  });

  it("clicking a sortable header fires onSort with the column key", () => {
    const onSort = vi.fn();
    renderTable({ onSort });
    fireEvent.click(screen.getByRole("columnheader", { name: /Titill/ }));
    expect(onSort).toHaveBeenCalledWith("title");
  });

  it("clicking the non-sortable Tegundir header does not fire onSort", () => {
    const onSort = vi.fn();
    renderTable({ onSort });
    fireEvent.click(screen.getByRole("columnheader", { name: /Tegundir/ }));
    expect(onSort).not.toHaveBeenCalled();
  });

  it("the active sort column shows a direction arrow", () => {
    renderTable({ sort: "rating", sortDir: "asc" });
    const header = screen.getByRole("columnheader", { name: /Einkunn/ });
    expect(header.textContent).toContain("↑");
  });

  it("shows ↓ when sortDir is desc", () => {
    renderTable({ sort: "rating", sortDir: "desc" });
    const header = screen.getByRole("columnheader", { name: /Einkunn/ });
    expect(header.textContent).toContain("↓");
  });

  it("row click navigates to /library/:id", () => {
    renderTable();
    const row = screen.getByText("In Rainbows").closest("tr")!;
    fireEvent.click(row);
    expect(within(document.body).getByText("Entry page")).toBeInTheDocument();
  });
});
