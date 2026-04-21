// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AlbumCard from "./AlbumCard";

const album = {
  title: "OK Computer",
  artist: "Radiohead",
  releaseYear: 1997,
  genres: ["alternative rock", "rock"],
  coverArtUrl: "https://example.com/cover.jpg",
};

describe("AlbumCard", () => {
  it("renders album title and artist", () => {
    render(<AlbumCard album={album} />);
    expect(screen.getByText(/OK Computer/)).toBeInTheDocument();
    expect(screen.getByText(/Radiohead/)).toBeInTheDocument();
  });

  it("renders release year", () => {
    render(<AlbumCard album={album} />);
    expect(screen.getByText(/1997/)).toBeInTheDocument();
  });

  it("renders cover image with correct src", () => {
    render(<AlbumCard album={album} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", album.coverArtUrl);
  });

  it("does not render image when coverArtUrl is missing", () => {
    render(<AlbumCard album={{ ...album, coverArtUrl: null }} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("wraps the card in a <Link> to `linkTo` when provided", () => {
    render(
      <MemoryRouter>
        <AlbumCard album={album} linkTo="/library/entry-123" />
      </MemoryRouter>
    );
    const anchor = screen.getByRole("link");
    expect(anchor).toHaveAttribute("href", "/library/entry-123");
    expect(anchor).toHaveTextContent("OK Computer");
  });

  it("does not render the '+' button when linkTo is provided, even with onAdd", () => {
    render(
      <MemoryRouter>
        <AlbumCard album={album} linkTo="/library/entry-123" onAdd={async () => true} />
      </MemoryRouter>
    );
    expect(screen.queryByRole("button", { name: "+" })).not.toBeInTheDocument();
  });
});
