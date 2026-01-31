"use client";

import { FormDialog } from "@/components/dialogs/form-dialog";
import { Input } from "@/components/ui/input";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import { useState } from "react";

type CategoryFormDialogProps = {
  trigger: React.ReactNode;
  category?: {
    id: string;
    name: string;
  };
};

const CategoryFormDialog = ({ trigger, category }: CategoryFormDialogProps) => {
  const [name, setName] = useState(category?.name ?? "");

  const handleSubmit = async (
    closeDialog: () => void,
    setError: (error: string | null) => void,
  ) => {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      if (category) {
        await updateCategory(category.id, name);
      } else {
        await createCategory(name);
      }
      closeDialog();
      setName("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save category";
      setError(message);
      throw err;
    }
  };

  return (
    <FormDialog
      trigger={trigger}
      title={category ? "Edit category" : "Add category"}
      onSubmit={handleSubmit}
    >
      {({ isPending }) => (
        <Input
          autoFocus
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          aria-label="Category name"
        />
      )}
    </FormDialog>
  );
};

export default CategoryFormDialog;
