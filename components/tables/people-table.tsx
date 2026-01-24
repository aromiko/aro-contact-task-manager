"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Person } from "@/lib/types/people";

import { Badge } from "../ui/badge";

type PeopleTableProps = {
  people: Person[];
};

const PeopleTable = ({ people }: PeopleTableProps) => {
  return (
    <div className="rounded-md border">
      <Table className="w-full min-w-5xl table-fixed lg:min-w-0">
        <TableHeader>
          <TableRow className="bg-primary hover:bg-primary/90">
            <TableHead className="text-white">Name</TableHead>
            <TableHead className="text-white">Email</TableHead>
            <TableHead className="text-white">Phone</TableHead>
            <TableHead className="text-white">Business</TableHead>
            <TableHead className="text-white">Tags</TableHead>
            <TableHead className="text-right text-white">Created</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {people.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-muted-foreground text-center"
              >
                No people
              </TableCell>
            </TableRow>
          )}

          {people.map((person) => (
            <TableRow key={person.id}>
              <TableCell className="font-medium">{person.name}</TableCell>

              <TableCell className="text-muted-foreground">
                {person.email ?? "—"}
              </TableCell>

              <TableCell className="text-muted-foreground">
                {person.phone ?? "—"}
              </TableCell>

              <TableCell>{person.business?.name ?? "—"}</TableCell>

              <TableCell>
                {person.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {person.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="bg-blue-50 font-normal text-blue-700"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>

              <TableCell className="text-muted-foreground text-right">
                {new Date(person.created_at).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PeopleTable;
