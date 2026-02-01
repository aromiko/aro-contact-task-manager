"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

interface FormDialogProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  children: (props: {
    error: string | null;
    isPending: boolean;
    setError: (error: string | null) => void;
  }) => React.ReactNode;
  onSubmit: (
    closeDialog: () => void,
    setError: (error: string | null) => void,
  ) => void;
}

export function FormDialog({
  trigger,
  title,
  description,
  children,
  onSubmit,
}: FormDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setIsPending(true);

    try {
      await onSubmit(
        () => {
          setOpen(false);
          setError(null);
        },
        (err) => {
          setError(err);
        },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Operation failed";
      setError(message);
      console.error("Form submission error:", err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="border-destructive/20 bg-destructive/5 flex gap-3 rounded-md border p-3">
              <AlertCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {children({ error, isPending, setError })}

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full"
            aria-busy={isPending}
          >
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
