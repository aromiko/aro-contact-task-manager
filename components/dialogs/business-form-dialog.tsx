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

    try {
      if (business?.id) {
        await updateBusiness(business.id, { name });
        await updateBusinessTags(business.id, selectedTags);
        await updateBusinessCategories(business.id, selectedCategories);
      } else {
        const businessId = await createBusiness({ name });
        await updateBusinessTags(businessId, selectedTags);
        await updateBusinessCategories(businessId, selectedCategories);
      }
      closeDialog();
      setName("");
      setSelectedTags([]);
      setSelectedCategories([]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save business";
      setError(message);
      throw err;
    }
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
            />
          </div>
        </div>
      )}
    </FormDialog>
  );
};

export default BusinessFormDialog;
