export type ISODateString = string;

export type BaseEntity = {
  id: string;
  created_at: string | null;
};

export type UserOwnedEntity = {
  user_id: string;
};

export type NamedRef = {
  id: string;
  name: string;
};
