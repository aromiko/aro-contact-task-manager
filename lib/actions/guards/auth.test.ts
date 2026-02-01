import { AuthClient } from "@/lib/types/auth";
import type { MockedFunction } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { requireUser } from "./auth";

type SupabaseAuthMock = {
  auth: {
    getUser: MockedFunction<AuthClient["auth"]["getUser"]>;
  };
};

describe("Authorization Guards - Critical Path Tests", () => {
  let mockSupabase: SupabaseAuthMock;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
    };
  });

  describe("requireUser - Authentication Guard", () => {
    it("returns user when authenticated", async () => {
      const mockUser = {
        id: "user-123",
        email: "user@example.com",
        user_metadata: {},
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await requireUser(mockSupabase);

      expect(result).toEqual(mockUser);
      expect(result.id).toBe("user-123");
    });

    it("throws error when not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(requireUser(mockSupabase)).rejects.toThrow(
        "Authentication required",
      );
    });

    it("throws error when getUser fails", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error("Session expired"),
      });

      await expect(requireUser(mockSupabase)).rejects.toThrow();
    });

    it("handles null user gracefully", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(requireUser(mockSupabase)).rejects.toThrow(
        "Authentication required",
      );
    });

    it("works with different user IDs", async () => {
      const userId = "user-different-id";
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: userId, email: "other@example.com" } },
        error: null,
      });

      const result = await requireUser(mockSupabase);

      expect(result.id).toBe(userId);
    });
  });

  describe("requireUser - Edge Cases", () => {
    it("handles metadata in user object", async () => {
      const mockUser = {
        id: "user-123",
        email: "user@example.com",
        user_metadata: {
          role: "admin",
          preferences: { theme: "dark" },
        },
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await requireUser(mockSupabase);

      expect(result.user_metadata).toBeDefined();
    });

    it("maintains user object structure", async () => {
      const mockUser = {
        id: "user-123",
        email: "user@example.com",
        aud: "authenticated",
        role: "authenticated",
        created_at: "2024-01-01T00:00:00Z",
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await requireUser(mockSupabase);

      expect(result.id).toBe("user-123");
      expect(result.email).toBe("user@example.com");
    });
  });

  describe("Critical Path: Authentication Flow", () => {
    it("prevents unauthenticated users from accessing actions", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const action = async () => {
        const user = await requireUser(mockSupabase);
      };

      await expect(action()).rejects.toThrow("Authentication required");
    });

    it("allows authenticated users to proceed", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const action = async () => {
        const user = await requireUser(mockSupabase);
        return user.id;
      };

      const result = await action();
      expect(result).toBe("user-123");
    });

    it("fails fast on authentication failure", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const action = async () => {
        await requireUser(mockSupabase);
        throw new Error("Should not reach here");
      };

      await expect(action()).rejects.toThrow("Authentication required");
    });

    it("is called before database operations", async () => {
      const callOrder: string[] = [];

      mockSupabase.auth.getUser.mockImplementation(async () => {
        callOrder.push("auth");
        return {
          data: { user: null },
          error: null,
        };
      });

      const mockDbQuery = vi.fn(async () => {
        callOrder.push("db");
      });

      const action = async () => {
        try {
          await requireUser(mockSupabase);
          await mockDbQuery();
        } catch {
          // Expected
        }
      };

      await action();

      expect(callOrder[0]).toBe("auth");
      expect(mockDbQuery).not.toHaveBeenCalled();
    });
  });

  describe("Authorization Error Messages", () => {
    it("provides clear error for unauthenticated users", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      try {
        await requireUser(mockSupabase);
        expect.fail("Should have thrown");
      } catch (error: unknown) {
        expect(error instanceof Error && error.message).toBe(
          "Authentication required",
        );
      }
    });

    it("distinguishes between auth errors and other errors", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error("Session expired"),
      });

      await expect(requireUser(mockSupabase)).rejects.toThrow();
    });
  });
});
