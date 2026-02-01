export type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export type AuthClient = {
  auth: {
    getUser: () => Promise<{
      data: { user: AuthUser | null };
      error: Error | null;
    }>;
  };
};
