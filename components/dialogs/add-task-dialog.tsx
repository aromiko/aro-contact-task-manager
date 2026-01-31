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
import { AlertCircle } from "lucide-react";
import { useState, useTransition } from "react";

type PersonOption = {
  id: string;
  name: string;
  business_id: string;
};

type BusinessOption = {
  id: string;
  name: string;
};

type AddTaskDialogProps = {
  trigger: React.ReactNode;
  people?: PersonOption[];
  businesses?: BusinessOption[];
  personId?: string;
  businessId?: string;
};

const AddTaskDialog = ({
  trigger,
  people,
  businesses,
  personId,
  businessId,
}: AddTaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"person" | "business" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isPersonScoped = Boolean(personId);
  const isBusinessScoped = Boolean(businessId);

  const handleCreate = () => {
    setError(null);

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    if (!isBusinessScoped && !isPersonScoped && !type) {
      setError("Please choose where to assign the task");
      return;
    }

    startTransition(async () => {
      try {
        let resolvedBusinessId: string | null = null;
        let resolvedPersonId: string | undefined = undefined;

        if (isBusinessScoped && businessId) {
          resolvedBusinessId = businessId;
        }

        if (isPersonScoped && personId && businessId) {
          resolvedBusinessId = businessId;
          resolvedPersonId = personId;
        }

        if (!isBusinessScoped && !isPersonScoped) {
          if (type === "business") {
            resolvedBusinessId = selectedId;
          }

          if (type === "person") {
            const person = people?.find((p) => p.id === selectedId);
            if (!person) {
              setError("Selected person not found");
              return;
            }
            resolvedBusinessId = person.business_id;
            resolvedPersonId = person.id;
          }
        }

        if (!resolvedBusinessId) {
          setError("Unable to resolve business. Please try again.");
          return;
        }

        await createTask({
          title,
          businessId: resolvedBusinessId,
          personId: resolvedPersonId,
        });

        setTitle("");
        setType(null);
        setSelectedId(null);
        setOpen(false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create task";
        setError(message);
        console.error("Task creation error:", err);
      }
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
          {error && (
            <div className="border-destructive/20 bg-destructive/5 flex gap-3 rounded-md border p-3">
              <AlertCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <Input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            aria-label="Task title"
            aria-invalid={error ? "true" : "false"}
          />

          {!isPersonScoped && !isBusinessScoped && (
            <Select
              onValueChange={(v) => {
                setType(v as "person" | "business" | null);
                setSelectedId(null);
              }}
            >
              <SelectTrigger className="w-full" aria-label="Assignment type">
                <SelectValue placeholder="Assign to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="person">Person</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          )}

          {!isPersonScoped && !isBusinessScoped && type === "person" && (
            <Select onValueChange={setSelectedId} aria-label="Select person">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent>
                {people?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {!isPersonScoped && !isBusinessScoped && type === "business" && (
            <Select onValueChange={setSelectedId} aria-label="Select business">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select business" />
              </SelectTrigger>
              <SelectContent>
                {businesses?.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            className="w-full"
            disabled={
              !title.trim() ||
              isPending ||
              (!isBusinessScoped && !isPersonScoped && (!type || !selectedId))
            }
            onClick={handleCreate}
          >
            {isPending ? "Creating…" : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;
