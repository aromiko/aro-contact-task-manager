"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deletePerson } from "@/lib/actions/people";
import { Person } from "@/lib/types/people";
import { Trash2 } from "lucide-react";

import PersonFormDialog from "../dialogs/person-form-dialog";
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
            <TableHead className="text-right text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {people.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
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
              <TableCell className="space-x-2 text-right">
                <PersonFormDialog
                  person={{
                    id: person.id,
                    name: person.name,
                    email: person.email,
                    phone: person.phone,
                    business_id: null,
                  }}
                  trigger={
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  }
                />

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => deletePerson(person.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PeopleTable;
