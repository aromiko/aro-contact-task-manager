"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  createBusiness,
  updateBusiness,
  updateBusinessCategories,
  updateBusinessTags,
} from "@/lib/actions/businesses";
import { useState, useTransition } from "react";

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
  const [pending, startTransition] = useTransition();

  const action = (formData: FormData) => {
    startTransition(async () => {
      const name = String(formData.get("name"));

      const tagIds = formData.getAll("tag_ids").map((id) => id.toString());

      const categoryIds = formData
        .getAll("category_ids")
        .map((id) => id.toString());

      if (business?.id) {
        await updateBusiness(business.id, { name });
        await updateBusinessTags(business.id, tagIds);
        await updateBusinessCategories(business.id, categoryIds);
      } else {
        const businessId = await createBusiness({ name });
        await updateBusinessTags(businessId, tagIds);
        await updateBusinessCategories(businessId, categoryIds);
      }
    });
  };

  const tagOptions = tags.map((tag) => ({
    label: tag.name,
    value: tag.id,
  }));

  const categoryOptions = categories.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));

  const [selectedTags, setSelectedTags] = useState<string[]>(
    business?.tagIds ?? [],
  );

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    business?.categoryIds ?? [],
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {business ? "Edit business" : "Add business"}
          </DialogTitle>
        </DialogHeader>

        <form action={action} className="space-y-4">
          <Input
            name="name"
            placeholder="Business name"
            defaultValue={business?.name}
            required
          />

          <div className="space-y-2">
            <Label>Categories</Label>

            <MultiSelect
              options={categoryOptions}
              value={selectedCategories}
              onValueChange={setSelectedCategories}
              defaultValue={business?.categoryIds ?? []}
              placeholder="Select categories"
              emptyIndicator="No categories found"
            />

            {selectedCategories.map((id) => (
              <input key={id} type="hidden" name="category_ids" value={id} />
            ))}
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>

            <MultiSelect
              options={tagOptions}
              value={selectedTags}
              onValueChange={setSelectedTags}
              defaultValue={business?.tagIds ?? []}
              placeholder="Select tags"
              emptyIndicator="No tags found"
            />

            {selectedTags.map((id) => (
              <input key={id} type="hidden" name="tag_ids" value={id} />
            ))}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessFormDialog;
