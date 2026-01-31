import { Skeleton } from "../ui/skeleton";
import { SkeletonLines } from "./skeleton-lines";

export function CardSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border p-6">
      <Skeleton className="h-6 w-1/3" />
      <SkeletonLines count={3} />
      <Skeleton className="h-9 w-24" />
    </div>
  );
}
