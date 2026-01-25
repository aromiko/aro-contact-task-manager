"use client";

import AssignTaskDialog from "@/components/dialogs/assign-task-dialog";
import ConfirmDeleteDialog from "@/components/dialogs/confirm-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { completeTask, deleteTask, reopenTask } from "@/lib/actions/tasks";
import { Task, TaskAction } from "@/lib/types/task";
import { normalizeRef } from "@/lib/utils/normalize-ref";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

type Option = { id: string; name: string };

type TasksTableProps = {
  tableTitle?: string;
  tasks: Task[];
  people?: Option[];
  businesses?: Option[];
  hideAssignedTo?: boolean;
  showPersonOnly?: boolean;
};

const getAssignment = (task: Task) => {
  const assignment = Array.isArray(task.task_assignments)
    ? task.task_assignments[0]
    : task.task_assignments;

  return {
    person: normalizeRef(assignment?.person),
    business: normalizeRef(assignment?.business),
  };
};

const AssignedToCell = ({
  task,
  showPersonOnly,
}: {
  task: Task;
  showPersonOnly?: boolean;
}) => {
  const { person, business } = getAssignment(task);

  if (showPersonOnly) {
    return person ? (
      <Link
        href={`/people/${person.id}`}
        className="font-medium text-blue-800 hover:underline"
      >
        {person.name}
      </Link>
    ) : (
      <span className="text-muted-foreground">—</span>
    );
  }

  if (person) {
    return (
      <Link
        href={`/people/${person.id}`}
        className="font-medium text-blue-800 hover:underline"
      >
        {person.name}
      </Link>
    );
  }

  if (business) {
    return (
      <Link
        href={`/businesses/${business.id}`}
        className="font-medium text-blue-800 hover:underline"
      >
        {business.name}
      </Link>
    );
  }

  return <span className="text-muted-foreground">—</span>;
};

const TasksTable = ({
  tableTitle,
  tasks,
  people,
  businesses,
  hideAssignedTo = false,
  showPersonOnly = false,
}: TasksTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [pendingTask, setPendingTask] = useState<{
    id: string;
    action: TaskAction;
  } | null>(null);

  const isLocked = (id: string) => isPending && pendingTask?.id === id;

  const runAction = (
    id: string,
    action: TaskAction,
    fn: () => Promise<void>,
  ) => {
    setPendingTask({ id, action });
    startTransition(async () => {
      await fn();
      setPendingTask(null);
    });
  };

  return (
    <>
      {tableTitle && <h2 className="text-lg font-semibold">{tableTitle}</h2>}

      <div className="w-full overflow-x-auto">
        <div className="rounded-md border">
          <Table className="w-full min-w-5xl table-fixed lg:min-w-0">
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary/90">
                <TableHead className="text-white">Task</TableHead>
                <TableHead className="text-white">Created</TableHead>
                {!hideAssignedTo && (
                  <TableHead className="text-white">Assigned To</TableHead>
                )}
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-right text-white">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {tasks.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={hideAssignedTo ? 4 : 5}
                    className="text-muted-foreground text-center"
                  >
                    No tasks
                  </TableCell>
                </TableRow>
              )}

              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>

                  <TableCell className="text-muted-foreground">
                    {new Date(task.created_at).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>

                  {!hideAssignedTo && (
                    <TableCell>
                      <AssignedToCell
                        task={task}
                        showPersonOnly={showPersonOnly}
                      />
                    </TableCell>
                  )}

                  <TableCell>
                    {task.status === "open" ? (
                      <Badge variant="secondary">Open</Badge>
                    ) : (
                      <Badge className="bg-green-800">Completed</Badge>
                    )}
                  </TableCell>

                  <TableCell className="space-x-2 text-right">
                    {task.status === "open" ? (
                      <>
                        <Button
                          size="sm"
                          disabled={isLocked(task.id)}
                          onClick={() =>
                            runAction(task.id, "complete", () =>
                              completeTask(task.id),
                            )
                          }
                        >
                          Complete
                        </Button>

                        {people && businesses && (
                          <AssignTaskDialog
                            taskId={task.id}
                            people={people}
                            businesses={businesses}
                          />
                        )}

                        <ConfirmDeleteDialog
                          title="Delete task?"
                          description="This task will be permanently removed."
                          onConfirm={() =>
                            runAction(task.id, "delete", () =>
                              deleteTask(task.id),
                            )
                          }
                          trigger={
                            <Button
                              size="icon"
                              variant="destructive"
                              disabled={isLocked(task.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isLocked(task.id)}
                        onClick={() =>
                          runAction(task.id, "reopen", () =>
                            reopenTask(task.id),
                          )
                        }
                      >
                        Reopen
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default TasksTable;
