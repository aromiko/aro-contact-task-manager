import AddTaskDialog from "@/components/dialogs/add-task-dialog";
import TablePagination from "@/components/pagination/pagination";
import TasksTable from "@/components/tables/tasks-table";
import { Button } from "@/components/ui/button";
import {
  getTaskCountByBusiness,
  getTasksByBusiness,
} from "@/lib/queries/tasks";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPagination } from "@/lib/utils/pagination";
import Link from "next/link";

type BusinessTasksPageProps = {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ page?: string }>;
};

const PAGE_SIZE = 10;

const BusinessTasksPage = async (props: BusinessTasksPageProps) => {
  const { businessId } = await props.params;
  const searchParams = await props.searchParams;

  const rawPage = Math.max(1, Number(searchParams.page) || 1);

  const supabase = await createSupabaseServerClient();

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

  const { data: business } = await supabase
    .from("businesses")
    .select("name")
    .eq("id", businessId)
    .maybeSingle();

  if (error) return <pre>{error.message}</pre>;
  if (!business) return <p>Business not found</p>;

  return (
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
        <TasksTable tasks={tasks ?? []} showPersonOnly />
      </div>

      <TablePagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        paramKey="page"
      />
    </div>
  );
};

export default BusinessTasksPage;
