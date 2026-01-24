type PaginationInput = {
  rawPage: number;
  totalCount: number | null;
  pageSize: number;
};

export function getPagination({
  rawPage,
  totalCount,
  pageSize,
}: PaginationInput) {
  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : 1;

  const page = Math.min(Math.max(rawPage, 1), totalPages);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return {
    page,
    totalPages,
    from,
    to,
  };
}
