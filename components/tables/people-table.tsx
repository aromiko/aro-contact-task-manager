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

type PeopleTableProps = {
  people: Person[];
};

const PeopleTable = ({ people }: PeopleTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Business</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Created</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {people.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground text-center"
              >
                No people found
              </TableCell>
            </TableRow>
          )}

          {people.map((person) => (
            <TableRow key={person.id}>
              <TableCell className="font-medium">{person.name}</TableCell>

              <TableCell>{person.email ?? "—"}</TableCell>

              <TableCell>{person.phone ?? "—"}</TableCell>

              <TableCell>{person.business?.name ?? "—"}</TableCell>

              <TableCell>
                {person.person_tags && person.person_tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {person.person_tags.map(({ tag }) => (
                      <span
                        key={tag.id}
                        className="rounded bg-yellow-400 px-2 py-0.5 text-xs"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>

              <TableCell className="text-muted-foreground text-right">
                {new Date(person.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PeopleTable;
