import PersonFormDialog from "@/components/dialogs/person-form-dialog";
import { ErrorFallback } from "@/components/errors/error-fallback";
import TablePagination from "@/components/pagination/pagination";
import PeopleTable from "@/components/tables/people-table";
import { mapPersonToTableItem } from "@/components/tables/people-table-mapper";
import { Button } from "@/components/ui/button";
import { getBusinessesLookup, getTagsLookup } from "@/lib/queries/lookups";
import { getPeople, getPeopleCount } from "@/lib/queries/people";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPagination } from "@/lib/utils/pagination";
import { Suspense } from "react";

import Loading from "./loading";

export const metadata = {
  title: "People",
};

type PeoplePageProps = {
  searchParams: {
    page?: string;
  };
};

const PAGE_SIZE = 10;

const PeoplePage = async (props: PeoplePageProps) => {
  const searchParams = await props.searchParams;
  const rawPage = Math.max(1, Number(searchParams.page) || 1);

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const totalCount = await getPeopleCount(supabase, user.id);

  const pagination = getPagination({
    rawPage,
    totalCount,
    pageSize: PAGE_SIZE,
  });

  const [{ data: people, error }, businesses, tags] = await Promise.all([
    getPeople(supabase, user.id, pagination),
    getBusinessesLookup(supabase),
    getTagsLookup(supabase),
  ]);

  if (error)
    return <ErrorFallback error={error} title="Failed to load people" />;

  const peopleItems = (people ?? []).map(mapPersonToTableItem);

  return (
    <Suspense fallback={<Loading />}>
      <div className="container mx-auto space-y-8 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">People</h1>

          <PersonFormDialog
            trigger={<Button>Add person</Button>}
            businesses={businesses}
            tags={tags}
          />
        </div>

        <section className="space-y-2">
          <PeopleTable
            people={peopleItems ?? []}
            businesses={businesses ?? []}
            tags={tags}
          />

          <TablePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            paramKey="page"
          />
        </section>
      </div>
    </Suspense>
  );
};

export default PeoplePage;
