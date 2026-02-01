"use client";

import { ErrorBoundary } from "@/components/errors/error-boundary";
import { ErrorFallback } from "@/components/errors/error-fallback";

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <main className="min-h-screen w-full p-6">
          <ErrorFallback
            error={error}
            title="Application Error"
            onRetry={reset}
          />
        </main>
      )}
    >
      <main className="min-h-screen w-full">{children}</main>
    </ErrorBoundary>
  );
}
