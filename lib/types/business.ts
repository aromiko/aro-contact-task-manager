export type Business = {
  id: string;
  name: string;
  created_at: string | null;
  tags: { id: string; name: string }[];
  categories: { id: string; name: string }[];
};
