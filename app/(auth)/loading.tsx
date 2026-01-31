import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md space-y-6 p-8">
        {/* Title skeleton */}
        <Skeleton className="h-8 w-32" />

        {/* Form fields skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Button skeleton */}
        <Skeleton className="h-10 w-full" />

        {/* Link skeleton */}
        <div className="flex justify-center">
          <Skeleton className="h-6 w-48" />
        </div>
      </Card>
    </div>
  );
}
