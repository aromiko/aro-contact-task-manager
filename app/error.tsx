"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-gray-600">{error.message}</p>
          <Button onClick={reset} className="mt-4">
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
