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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createPerson,
  updatePerson,
  updatePersonTags,
} from "@/lib/actions/people";
import { useState, useTransition } from "react";

type PersonFormDialogProps = {
  trigger: React.ReactNode;
  person?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    business_id: string | null;
    tagIds?: string[];
  };
  businesses: { id: string; name: string }[];
  tags: { id: string; name: string }[];
};

const PersonFormDialog = ({
  trigger,
  person,
  businesses = [],
  tags = [],
}: PersonFormDialogProps) => {
  const [pending, startTransition] = useTransition();
  const [selectedBusinessId, setSelectedBusinessId] = useState(
    person?.business_id ?? "",
  );

  const action = (formData: FormData) => {
    startTransition(async () => {
      const name = String(formData.get("name"));
      const email = formData.get("email")?.toString() || null;
      const phone = formData.get("phone")?.toString() || null;
      const business_id = formData.get("business_id")?.toString();

      if (!business_id) {
        throw new Error("Business is required");
      }

      const tagIds = formData.getAll("tag_ids").map((id) => id.toString());

      if (person?.id) {
        await updatePerson(person.id, {
          name,
          email,
          phone,
          business_id,
        });

        await updatePersonTags(person.id, tagIds);
      } else {
        const personId = await createPerson({
          name,
          email,
          phone,
          business_id,
        });

        await updatePersonTags(personId, tagIds);
      }
    });
  };

  const tagOptions = tags.map((tag) => ({
    label: tag.name,
    value: tag.id,
  }));
  const [selectedTags, setSelectedTags] = useState<string[]>(
    person?.tagIds ?? [],
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{person ? "Edit person" : "Add person"}</DialogTitle>
        </DialogHeader>

        <form action={action} className="space-y-4">
          <Input
            name="name"
            placeholder="Name"
            defaultValue={person?.name}
            required
          />

          <Input
            name="email"
            placeholder="Email"
            defaultValue={person?.email ?? ""}
          />

          <Input
            name="phone"
            placeholder="Phone"
            defaultValue={person?.phone ?? ""}
          />

          <Select
            name="business_id"
            defaultValue={person?.business_id ?? undefined}
            onValueChange={setSelectedBusinessId}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select business" />
            </SelectTrigger>

            <SelectContent>
              {businesses.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-2">
            <Label>Tags</Label>

            <MultiSelect
              defaultValue={person?.tagIds ?? []}
              options={tagOptions}
              value={selectedTags}
              onValueChange={setSelectedTags}
              placeholder="Select tags"
              emptyIndicator="No tags found"
            />

            {selectedTags.map((tagId) => (
              <input key={tagId} type="hidden" name="tag_ids" value={tagId} />
            ))}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={pending || !selectedBusinessId}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PersonFormDialog;
