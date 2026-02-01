import type { Tables } from "@/lib/types/database";

export type AssignTaskPayload =
  | { person_id: string; business_id?: null }
  | { business_id: string; person_id?: null };

export type CreateTaskInput = {
  title: string;
  description?: string | null;
  businessId: string;
  personId?: string;
};

export type TaskRow = Tables<"tasks">;

export type TaskAssignmentJoin = {
  task_assignments:
    | {
        person: Tables<"people"> | null;
        business: Tables<"businesses"> | null;
      }[]
    | null;
};

export type Task = TaskRow & TaskAssignmentJoin;

export type TaskAction = "complete" | "reopen" | "delete";
