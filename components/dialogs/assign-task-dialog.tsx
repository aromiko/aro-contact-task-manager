"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignTask } from "@/lib/actions/tasks";
import { useState, useTransition } from "react";

type Option = { id: string; name: string };

type Props = {
  taskId: string;
  people: Option[];
  businesses: Option[];
};

const AssignTaskDialog = ({ taskId, people, businesses }: Props) => {
  const [type, setType] = useState<"person" | "business" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (!type || !selectedId) return;

    startTransition(async () => {
      if (type === "person") {
        await assignTask(taskId, { personId: selectedId });
      } else {
        await assignTask(taskId, { businessId: selectedId });
      }
      setOpen(false);
      setSelectedId(null);
      setType(null);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Assign
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select onValueChange={(v) => setType(v as "person" | "business")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Assign to…" />
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
              <SelectTrigger className="w-full">
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
            disabled={!type || !selectedId || isPending}
            onClick={handleSave}
          >
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTaskDialog;
