// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SearchPage from "./SearchPage";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: false,
    json: async () => null,
  } as Response));
});

describe("SearchPage", () => {
  it("renders page heading", () => {
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Leita að plötum")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );
    expect(
      screen.getByPlaceholderText("Leita að plötu...")
    ).toBeInTheDocument();
  });
});
