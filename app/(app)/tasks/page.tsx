import { createSupabaseServerClient } from "@/lib/supabase/server";

import TasksTable from "./tasks-table";

export default async function TasksPage() {
  const supabase = await createSupabaseServerClient();

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select(
      `
    id,
    title,
    status,
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

  return (
    <div className="space-y-8 p-6">
      <section className="space-y-2">
        <TasksTable tasks={openTasks} tableTitle="Open Tasks" />
      </section>

      <section className="space-y-2">
        <TasksTable tasks={completedTasks} tableTitle="Completed" />
      </section>
    </div>
  );
}
