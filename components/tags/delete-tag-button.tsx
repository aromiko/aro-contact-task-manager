"use client";

import ConfirmDeleteDialog from "@/components/dialogs/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { deleteTag } from "@/lib/actions/tags";
import { useTransition } from "react";

type DeleteTagButtonProps = {
  tagId: string;
};

const DeleteTagButton = ({ tagId }: DeleteTagButtonProps) => {
  const [pending, startTransition] = useTransition();

  return (
    <ConfirmDeleteDialog
      title="Delete tag?"
      description="This tag will be permanently removed."
      trigger={
        <Button variant="destructive" disabled={pending}>
          Delete
        </Button>
      }
      onConfirm={() =>
        startTransition(async () => {
          await deleteTag(tagId);
        })
      }
    />
  );
};

export default DeleteTagButton;
