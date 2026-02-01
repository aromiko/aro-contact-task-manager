import type { BaseEntity, NamedRef } from "./base";

export interface Person extends BaseEntity {
  name: string;
  email: string | null;
  phone: string | null;
  business: NamedRef;
  tags: NamedRef[];
}
