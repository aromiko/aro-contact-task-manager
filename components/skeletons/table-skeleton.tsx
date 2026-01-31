import { Skeleton } from "../ui/skeleton";

export function TableSkeleton() {
  return (
    <div className="space-y-2">
      <div className="rounded-md border">
        <div className="bg-muted flex h-10 items-center px-4">
          <Skeleton className="h-4 w-1/4" />
        </div>

        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex h-10 items-center border-t px-4">
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
