import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import { handleActionError, parseValidationError } from "./action-error";

describe("Action Error Handling - Critical Path Tests", () => {
  describe("parseValidationError", () => {
    it("extracts validation error messages", () => {
      const zodError = new ZodError([
        {
          code: "too_small",
          inclusive: true,
          minimum: 1,
          path: ["name"],
          message: "Name is required",
          origin: "string",
        },
      ]);

      const result = parseValidationError(zodError);

      expect(result.type).toBe("validation");
      expect(result.fields?.name).toContain("Name is required");
    });

    it("handles multiple field errors", () => {
      const zodError = new ZodError([
        {
          code: "too_small",
          inclusive: true,
          minimum: 1,
          path: ["name"],
          message: "Name required",
          origin: "string",
        },
        {
          code: "invalid_format",
          format: "email",
          path: ["email"],
          message: "Invalid email",
        },
      ]);

      const result = parseValidationError(zodError);

      expect(result.fields?.name).toBeDefined();
      expect(result.fields?.email).toBeDefined();
    });

    it("includes form-level errors", () => {
      const zodError = new ZodError([
        {
          code: "custom",
          path: [],
          message: "Form level error",
        },
      ]);

      const result = parseValidationError(zodError);

      expect(result.message).toContain("Form level error");
    });
  });

  describe("handleActionError - Zod Validation Errors", () => {
    it("detects and parses ZodError", () => {
      const zodError = new ZodError([
        {
          code: "too_small",
          inclusive: true,
          minimum: 1,
          origin: "string",
          path: ["title"],
          message: "Title required",
        },
      ]);

      const result = handleActionError(zodError);

      expect(result.type).toBe("validation");
      expect(result.fields?.title).toBeDefined();
    });
  });

  describe("handleActionError - Authorization Errors", () => {
    it("detects authorization errors", () => {
      const error = new Error("Not authorized to perform this action");

      const result = handleActionError(error);

      expect(result.type).toBe("unauthorized");
      expect(result.message).toContain("permission");
    });

    it("detects authentication required errors", () => {
      const error = new Error("Not authorized to perform this action");

      const result = handleActionError(error);

      expect(result.type).toBe("unauthorized");
    });

    it("detects unauthorized access errors", () => {
      const error = new Error("Unauthorized to access this resource");

      const result = handleActionError(error);

      expect(result.type).toBe("unauthorized");
    });
  });

  describe("handleActionError - Not Found Errors", () => {
    it("detects not found errors", () => {
      const error = new Error("Business not found");

      const result = handleActionError(error);

      expect(result.type).toBe("not_found");
      expect(result.message).toContain("not found");
    });

    it("detects resource not found", () => {
      const error = new Error("Task not found or was deleted");

      const result = handleActionError(error);

      expect(result.type).toBe("not_found");
    });
  });

  describe("handleActionError - Conflict Errors", () => {
    it("detects conflict errors", () => {
      const error = new Error("This resource conflicts with existing data");

      const result = handleActionError(error);

      expect(result.type).toBe("conflict");
    });

    it("detects already exists errors", () => {
      const error = new Error("Tag already exists");

      const result = handleActionError(error);

      expect(result.type).toBe("conflict");
    });

    it("detects duplicate key errors", () => {
      const error = new Error("already exists in the database");

      const result = handleActionError(error);

      expect(result.type).toBe("conflict");
    });
  });

  describe("handleActionError - Supabase Errors", () => {
    it("passes through Supabase error messages", () => {
      const error = new Error(
        "Failed to update task: violates foreign key constraint",
      );

      const result = handleActionError(error);

      expect(result.type).toBe("server_error");
      expect(result.message).toContain("error occurred");
    });

    it("preserves error codes in messages", () => {
      const error = new Error("Failed to insert: (23505) duplicate key error");

      const result = handleActionError(error);

      expect(result.type).toBe("server_error");
    });
  });

  describe("handleActionError - Generic Server Errors", () => {
    it("returns server error for unknown errors", () => {
      const error = new Error("Some random error");

      const result = handleActionError(error);

      expect(result.type).toBe("server_error");
    });

    it("returns generic message for non-standard errors", () => {
      const error = new Error("Unexpected database connection loss");

      const result = handleActionError(error);

      expect(result.type).toBe("server_error");
      expect(result.message).toContain("error occurred");
    });

    it("handles non-Error objects", () => {
      const result = handleActionError({ message: "Weird error" });

      expect(result.type).toBe("server_error");
      expect(result.message).toContain("error occurred");
    });

    it("handles null/undefined errors", () => {
      const result = handleActionError(null);

      expect(result.type).toBe("server_error");
      expect(result.message).toContain("error occurred");
    });

    it("handles string errors", () => {
      const result = handleActionError("String error");

      expect(result.type).toBe("server_error");
    });
  });

  describe("Error Logging", () => {
    beforeEach(() => {
      vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("logs errors to console", () => {
      const error = new Error("Test error");

      handleActionError(error);

      expect(console.error).toHaveBeenCalledWith(
        "[Action Error]",
        "Test error",
        expect.any(String),
      );
    });

    it("logs non-Error objects", () => {
      const obj = { code: "CUSTOM_ERROR" };

      handleActionError(obj);

      expect(console.error).toHaveBeenCalledWith("[Action Error]", obj);
    });
  });

  describe("Critical Path: Error Recovery", () => {
    it("validation error provides field-level feedback", () => {
      const zodError = new ZodError([
        {
          code: "too_small",
          inclusive: true,
          minimum: 1,
          origin: "string",
          path: ["name"],
          message: "Name required",
        },
      ]);

      const result = handleActionError(zodError);

      expect(result.type).toBe("validation");
      expect(result.fields?.name).toBeDefined();
    });

    it("unauthorized error prevents operation", () => {
      const error = new Error("Not authorized to delete this task");

      const result = handleActionError(error);

      expect(result.type).toBe("unauthorized");
      expect(result.message).toContain("permission");
    });

    it("not found error handles gracefully", () => {
      const error = new Error("Task not found");

      const result = handleActionError(error);

      expect(result.type).toBe("not_found");
    });

    it("conflict error prevents duplicate operations", () => {
      const error = new Error("This tag already exists");

      const result = handleActionError(error);

      expect(result.type).toBe("conflict");
    });

    it("server error provides retry suggestion", () => {
      const error = new Error("Database connection timeout");

      const result = handleActionError(error);

      expect(result.type).toBe("server_error");
      expect(result.message).toContain("try again");
    });
  });

  describe("Error Types Match Action Responses", () => {
    it("returns ActionError interface", () => {
      const error = new Error("Test error");
      const result = handleActionError(error);

      expect(result).toHaveProperty("type");
      expect(result).toHaveProperty("message");
      expect([
        "validation",
        "unauthorized",
        "not_found",
        "conflict",
        "server_error",
      ]).toContain(result.type);
    });

    it("only includes fields for validation errors", () => {
      const validationError = new ZodError([
        {
          code: "too_small",
          inclusive: true,
          minimum: 1,
          origin: "string",
          path: ["name"],
          message: "Name required",
        },
      ]);

      const result = handleActionError(validationError);

      expect(result.fields).toBeDefined();

      const authError = new Error("Not authorized");
      const authResult = handleActionError(authError);

      expect(authResult.fields).toBeUndefined();
    });
  });
});
