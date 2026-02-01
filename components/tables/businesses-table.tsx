"use client";

import BusinessFormDialog from "@/components/dialogs/business-form-dialog";
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
import { deleteBusiness } from "@/lib/actions/businesses";
import { Business } from "@/lib/types/business";
import { Trash2 } from "lucide-react";
import Link from "next/link";

type Option = { id: string; name: string };

type BusinessesTableProps = {
  businesses: Business[];
  tags: Option[];
  categories: Option[];
};

const BusinessesTable = ({
  businesses,
  tags,
  categories,
}: BusinessesTableProps) => {
  return (
    <div className="rounded-md border">
      <Table className="w-full min-w-5xl table-fixed lg:min-w-0">
        <TableHeader>
          <TableRow className="bg-primary hover:bg-primary/90">
            <TableHead className="text-white">Name</TableHead>
            <TableHead className="text-white">Categories</TableHead>
            <TableHead className="text-white">Tags</TableHead>
            <TableHead className="text-right text-white">Created</TableHead>
            <TableHead className="text-right text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {businesses.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground text-center"
              >
                No businesses
              </TableCell>
            </TableRow>
          )}

          {businesses.map((business) => (
            <TableRow key={business.id}>
              {/* Name */}
              <TableCell className="font-medium">
                <Link
                  href={`/businesses/${business.id}`}
                  className="text-blue-800 hover:underline"
                >
                  {business.name}
                </Link>
              </TableCell>

              {/* Categories */}
              <TableCell>
                {business.categories.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {business.categories.map((cat) => (
                      <Badge
                        key={cat.id}
                        variant="outline"
                        className="bg-muted"
                      >
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>

              {/* Tags */}
              <TableCell>
                {business.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {business.tags.map((tag) => (
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
                {business.created_at
                  ? new Date(business.created_at).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )
                  : "—"}
              </TableCell>

              <TableCell className="space-x-2 text-right">
                <BusinessFormDialog
                  key={business.id}
                  business={{
                    id: business.id,
                    name: business.name,
                    tagIds: business.tags.map((t) => t.id),
                    categoryIds: business.categories.map((c) => c.id),
                  }}
                  tags={tags}
                  categories={categories}
                  trigger={
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  }
                />

                <ConfirmDeleteDialog
                  title="Delete business?"
                  description="This business and its related assignments will be removed."
                  onConfirm={() => deleteBusiness(business.id)}
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

export default BusinessesTable;
