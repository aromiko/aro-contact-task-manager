import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  showPagination?: boolean;
}

export function TableSkeleton({
  columns = 5,
  rows = 8,
  showPagination = true,
}: TableSkeletonProps) {
  const columnWidths =
    columns === 3
      ? ["w-6", "flex-1", "w-20"]
      : ["w-6", "flex-1", "flex-1", "flex-1", "w-20"];

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {columnWidths.map((width, i) => (
              <Skeleton key={`header-${i}`} className={`h-6 ${width}`} />
            ))}
          </div>

          {Array.from({ length: rows }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex items-center gap-4">
              {columnWidths.map((width, colIdx) => (
                <Skeleton
                  key={`${rowIdx}-${colIdx}`}
                  className={`h-6 ${width}`}
                />
              ))}
            </div>
          ))}
        </div>
      </Card>

      {showPagination && (
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="h-10 w-10" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-10" />
          ))}
          <Skeleton className="h-10 w-10" />
        </div>
      )}
    </>
  );
}

interface PageSkeletonProps {
  columns?: number;
  rows?: number;
}

export function PageSkeleton({ columns = 5, rows = 8 }: PageSkeletonProps) {
  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table skeleton */}
      <TableSkeleton columns={columns} rows={rows} showPagination />
    </div>
  );
}

interface DetailSkeletonProps {
  columns?: number;
  rows?: number;
}

export function DetailSkeleton({ columns = 5, rows = 8 }: DetailSkeletonProps) {
  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-8 w-96" />
      </div>

      {/* Content skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table skeleton */}
      <TableSkeleton columns={columns} rows={rows} showPagination />
    </div>
  );
}
