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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTask } from "@/lib/actions/tasks";
import { useState, useTransition } from "react";

type Option = { id: string; name: string };

type Props = {
  people: Option[];
  businesses: Option[];
};

export default function AddTaskDialog({ people, businesses }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"person" | "business" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    if (!title.trim()) return;

    startTransition(async () => {
      await createTask({
        title,
        personId: type === "person" ? (selectedId ?? undefined) : undefined,
        businessId: type === "business" ? (selectedId ?? undefined) : undefined,
      });

      setTitle("");
      setType(null);
      setSelectedId(null);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Task</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
          />

          <Select
            onValueChange={(v) => setType(v as "person" | "business" | null)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Assign to (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="person">Person</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>

          {type === "person" && (
            <Select onValueChange={setSelectedId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent>
                {people.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {type === "business" && (
            <Select onValueChange={setSelectedId}>
              <SelectTrigger>
                <SelectValue placeholder="Select business" />
              </SelectTrigger>
              <SelectContent>
                {businesses.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            className="w-full"
            disabled={!title.trim() || isPending}
            onClick={handleCreate}
          >
            {isPending ? "Creating…" : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
