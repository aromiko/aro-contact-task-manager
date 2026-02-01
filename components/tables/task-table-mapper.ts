import { TaskTableItem } from "@/lib/types/task";

type TaskWithAssignment = {
  id: string;
  title: string;
  status: string;
  created_at: string | null;
  task_assignments?: {
    person?: {
      id: string;
      name: string;
    } | null;
    business?: {
      id: string;
      name: string;
    } | null;
  } | null;
};

export const mapTaskToTableItem = (task: TaskWithAssignment): TaskTableItem => {
  const assignment = task.task_assignments;

  if (assignment?.person) {
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      created_at: task.created_at,
      assignee: {
        type: "person",
        id: assignment.person.id,
        name: assignment.person.name,
      },
    };
  }

  if (assignment?.business) {
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      created_at: task.created_at,
      assignee: {
        type: "business",
        id: assignment.business.id,
        name: assignment.business.name,
      },
    };
  }

  return {
    id: task.id,
    title: task.title,
    status: task.status,
    created_at: task.created_at,
    assignee: null,
  };
};
