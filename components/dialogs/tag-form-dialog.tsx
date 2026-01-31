"use client";

import { FormDialog } from "@/components/dialogs/form-dialog";
import { Input } from "@/components/ui/input";
import { createTag, updateTag } from "@/lib/actions/tags";
import { useState } from "react";

type TagFormDialogProps = {
  trigger: React.ReactNode;
  tag?: {
    id: string;
    name: string;
  };
};

const TagFormDialog = ({ trigger, tag }: TagFormDialogProps) => {
  const [name, setName] = useState(tag?.name ?? "");

  const handleSubmit = async (
    closeDialog: () => void,
    setError: (error: string | null) => void,
  ) => {
    if (!name.trim()) {
      setError("Tag name is required");
      return;
    }

    try {
      if (tag) {
        await updateTag(tag.id, name);
      } else {
        await createTag(name);
      }
      closeDialog();
      setName("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save tag";
      setError(message);
      throw err;
    }
  };

  return (
    <FormDialog
      trigger={trigger}
      title={tag ? "Edit tag" : "Add tag"}
      onSubmit={handleSubmit}
    >
      {({ isPending }) => (
        <Input
          autoFocus
          placeholder="Tag name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          aria-label="Tag name"
        />
      )}
    </FormDialog>
  );
};

export default TagFormDialog;
