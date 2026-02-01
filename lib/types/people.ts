import type { NamedRef } from "./base";

export type PersonTableItem = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string | null;
  business: NamedRef | null;
  tags: NamedRef[];
};

export type PersonLookupItem = {
  id: string;
  name: string;
  business_id: string | null;
};
