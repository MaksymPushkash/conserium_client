import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MarkdownPreview } from "@/components/notes/markdown-preview";

describe("MarkdownPreview", () => {
  it("renders markdown headings and list content", () => {
    render(<MarkdownPreview title="Preview" content={"# Heading\n\n- item"} />);

    expect(screen.getByRole("heading", { name: "Preview" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Heading" })).toBeInTheDocument();
    expect(screen.getByText("item")).toBeInTheDocument();
  });
});
