import type { BaseEntity, ISODateString, NamedRef } from "./base";

export type TaskStatus = "open" | "completed";

export type TaskAssignment = {
  person?: NamedRef[] | null;
  business?: NamedRef[] | null;
};

export type TaskAssignPayload =
  | { personId: string; businessId?: never }
  | { businessId: string; personId?: never };

export interface Task extends BaseEntity {
  title: string;
  status: TaskStatus;
  task_assignments?: TaskAssignment | TaskAssignment[];
}

export type TaskAction = "complete" | "reopen" | "delete";