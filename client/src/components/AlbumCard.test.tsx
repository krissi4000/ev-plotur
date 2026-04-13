// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AlbumCard from "./AlbumCard";

const album = {
  id: "1",
  title: "OK Computer",
  artist: "Radiohead",
  releaseYear: 1997,
  genre: "rock",
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
    render(<AlbumCard album={{ ...album, coverArtUrl: undefined }} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
