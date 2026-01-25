"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import { useState, useTransition } from "react";

type CategoryFormDialogProps = {
  trigger: React.ReactNode;
  category?: {
    id: string;
    name: string;
  };
};

const CategoryFormDialog = ({ trigger, category }: CategoryFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(category?.name ?? "");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    startTransition(async () => {
      if (category) {
        await updateCategory(category.id, name);
      } else {
        await createCategory(name);
      }

      setOpen(false);
      setName("");
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit category" : "Add category"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            autoFocus
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={pending}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={pending || !name.trim()}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryFormDialog;
