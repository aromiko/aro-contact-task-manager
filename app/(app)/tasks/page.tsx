import AddTaskDialog from "@/components/dialogs/add-task-dialog";
import TablePagination from "@/components/pagination/pagination";
import TasksTable from "@/components/tables/tasks-table";
import { getPeopleAndBusinesses } from "@/lib/queries/lookups";
import {
  getCompletedTasks,
  getOpenTasks,
  getTaskCounts,
} from "@/lib/queries/tasks";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPagination } from "@/lib/utils/pagination";

type TasksPageProps = {
  searchParams: Promise<{
    openPage?: string;
    completedPage?: string;
  }>;
};

const PAGE_SIZE = 10;

const TasksPage = async (props: TasksPageProps) => {
  const searchParams = await props.searchParams;

  const rawOpenPage = Math.max(1, Number(searchParams.openPage) || 1);
  const rawCompletedPage = Math.max(1, Number(searchParams.completedPage) || 1);

  const supabase = await createSupabaseServerClient();

  const { openCount, completedCount } = await getTaskCounts(supabase);

  const openPagination = getPagination({
    rawPage: rawOpenPage,
    totalCount: openCount,
    pageSize: PAGE_SIZE,
  });

  const completedPagination = getPagination({
    rawPage: rawCompletedPage,
    totalCount: completedCount,
    pageSize: PAGE_SIZE,
  });

  const [
    { data: openTasks, error: openError },
    { data: completedTasks, error: completedError },
    { people, businesses },
  ] = await Promise.all([
    getOpenTasks(supabase, openPagination),
    getCompletedTasks(supabase, completedPagination),
    getPeopleAndBusinesses(supabase),
  ]);

  if (openError) return <pre>{openError.message}</pre>;
  if (completedError) return <pre>{completedError.message}</pre>;

  return (
    <div className="container mx-auto space-y-8 p-6">
      <h1 className="text-4xl font-bold">TASK LIST</h1>
      <AddTaskDialog people={people ?? []} businesses={businesses ?? []} />

      <section className="space-y-2">
        <TasksTable
          tasks={openTasks ?? []}
          tableTitle="Open Tasks"
          people={people}
          businesses={businesses}
        />

        <TablePagination
          page={openPagination.page}
          totalPages={openPagination.totalPages}
          paramKey="openPage"
        />
      </section>

      <section className="space-y-2">
        <TasksTable
          tasks={completedTasks ?? []}
          tableTitle="Completed Tasks"
          people={people}
          businesses={businesses}
        />

        <TablePagination
          page={completedPagination.page}
          totalPages={completedPagination.totalPages}
          paramKey="completedPage"
        />
      </section>
    </div>
  );
};

export default TasksPage;
