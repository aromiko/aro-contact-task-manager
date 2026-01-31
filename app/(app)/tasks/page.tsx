import AddTaskDialog from "@/components/dialogs/add-task-dialog";
import { ErrorFallback } from "@/components/errors/error-fallback";
import TablePagination from "@/components/pagination/pagination";
import TasksTable from "@/components/tables/tasks-table";
import { Button } from "@/components/ui/button";
import { getBusinessesLookup, getPeopleLookup } from "@/lib/queries/lookups";
import {
  getCompletedTasks,
  getOpenTasks,
  getTaskCounts,
} from "@/lib/queries/tasks";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPagination } from "@/lib/utils/pagination";
import { Suspense } from "react";

import Loading from "./loading";

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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { openCount, completedCount } = await getTaskCounts(supabase, user.id);

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
    people,
    businesses,
  ] = await Promise.all([
    getOpenTasks(supabase, user.id, openPagination),
    getCompletedTasks(supabase, user.id, completedPagination),
    getPeopleLookup(supabase),
    getBusinessesLookup(supabase),
  ]);

  if (openError)
    return (
      <ErrorFallback error={openError} title="Failed to load open tasks" />
    );
  if (completedError)
    return (
      <ErrorFallback
        error={completedError}
        title="Failed to load completed tasks"
      />
    );

  return (
    <Suspense fallback={<Loading />}>
      <div className="container mx-auto space-y-8 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Tasks List</h1>

          <AddTaskDialog
            people={people ?? []}
            businesses={businesses ?? []}
            trigger={<Button>Add task</Button>}
          />
        </div>

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
    </Suspense>
  );
};

export default TasksPage;
