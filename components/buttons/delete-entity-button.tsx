"use client";

import ConfirmDeleteDialog from "@/components/dialogs/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";

type DeleteEntityButtonProps = {
  id: string;
  onDelete: (id: string) => Promise<void>;
  title?: string;
  description?: string;
  buttonLabel?: string;
};

const DeleteEntityButton = ({
  id,
  onDelete,
  title = "Delete item?",
  description = "This item will be permanently removed.",
  buttonLabel = "Delete",
}: DeleteEntityButtonProps) => {
  const [pending, startTransition] = useTransition();

  return (
    <ConfirmDeleteDialog
      title={title}
      description={description}
      trigger={
        <Button variant="destructive" disabled={pending}>
          {buttonLabel}
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
