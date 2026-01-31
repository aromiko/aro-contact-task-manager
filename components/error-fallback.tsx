import { AlertCircle } from "lucide-react";

import { Button } from "./ui/button";

interface ErrorFallbackProps {
  error: string | Error;
  onRetry?: () => void;
  title?: string;
}

export function ErrorFallback({
  error,
  onRetry,
  title = "Error loading content",
}: ErrorFallbackProps) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-6">
      <div className="mb-4 flex items-center gap-3">
        <AlertCircle className="text-destructive h-5 w-5" />
        <h3 className="text-destructive font-semibold">{title}</h3>
      </div>

      <p className="text-muted-foreground mb-4 text-sm">{message}</p>

      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          Try again
        </Button>
      )}
    </div>
  );
}

export function LoadingFallback() {
  return (
    <div className="space-y-4">
      <div className="bg-muted h-8 w-32 animate-pulse rounded" />
      <div className="space-y-2">
        <div className="bg-muted h-4 w-full animate-pulse rounded" />
        <div className="bg-muted h-4 w-5/6 animate-pulse rounded" />
      </div>
    </div>
  );
}
