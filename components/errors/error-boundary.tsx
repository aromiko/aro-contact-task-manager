"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { Button } from "../ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error boundary caught:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ error: null, hasError: false });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback?.(this.state.error, this.resetError) || (
          <DefaultErrorFallback
            error={this.state.error}
            onReset={this.resetError}
          />
        )
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  onReset: () => void;
}

function DefaultErrorFallback({ error, onReset }: DefaultErrorFallbackProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="border-destructive/20 bg-destructive/5 w-full max-w-md rounded-lg border p-6">
        <div className="mb-4 flex items-center gap-3">
          <AlertCircle className="text-destructive h-6 w-6" />
          <h2 className="text-destructive text-lg font-semibold">
            Something went wrong
          </h2>
        </div>

        <p className="text-muted-foreground mb-4 text-sm">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>

        <div className="flex gap-2">
          <Button
            onClick={onReset}
            variant="default"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>

          <Button onClick={() => router.replace("/")} variant="outline">
            Go home
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-4">
            <summary className="text-muted-foreground cursor-pointer text-xs">
              Error details
            </summary>
            <pre className="bg-muted mt-2 overflow-auto rounded p-2 text-xs">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
