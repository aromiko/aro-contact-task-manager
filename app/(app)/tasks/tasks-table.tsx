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
import { Task } from "@/lib/types/task";
import { normalizeRef } from "@/lib/utils";
import { useState, useTransition } from "react";

import { completeTask, reopenTask } from "./actions";

function getAssignment(task: Task) {
  const assignment = Array.isArray(task.task_assignments)
    ? task.task_assignments[0]
    : task.task_assignments;

  return {
    person: assignment?.person ?? null,
    business: assignment?.business ?? null,
  };
}

type TasksTableProps = {
  tableTitle?: string;
  tasks: Task[];
};

const TasksTable = ({ tableTitle, tasks }: TasksTableProps) => {
  const [isPending, startTransition] = useTransition();
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const isCompleting = (taskId: string) =>
    isPending && completingTaskId === taskId;

  const handleCompleteTask = (taskId: string) => {
    setCompletingTaskId(taskId);

    startTransition(async () => {
      await completeTask(taskId);
      setCompletingTaskId(null);
    });
  };

  const handleReopenTask = (taskId: string) => {
    setCompletingTaskId(taskId);

    startTransition(async () => {
      await reopenTask(taskId);
      setCompletingTaskId(null);
    });
  };

  return (
    <>
      {tableTitle && <h2 className="text-lg font-semibold">{tableTitle}</h2>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tasks.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
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

                <TableCell>{assignedName}</TableCell>

                <TableCell>
                  {task.status === "open" ? (
                    <Badge variant="secondary">Open</Badge>
                  ) : (
                    <Badge variant="outline">Completed</Badge>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  {task.status === "open" && (
                    <Button
                      size="sm"
                      disabled={isCompleting(task.id)}
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      {isCompleting(task.id) ? "Completing…" : "Complete"}
                    </Button>
                  )}

                  {task.status === "completed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isCompleting(task.id)}
                      onClick={() => handleReopenTask(task.id)}
                    >
                      {isCompleting(task.id) ? "Reopening…" : "Reopen"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default TasksTable;
