// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ViewToggle from "./ViewToggle";

describe("ViewToggle", () => {
  it("renders both buttons", () => {
    render(<ViewToggle value="grid" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /grid/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /table/i })).toBeInTheDocument();
  });

  it("marks the active button with aria-pressed=true", () => {
    render(<ViewToggle value="grid" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /grid/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /table/i })).toHaveAttribute("aria-pressed", "false");
  });

  it("fires onChange('table') when the table button is clicked", () => {
    const onChange = vi.fn();
    render(<ViewToggle value="grid" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /table/i }));
    expect(onChange).toHaveBeenCalledWith("table");
  });

  it("fires onChange('grid') when the grid button is clicked", () => {
    const onChange = vi.fn();
    render(<ViewToggle value="table" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /grid/i }));
    expect(onChange).toHaveBeenCalledWith("grid");
  });
});
