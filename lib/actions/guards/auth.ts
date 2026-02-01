import { AuthClient } from "@/lib/types/auth";

export const requireUser = async (client: AuthClient) => {
  const { data, error } = await client.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data?.user) {
    throw new Error("Authentication required");
  }

  return data.user;
};
