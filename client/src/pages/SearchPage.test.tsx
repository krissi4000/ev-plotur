// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import SearchPage from "./SearchPage";

vi.stubGlobal("fetch", vi.fn());

describe("SearchPage", () => {
  it("renders page heading", () => {
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Search Albums")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );
    expect(
      screen.getByPlaceholderText("Search for an album...")
    ).toBeInTheDocument();
  });
});
