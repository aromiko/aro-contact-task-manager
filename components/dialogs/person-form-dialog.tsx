"use client";

import { FormDialog } from "@/components/dialogs/form-dialog";
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
import { useState } from "react";

type PersonFormDialogProps = {
  trigger: React.ReactNode;
  person?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    business_id: string;
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
  const [name, setName] = useState(person?.name ?? "");
  const [email, setEmail] = useState(person?.email ?? "");
  const [phone, setPhone] = useState(person?.phone ?? "");
  const [selectedBusinessId, setSelectedBusinessId] = useState(
    person?.business_id ?? "",
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    person?.tagIds ?? [],
  );

  const handleSubmit = async (
    closeDialog: () => void,
    setError: (error: string | null) => void,
  ) => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!selectedBusinessId) {
      setError("Business is required");
      return;
    }

    try {
      if (person?.id) {
        await updatePerson(person.id, {
          name,
          email: email || null,
          phone: phone || null,
          business_id: selectedBusinessId,
        });

        await updatePersonTags(person.id, selectedTags);
      } else {
        const personId = await createPerson({
          name,
          email: email || null,
          phone: phone || null,
          business_id: selectedBusinessId,
        });

        await updatePersonTags(personId, selectedTags);
      }

      closeDialog();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to save person",
      );
      throw error;
    }
  };

  const tagOptions = tags.map((tag) => ({
    label: tag.name,
    value: tag.id,
  }));

  return (
    <FormDialog
      trigger={trigger}
      title={person ? "Edit person" : "Add person"}
      onSubmit={handleSubmit}
    >
      {({ isPending, setError }) => (
        <div className="space-y-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            required
          />

          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
          />

          <Input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isPending}
          />

          <Select
            value={selectedBusinessId}
            onValueChange={setSelectedBusinessId}
            disabled={isPending}
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

export default PersonFormDialog;
