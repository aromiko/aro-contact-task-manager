import { Badge } from "@/components/ui/badge";
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
  return (
    <>
      {tableTitle && <h2 className="text-lg font-semibold">{tableTitle}</h2>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tasks.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={3}
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default TasksTable;
