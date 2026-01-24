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

import { completeTask, reopenTask } from "../../lib/actions/tasks";
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
                          disabled={isCompleting(task.id)}
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          {isCompleting(task.id) ? "Completing…" : "Complete"}
                        </Button>
                        <AssignTaskDialog
                          taskId={task.id}
                          people={people}
                          businesses={businesses}
                        />
                      </>
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
      </div>
    </>
  );
};

export default TasksTable;
