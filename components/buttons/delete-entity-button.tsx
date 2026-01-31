"use client";

import ConfirmDeleteDialog from "@/components/dialogs/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

type DeleteEntityButtonProps = {
  id: string;
  onDelete: (id: string) => Promise<void>;
  title?: string;
  description?: string;
  buttonLabel?: string;
  isIconOnly?: boolean;
};

const DeleteEntityButton = ({
  id,
  onDelete,
  title = "Delete item?",
  description = "This item will be permanently removed.",
  buttonLabel = "Delete",
  isIconOnly = false,
}: DeleteEntityButtonProps) => {
  const [pending, startTransition] = useTransition();

  return (
    <ConfirmDeleteDialog
      title={title}
      description={description}
      trigger={
        <Button
          variant="destructive"
          disabled={pending}
          size={isIconOnly ? "sm" : "default"}
          aria-label={isIconOnly ? buttonLabel : undefined}
        >
          {isIconOnly ? <Trash2 className="h-4 w-4" /> : buttonLabel}
        </Button>
      }
      onConfirm={() =>
        startTransition(async () => {
          await onDelete(id);
        })
      }
    />
  );
};

export default DeleteEntityButton;
