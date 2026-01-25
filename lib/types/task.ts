export type PersonRef = {
  id: string;
  name: string;
};

export type BusinessRef = {
  id: string;
  name: string;
};

export type TaskAssignment = {
  person?: PersonRef[] | null;
  business?: BusinessRef[] | null;
};

export type TaskAssignPayload =
  | { personId: string; businessId?: never }
  | { businessId: string; personId?: never };

export type Task = {
  id: string;
  title: string;
  status: "open" | "completed";
  created_at: string;
  task_assignments?: TaskAssignment | TaskAssignment[];
};

export type TaskAction = "complete" | "reopen" | "delete";
