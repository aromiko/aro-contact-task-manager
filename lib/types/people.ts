export type Person = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
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
