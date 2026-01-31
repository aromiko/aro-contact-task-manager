import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonProps {
  count?: number;
}

export function SkeletonLines({ count = 1 }: SkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}
