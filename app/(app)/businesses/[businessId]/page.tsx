import AddTaskDialog from "@/components/dialogs/add-task-dialog";
import { ErrorFallback } from "@/components/errors/error-fallback";
import TablePagination from "@/components/pagination/pagination";
import { mapTaskToTableItem } from "@/components/tables/task-table-mapper";
import TasksTable from "@/components/tables/tasks-table";
import { Button } from "@/components/ui/button";
import {
  getTaskCountByBusiness,
  getTasksByBusiness,
} from "@/lib/queries/tasks";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPagination } from "@/lib/utils/pagination";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import Loading from "./loading";

type BusinessTasksPageProps = {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ page?: string }>;
};

const PAGE_SIZE = 10;

const BusinessTasksPage = async (props: BusinessTasksPageProps) => {
  const { businessId } = await props.params;
  const searchParams = await props.searchParams;

  const supabase = await createSupabaseServerClient();

  // Check if business exists first, before fetching tasks
  const { data: business } = await supabase
    .from("businesses")
    .select("name")
    .eq("id", businessId)
    .maybeSingle();

  if (!business) notFound();

  const rawPage = Math.max(1, Number(searchParams.page) || 1);

  const totalCount = await getTaskCountByBusiness(supabase, businessId);

  const pagination = getPagination({
    rawPage,
    totalCount,
    pageSize: PAGE_SIZE,
  });

  const { data: tasks, error } = await getTasksByBusiness(
    supabase,
    businessId,
    pagination,
  );

  const taskItems = (tasks ?? []).map(mapTaskToTableItem);

  if (error)
    return (
      <ErrorFallback error={error} title="Failed to load business tasks" />
    );

  return (
    <Suspense fallback={<Loading />}>
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tasks for {business.name}</h1>

          <AddTaskDialog
            trigger={<Button>Add task</Button>}
            businessId={businessId}
          />
        </div>

        <Link
          href="/businesses"
          className="font-medium text-blue-800 hover:underline"
        >
          ← Back to businesses
        </Link>

        <div className="mt-6">
          <TasksTable tasks={taskItems ?? []} showPersonOnly hideAssignedTo />
        </div>

        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          paramKey="page"
        />
      </div>
    </Suspense>
  );
};

export default BusinessTasksPage;
