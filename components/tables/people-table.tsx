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
import { PersonTableItem } from "@/lib/types/people";
import { Trash2 } from "lucide-react";
import Link from "next/link";

import ConfirmDeleteDialog from "../dialogs/confirm-delete-dialog";
import PersonFormDialog from "../dialogs/person-form-dialog";
import { Badge } from "../ui/badge";

type PeopleTableProps = {
  people: PersonTableItem[];
  businesses: { id: string; name: string }[];
  tags: { id: string; name: string }[];
};

const PeopleTable = ({ people, businesses, tags }: PeopleTableProps) => {
  return (
    <div className="rounded-md border">
      <Table className="w-full min-w-300 table-fixed lg:min-w-0">
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
              <TableCell className="font-medium">
                <Link
                  href={`/people/${person.id}`}
                  className="text-blue-800 hover:underline"
                >
                  {person.name}
                </Link>
              </TableCell>

              <TableCell className="text-muted-foreground">
                {person.email ?? "—"}
              </TableCell>

              <TableCell className="text-muted-foreground">
                {person.phone ?? "—"}
              </TableCell>

              <TableCell>
                <Link
                  href={`/businesses/${person.business?.id}`}
                  className="font-medium text-blue-800 hover:underline"
                >
                  {person.business?.name ?? "—"}
                </Link>
              </TableCell>

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
                {person.created_at
                  ? new Date(person.created_at).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </TableCell>
              <TableCell className="space-x-2 text-right">
                <PersonFormDialog
                  key={person.id}
                  person={{
                    id: person.id,
                    name: person.name,
                    email: person.email,
                    phone: person.phone,
                    business_id: person.business?.id ?? null,
                    tagIds: person.tags.map((t) => t.id),
                  }}
                  businesses={businesses}
                  tags={tags}
                  trigger={
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  }
                />

                <ConfirmDeleteDialog
                  title="Delete person?"
                  description="This person and their assignments will be removed."
                  onConfirm={() => deletePerson(person.id)}
                  trigger={
                    <Button size="icon" variant="destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PeopleTable;
