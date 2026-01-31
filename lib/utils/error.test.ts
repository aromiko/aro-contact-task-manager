import { describe, expect, it } from "vitest";

import { AppError, getErrorMessage, withErrorHandling } from "./error";

describe("Error utilities", () => {
  describe("AppError", () => {
    it("creates error with message and code", () => {
      const error = new AppError("Test error", "TEST_CODE", 400);

      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_CODE");
      expect(error.statusCode).toBe(400);
    });

    it("has default status code of 500", () => {
      const error = new AppError("Test error");
      expect(error.statusCode).toBe(500);
    });
  });

  describe("getErrorMessage", () => {
    it("extracts message from AppError", () => {
      const error = new AppError("App error message");
      expect(getErrorMessage(error)).toBe("App error message");
    });

    it("extracts message from Error", () => {
      const error = new Error("Standard error");
      expect(getErrorMessage(error)).toBe("Standard error");
    });

    it("returns string as-is", () => {
      expect(getErrorMessage("Simple string")).toBe("Simple string");
    });

    it("returns default message for unknown error", () => {
      expect(getErrorMessage({})).toBe(
        "An unexpected error occurred. Please try again.",
      );
    });

    it("handles null or undefined", () => {
      expect(getErrorMessage(null)).toBe(
        "An unexpected error occurred. Please try again.",
      );
      expect(getErrorMessage(undefined)).toBe(
        "An unexpected error occurred. Please try again.",
      );
    });
  });

  describe("withErrorHandling", () => {
    it("returns resolved value on success", async () => {
      const result = await withErrorHandling(async () => "success");
      expect(result).toBe("success");
    });

    it("throws AppError on failure", async () => {
      const testError = new Error("Test failure");

      try {
        await withErrorHandling(async () => {
          throw testError;
        }, "Custom error message");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).message).toBe("Custom error message");
      }
    });

    it("uses custom error message", async () => {
      try {
        await withErrorHandling(async () => {
          throw new Error("Original");
        }, "Wrapped error");
        expect.fail("Should have thrown");
      } catch (error) {
        expect((error as AppError).message).toBe("Wrapped error");
      }
    });
  });
});
