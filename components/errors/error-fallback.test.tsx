import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ErrorFallback } from "./error-fallback";

describe("ErrorFallback", () => {
  it("displays error message", () => {
    const error = "Something went wrong";
    render(<ErrorFallback error={error} title="Test Error" />);

    expect(screen.getByText("Test Error")).toBeInTheDocument();
    expect(screen.getByText(error)).toBeInTheDocument();
  });

  it("displays Error object message", () => {
    const error = new Error("Database connection failed");
    render(<ErrorFallback error={error} title="DB Error" />);

    expect(screen.getByText("Database connection failed")).toBeInTheDocument();
  });

  it("calls onRetry when button is clicked", async () => {
    const onRetry = vi.fn();
    render(
      <ErrorFallback error="Test error" title="Error" onRetry={onRetry} />,
    );

    const retryButton = screen.getByRole("button", { name: /try again/i });
    retryButton.click();

    await waitFor(() => {
      expect(onRetry).toHaveBeenCalled();
    });
  });

  it("does not show retry button when onRetry is not provided", () => {
    render(<ErrorFallback error="Test error" title="Error" />);

    expect(
      screen.queryByRole("button", { name: /try again/i }),
    ).not.toBeInTheDocument();
  });

  it("uses default title when not provided", () => {
    render(<ErrorFallback error="Test error" />);

    expect(screen.getByText("Error loading content")).toBeInTheDocument();
  });
});
