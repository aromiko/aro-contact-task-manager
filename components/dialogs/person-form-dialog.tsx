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
import { createPerson, updatePerson } from "@/lib/actions/people";
import { useTransition } from "react";

type PersonFormData = {
  id?: string;
  name: string;
  email: string | null;
  phone: string | null;
  business_id: string | null;
};

type Props = {
  trigger: React.ReactNode;
  person?: PersonFormData;
};

const PersonFormDialog = ({ trigger, person }: Props) => {
  const [pending, startTransition] = useTransition();

  const action = (formData: FormData) => {
    startTransition(async () => {
      const payload = {
        name: String(formData.get("name")),
        email: formData.get("email")?.toString() || null,
        phone: formData.get("phone")?.toString() || null,
        business_id: null, // wired later
      };

      if (person?.id) {
        await updatePerson(person.id, payload);
      } else {
        await createPerson(payload);
      }
    });
  };

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

export default PersonFormDialog;
