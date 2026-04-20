// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Navbar from "./Navbar";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: false,
    json: async () => null,
  } as Response));
});

describe("Navbar", () => {
  it("renders all navigation links", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText("Heim")).toBeInTheDocument();
    expect(screen.getByText("Leita")).toBeInTheDocument();
    expect(screen.getByText("Safn")).toBeInTheDocument();
  });

  it("links point to correct routes", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText("Heim").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByText("Leita").closest("a")).toHaveAttribute("href", "/search");
    expect(screen.getByText("Safn").closest("a")).toHaveAttribute("href", "/library");
  });
});
