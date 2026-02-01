"use client";

import ConfirmDeleteDialog from "@/components/dialogs/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { ActionResult } from "@/lib/types/action";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

type DeleteEntityButtonProps = {
  id: string;
  onDelete: (id: string) => Promise<ActionResult>;
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
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    const result = await onDelete(id);

    if (!result.success) {
      console.error(result.error.message);
      return false;
    }

    return true;
  };

  return (
    <ConfirmDeleteDialog
      title={title}
      description={description}
      onConfirm={async () => {
        startTransition(() => {});
        const success = await handleDelete();
        return success;
      }}
      trigger={
        <Button
          variant="destructive"
          disabled={isPending}
          size={isIconOnly ? "sm" : "default"}
          aria-label={isIconOnly ? buttonLabel : undefined}
        >
          {isIconOnly ? <Trash2 className="h-4 w-4" /> : buttonLabel}
        </Button>
      }
    />
  );
};

export default DeleteEntityButton;
