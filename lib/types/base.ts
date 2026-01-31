export type ISODateString = string;

export interface BaseEntity {
  id: string;
  created_at: ISODateString;
}

export interface UserOwnedEntity {
  user_id: string;
}

export interface NamedRef {
  id: string;
  name: string;
}