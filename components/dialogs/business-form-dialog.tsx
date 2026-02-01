"use client";

import { FormDialog } from "@/components/dialogs/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  createBusiness,
  updateBusiness,
  updateBusinessCategories,
  updateBusinessTags,
} from "@/lib/actions/businesses";
import { useState } from "react";

type Option = {
  id: string;
  name: string;
};

type BusinessFormDialogProps = {
  trigger: React.ReactNode;
  business?: {
    id: string;
    name: string;
    tagIds?: string[];
    categoryIds?: string[];
  };
  tags: Option[];
  categories: Option[];
};

const BusinessFormDialog = ({
  trigger,
  business,
  tags = [],
  categories = [],
}: BusinessFormDialogProps) => {
  const [name, setName] = useState(business?.name ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    business?.tagIds ?? [],
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    business?.categoryIds ?? [],
  );

  const handleSubmit = async (
    closeDialog: () => void,
    setError: (error: string | null) => void,
  ) => {
    if (!name.trim()) {
      setError("Business name is required");
      return;
    }

    if (business?.id) {
      const updateResult = await updateBusiness(business.id, { name });

      if (!updateResult.success) {
        setError(
          updateResult.error.fields?.name?.[0] ??
            updateResult.error.message ??
            "Failed to update business",
        );
        return;
      }

      const tagsResult = await updateBusinessTags(business.id, selectedTags);

      if (!tagsResult.success) {
        setError(tagsResult.error.message);
        return;
      }

      const categoriesResult = await updateBusinessCategories(
        business.id,
        selectedCategories,
      );

      if (!categoriesResult.success) {
        setError(categoriesResult.error.message);
        return;
      }

      closeDialog();
      return;
    }

    const createResult = await createBusiness({ name });

    if (!createResult.success) {
      setError(
        createResult.error.fields?.name?.[0] ??
          createResult.error.message ??
          "Failed to create business",
      );
      return;
    }

    const newBusinessId = createResult.data.id;

    const tagsResult = await updateBusinessTags(newBusinessId, selectedTags);

    if (!tagsResult.success) {
      setError(tagsResult.error.message);
      return;
    }

    const categoriesResult = await updateBusinessCategories(
      newBusinessId,
      selectedCategories,
    );

    if (!categoriesResult.success) {
      setError(categoriesResult.error.message);
      return;
    }

    closeDialog();
  };

  const tagOptions = tags.map((tag) => ({
    label: tag.name,
    value: tag.id,
  }));

  const categoryOptions = categories.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));

  return (
    <FormDialog
      trigger={trigger}
      title={business ? "Edit business" : "Add business"}
      onSubmit={handleSubmit}
    >
      {({ isPending }) => (
        <div className="space-y-4">
          <Input
            placeholder="Business name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            aria-label="Business name"
            required
          />

          <div className="space-y-2">
            <Label>Categories</Label>
            <MultiSelect
              options={categoryOptions}
              value={selectedCategories}
              onValueChange={setSelectedCategories}
              placeholder="Select categories"
              emptyIndicator="No categories found"
              disabled={isPending}
              defaultValue={selectedCategories}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <MultiSelect
              options={tagOptions}
              value={selectedTags}
              onValueChange={setSelectedTags}
              placeholder="Select tags"
              emptyIndicator="No tags found"
              disabled={isPending}
              defaultValue={selectedTags}
            />
          </div>
        </div>
      )}
    </FormDialog>
  );
};

export default BusinessFormDialog;
