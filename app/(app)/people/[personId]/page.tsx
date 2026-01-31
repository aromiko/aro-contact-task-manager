import AddTaskDialog from "@/components/dialogs/add-task-dialog";
import { ErrorFallback } from "@/components/error-fallback";
import TablePagination from "@/components/pagination/pagination";
import TasksTable from "@/components/tables/tasks-table";
import { Button } from "@/components/ui/button";
import { getTaskCountByPerson, getTasksByPerson } from "@/lib/queries/tasks";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPagination } from "@/lib/utils/pagination";
import Link from "next/link";

type PersonTasksPageProps = {
  params: Promise<{ personId: string }>;
  searchParams: Promise<{ page?: string }>;
};

const PAGE_SIZE = 10;

const PersonTasksPage = async (props: PersonTasksPageProps) => {
  const { personId } = await props.params;
  const searchParams = await props.searchParams;

  const rawPage = Math.max(1, Number(searchParams.page) || 1);

  const supabase = await createSupabaseServerClient();

  const totalCount = await getTaskCountByPerson(supabase, personId);

  const pagination = getPagination({
    rawPage,
    totalCount,
    pageSize: PAGE_SIZE,
  });

  const { data: tasks, error } = await getTasksByPerson(
    supabase,
    personId,
    pagination,
  );

  const { data: person } = await supabase
    .from("people")
    .select("id, name, business_id")
    .eq("id", personId)
    .single();

  if (error)
    return (
      <ErrorFallback error={error} title="Failed to load person's tasks" />
    );

  if (!person) {
    return <pre>Person not found</pre>;
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{person?.name}</h1>

        <AddTaskDialog
          trigger={<Button>Add task</Button>}
          personId={personId}
          businessId={person.business_id}
        />
      </div>

      <Link
        href="/people"
        className="font-medium text-blue-800 hover:underline"
      >
        ← Back to people
      </Link>

      <div className="mt-6">
        <TasksTable tasks={tasks ?? []} hideAssignedTo />
      </div>

      <TablePagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        paramKey="page"
      />
    </div>
  );
};

export default PersonTasksPage;
