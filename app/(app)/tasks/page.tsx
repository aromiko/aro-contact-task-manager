import { createSupabaseServerActionClient } from "@/lib/supabase/server-actions";

import TasksTable from "../../../components/tables/tasks-table";

export default async function TasksPage() {
  const supabase = await createSupabaseServerActionClient();

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select(
      `
    id,
    title,
    status,
    created_at,
    task_assignments (
      person:people!task_assignments_person_id_fkey ( id, name ),
      business:businesses!task_assignments_business_id_fkey ( id, name )
    )
  `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return <pre>{error.message}</pre>;
  }

  const openTasks = tasks.filter((t) => t.status === "open");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const [{ data: people }, { data: businesses }] = await Promise.all([
    supabase.from("people").select("id, name").order("name"),
    supabase.from("businesses").select("id, name").order("name"),
  ]);

  return (
    <div className="container mx-auto space-y-8 p-6">
      <h1 className="text-4xl font-bold">TASK LIST</h1>
      <section className="space-y-2">
        <TasksTable
          tasks={openTasks}
          tableTitle="Open Tasks"
          people={people ?? []}
          businesses={businesses ?? []}
        />
      </section>

      <section className="space-y-2">
        <TasksTable
          tasks={completedTasks}
          tableTitle="Completed"
          people={people ?? []}
          businesses={businesses ?? []}
        />
      </section>
    </div>
  );
}
