import { PersonTableItem } from "@/lib/types/people";

type PersonWithJoins = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string | null;
  business?: {
    id: string;
    name: string;
  } | null;
  person_tags?: {
    tag: {
      id: string;
      name: string;
    };
  }[];
};

export const mapPersonToTableItem = (
  person: PersonWithJoins,
): PersonTableItem => ({
  id: person.id,
  name: person.name,
  email: person.email,
  phone: person.phone,
  created_at: person.created_at,
  business: person.business
    ? { id: person.business.id, name: person.business.name }
    : null,
  tags: person.person_tags?.map((pt) => pt.tag) ?? [],
});
