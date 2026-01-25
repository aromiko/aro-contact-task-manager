export type Person = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  business: {
    id: string;
    name: string;
  } | null;
  tags: {
    id: string;
    name: string;
  }[];
};
