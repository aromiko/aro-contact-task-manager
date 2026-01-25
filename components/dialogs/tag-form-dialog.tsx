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
import { createTag, updateTag } from "@/lib/actions/tags";
import { useState, useTransition } from "react";

type TagFormDialogProps = {
  trigger: React.ReactNode;
  tag?: {
    id: string;
    name: string;
  };
};

const TagFormDialog = ({ trigger, tag }: TagFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(tag?.name ?? "");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    startTransition(async () => {
      if (tag) {
        await updateTag(tag.id, name);
      } else {
        await createTag(name);
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
          <DialogTitle>{tag ? "Edit tag" : "Add tag"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            autoFocus
            placeholder="Tag name"
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

export default TagFormDialog;
