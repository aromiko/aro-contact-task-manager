import PersonFormDialog from "@/components/dialogs/person-form-dialog";
import TablePagination from "@/components/pagination/pagination";
import PeopleTable from "@/components/tables/people-table";
import { Button } from "@/components/ui/button";
import { getPeople, getPeopleCount } from "@/lib/queries/people";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPagination } from "@/lib/utils/pagination";

type PeoplePageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

const PAGE_SIZE = 10;

const PeoplePage = async (props: PeoplePageProps) => {
  const searchParams = await props.searchParams;
  const rawPage = Math.max(1, Number(searchParams.page) || 1);
  const supabase = await createSupabaseServerClient();
  const totalCount = await getPeopleCount(supabase);

  const pagination = getPagination({
    rawPage,
    totalCount,
    pageSize: PAGE_SIZE,
  });

  const { data: people, error } = await getPeople(supabase, pagination);

  if (error) return <pre>{error.message}</pre>;

  return (
    <div className="container mx-auto space-y-8 p-6">
      <h1 className="text-4xl font-bold">PEOPLE</h1>

      <PersonFormDialog trigger={<Button>Add person</Button>} />

      <section className="space-y-2">
        <PeopleTable people={people ?? []} />

        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          paramKey="page"
        />
      </section>
    </div>
  );
};

export default PeoplePage;
