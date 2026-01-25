"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";

type TablePaginationProps = {
  page: number;
  totalPages: number;
  paramKey: string;
};

const TablePagination = ({
  page,
  totalPages,
  paramKey,
}: TablePaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramKey, String(p));
    router.push(`?${params.toString()}`);
  };

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            onClick={() => goToPage(page - 1)}
            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {/* Page numbers */}
        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNumber = i + 1;

          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                isActive={pageNumber === page}
                onClick={() => goToPage(pageNumber)}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            onClick={() => goToPage(page + 1)}
            className={
              page >= totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default TablePagination;
