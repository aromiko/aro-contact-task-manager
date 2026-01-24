"use client";

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
import { Task, TaskAction } from "@/lib/types/task";
import { normalizeRef } from "@/lib/utils/normalize-ref";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { completeTask, deleteTask, reopenTask } from "../../lib/actions/tasks";
import AddTaskDialog from "../dialogs/add-task-dialog";
import AssignTaskDialog from "../dialogs/assign-task-dialog";

function getAssignment(task: Task) {
  const assignment = Array.isArray(task.task_assignments)
    ? task.task_assignments[0]
    : task.task_assignments;

  return {
    person: assignment?.person ?? null,
    business: assignment?.business ?? null,
  };
}

type Option = { id: string; name: string };

type TasksTableProps = {
  tableTitle?: string;
  tasks: Task[];
  people: Option[];
  businesses: Option[];
};

const TasksTable = ({
  tableTitle,
  tasks,
  people,
  businesses,
}: TasksTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [pendingTask, setPendingTask] = useState<{
    id: string;
    action: TaskAction;
  } | null>(null);

  const isTaskLocked = (taskId: string) =>
    isPending && pendingTask?.id === taskId;

  const handleCompleteTask = (taskId: string) => {
    setPendingTask({ id: taskId, action: "complete" });

    startTransition(async () => {
      await completeTask(taskId);
      setPendingTask(null);
    });
  };

  const handleReopenTask = (taskId: string) => {
    setPendingTask({ id: taskId, action: "reopen" });

    startTransition(async () => {
      await reopenTask(taskId);
      setPendingTask(null);
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setPendingTask({ id: taskId, action: "delete" });

    startTransition(async () => {
      await deleteTask(taskId);
      setPendingTask(null);
    });
  };

  return (
    <>
      {tableTitle && <h2 className="text-lg font-semibold">{tableTitle}</h2>}
      <AddTaskDialog people={people ?? []} businesses={businesses ?? []} />
      <div className="w-full overflow-x-auto">
        <Table className="w-full min-w-5xl table-fixed lg:min-w-0">
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary/90">
              <TableHead className="text-white">Task</TableHead>
              <TableHead className="text-white">Created</TableHead>
              <TableHead className="text-white">Assigned To</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-right text-white">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tasks.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground text-center"
                >
                  No tasks
                </TableCell>
              </TableRow>
            )}

            {tasks.map((task) => {
              const { person, business } = getAssignment(task);
              const personRef = normalizeRef(person);
              const businessRef = normalizeRef(business);
              const assignedName = personRef?.name ?? businessRef?.name ?? "—";

              return (
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

                  <TableCell>{assignedName}</TableCell>

                  <TableCell>
                    {task.status === "open" ? (
                      <Badge variant="secondary">Open</Badge>
                    ) : (
                      <Badge className="bg-green-800">Completed</Badge>
                    )}
                  </TableCell>

                  <TableCell className="space-x-2 text-right">
                    {task.status === "open" && (
                      <>
                        <Button
                          size="sm"
                          disabled={isTaskLocked(task.id)}
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          {pendingTask?.id === task.id &&
                          pendingTask.action === "complete"
                            ? "Completing…"
                            : "Complete"}
                        </Button>
                        <AssignTaskDialog
                          taskId={task.id}
                          people={people}
                          businesses={businesses}
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          disabled={isTaskLocked(task.id)}
                          className="rounded-full"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </Button>
                      </>
                    )}

                    {task.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isTaskLocked(task.id)}
                        onClick={() => handleReopenTask(task.id)}
                      >
                        {pendingTask?.id === task.id &&
                        pendingTask.action === "reopen"
                          ? "Reopening…"
                          : "Reopen"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default TasksTable;
