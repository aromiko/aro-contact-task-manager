import BusinessFormDialog from "@/components/dialogs/business-form-dialog";
import { ErrorFallback } from "@/components/error-fallback";
import TablePagination from "@/components/pagination/pagination";
import BusinessesTable from "@/components/tables/businesses-table";
import { Button } from "@/components/ui/button";
import { getBusinessCount, getBusinesses } from "@/lib/queries/businesses";
import { getCategories } from "@/lib/queries/categories";
import { getTags } from "@/lib/queries/tags";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPagination } from "@/lib/utils/pagination";

type BusinessesPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

const PAGE_SIZE = 10;

const BusinessesPage = async (props: BusinessesPageProps) => {
  const searchParams = await props.searchParams;
  const rawPage = Math.max(1, Number(searchParams.page) || 1);

  const supabase = await createSupabaseServerClient();

  const totalCount = await getBusinessCount(supabase);

  const pagination = getPagination({
    rawPage,
    totalCount,
    pageSize: PAGE_SIZE,
  });

  const [{ data: businesses, error }, categories, tags] = await Promise.all([
    getBusinesses(supabase, pagination),
    getCategories(supabase),
    getTags(supabase),
  ]);

  if (error)
    return <ErrorFallback error={error} title="Failed to load businesses" />;

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Businesses</h1>

        <BusinessFormDialog
          tags={tags}
          categories={categories}
          trigger={<Button>Add business</Button>}
        />
      </div>

      <section className="space-y-2">
        <BusinessesTable
          businesses={businesses ?? []}
          tags={tags}
          categories={categories}
        />

        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          paramKey="page"
        />
      </section>
    </div>
  );
};

export default BusinessesPage;
