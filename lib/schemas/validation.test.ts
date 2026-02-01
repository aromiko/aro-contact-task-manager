import { describe, expect, it } from "vitest";

import {
  assignTaskSchema,
  businessCategoriesSchema,
  businessTagsSchema,
  completeTaskSchema,
  createBusinessSchema,
  createPersonSchema,
  createTaskSchema,
  deleteTaskSchema,
  reopenTaskSchema,
  updateBusinessSchema,
} from "./validation";

describe("Validation Schemas - Critical Path Tests", () => {
  describe("Business Schema - CREATE", () => {
    it("accepts valid business input", () => {
      const input = {
        name: "Tech Company",
        categoryIds: [],
        tagIds: [],
      };

      expect(() => createBusinessSchema.parse(input)).not.toThrow();
    });

    it("rejects empty business name", () => {
      const input = { name: "", categoryIds: [], tagIds: [] };

      expect(() => createBusinessSchema.parse(input)).toThrow(
        "Business name is required",
      );
    });

    it("rejects whitespace-only business name", () => {
      const input = { name: "   ", categoryIds: [], tagIds: [] };

      expect(() => createBusinessSchema.parse(input)).toThrow();
    });

    it("trims whitespace from business name", () => {
      const input = { name: "  Tech Company  ", categoryIds: [], tagIds: [] };
      const result = createBusinessSchema.parse(input);

      expect(result.name).toBe("Tech Company");
    });

    it("rejects business name over 150 characters", () => {
      const longName = "a".repeat(151);
      const input = { name: longName, categoryIds: [], tagIds: [] };

      expect(() => createBusinessSchema.parse(input)).toThrow(
        "Business name must be 150 characters or less",
      );
    });

    it("accepts 150 character business name", () => {
      const name = "a".repeat(150);
      const input = { name, categoryIds: [], tagIds: [] };

      expect(() => createBusinessSchema.parse(input)).not.toThrow();
    });

    it("accepts valid UUID category IDs", () => {
      const input = {
        name: "Company",
        categoryIds: ["550e8400-e29b-41d4-a716-446655440000"],
        tagIds: [],
      };

      expect(() => createBusinessSchema.parse(input)).not.toThrow();
    });

    it("rejects invalid UUID category IDs", () => {
      const input = {
        name: "Company",
        categoryIds: ["not-a-uuid"],
        tagIds: [],
      };

      expect(() => createBusinessSchema.parse(input)).toThrow();
    });

    it("defaults empty categoryIds and tagIds", () => {
      const input = { name: "Company" };
      const result = createBusinessSchema.parse(input);

      expect(result.categoryIds).toEqual([]);
      expect(result.tagIds).toEqual([]);
    });
  });

  describe("Business Schema - UPDATE", () => {
    it("accepts valid business update", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Updated Company",
      };

      expect(() => updateBusinessSchema.parse(input)).not.toThrow();
    });

    it("rejects invalid business ID", () => {
      const input = { id: "not-a-uuid", name: "Updated" };

      expect(() => updateBusinessSchema.parse(input)).toThrow(
        "Invalid business ID",
      );
    });

    it("rejects empty update name", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "",
      };

      expect(() => updateBusinessSchema.parse(input)).toThrow();
    });
  });

  describe("Person Schema - CREATE", () => {
    it("accepts valid person input", () => {
      const input = {
        name: "John Doe",
        email: "john@example.com",
        phone: "555-1234",
        business_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      expect(() => createPersonSchema.parse(input)).not.toThrow();
    });

    it("rejects invalid email", () => {
      const input = {
        name: "John Doe",
        email: "not-an-email",
        phone: "555-1234",
        business_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      expect(() => createPersonSchema.parse(input)).toThrow(
        "Invalid email address",
      );
    });

    it("accepts person without email", () => {
      const input = {
        name: "John Doe",
        phone: "555-1234",
        business_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      expect(() => createPersonSchema.parse(input)).not.toThrow();
    });

    it("rejects empty string email", () => {
      const input = {
        name: "John Doe",
        email: "",
        phone: "555-1234",
        business_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      expect(() => createPersonSchema.parse(input)).toThrow(
        "Invalid email address",
      );
    });

    it("rejects name over 100 characters", () => {
      const longName = "a".repeat(101);
      const input = {
        name: longName,
        business_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      expect(() => createPersonSchema.parse(input)).toThrow("Name is too long");
    });
  });

  describe("Task Schema - CREATE", () => {
    it("accepts valid task input", () => {
      const input = {
        title: "Complete project",
        businessId: "550e8400-e29b-41d4-a716-446655440000",
        personId: undefined,
      };

      expect(() => createTaskSchema.parse(input)).not.toThrow();
    });

    it("rejects empty task title", () => {
      const input = {
        title: "",
        businessId: "550e8400-e29b-41d4-a716-446655440000",
      };

      expect(() => createTaskSchema.parse(input)).toThrow(
        "Task title is required",
      );
    });

    it("allows businessId as optional", () => {
      const input = {
        title: "My task",
      };

      expect(() => createTaskSchema.parse(input)).not.toThrow();
    });

    it("rejects title over 200 characters", () => {
      const longTitle = "a".repeat(201);
      const input = {
        title: longTitle,
        businessId: "550e8400-e29b-41d4-a716-446655440000",
      };

      expect(() => createTaskSchema.parse(input)).toThrow();
    });

    it("accepts both businessId and personId as undefined", () => {
      const input = {
        title: "My task",
        businessId: "550e8400-e29b-41d4-a716-446655440000",
      };

      expect(() => createTaskSchema.parse(input)).not.toThrow();
    });
  });

  describe("Task Schema - COMPLETE", () => {
    it("accepts valid task ID", () => {
      const input = {
        taskId: "550e8400-e29b-41d4-a716-446655440000",
      };

      expect(() => completeTaskSchema.parse(input)).not.toThrow();
    });

    it("rejects invalid task ID", () => {
      const input = { taskId: "not-a-uuid" };

      expect(() => completeTaskSchema.parse(input)).toThrow();
    });
  });

  describe("Task Schema - REOPEN", () => {
    it("accepts valid task ID", () => {
      const input = {
        taskId: "550e8400-e29b-41d4-a716-446655440000",
      };

      expect(() => reopenTaskSchema.parse(input)).not.toThrow();
    });

    it("rejects invalid task ID", () => {
      const input = { taskId: "invalid" };

      expect(() => reopenTaskSchema.parse(input)).toThrow();
    });
  });

  describe("Task Schema - ASSIGN", () => {
    it("accepts assignment to person", () => {
      const input = {
        taskId: "550e8400-e29b-41d4-a716-446655440000",
        personId: "550e8400-e29b-41d4-a716-446655440001",
        businessId: undefined,
      };

      expect(() => assignTaskSchema.parse(input)).not.toThrow();
    });

    it("accepts assignment to business", () => {
      const input = {
        taskId: "550e8400-e29b-41d4-a716-446655440000",
        personId: undefined,
        businessId: "550e8400-e29b-41d4-a716-446655440002",
      };

      expect(() => assignTaskSchema.parse(input)).not.toThrow();
    });

    it("rejects invalid task ID", () => {
      const input = {
        taskId: "invalid",
        personId: "550e8400-e29b-41d4-a716-446655440001",
      };

      expect(() => assignTaskSchema.parse(input)).toThrow();
    });
  });

  describe("Task Schema - DELETE", () => {
    it("accepts valid task ID", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
      };

      expect(() => deleteTaskSchema.parse(input)).not.toThrow();
    });

    it("rejects invalid task ID", () => {
      const input = { id: "not-a-uuid" };

      expect(() => deleteTaskSchema.parse(input)).toThrow();
    });
  });

  describe("Tag & Category Schemas", () => {
    it("requires businessId and tagIds", () => {
      const input = { name: "Important" };

      expect(() => businessTagsSchema.parse(input)).toThrow();
    });

    it("accepts valid business tags", () => {
      const input = {
        businessId: "550e8400-e29b-41d4-a716-446655440000",
        tagIds: [],
      };

      expect(() => businessTagsSchema.parse(input)).not.toThrow();
    });

    it("requires businessId and categoryIds", () => {
      const input = { name: "Leads" };

      expect(() => businessCategoriesSchema.parse(input)).toThrow();
    });

    it("accepts valid business categories", () => {
      const input = {
        businessId: "550e8400-e29b-41d4-a716-446655440000",
        categoryIds: [],
      };

      expect(() => businessCategoriesSchema.parse(input)).not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("handles null input", () => {
      expect(() => createBusinessSchema.parse(null)).toThrow();
    });

    it("handles undefined input", () => {
      expect(() => createBusinessSchema.parse(undefined)).toThrow();
    });

    it("handles extra fields (should strip them)", () => {
      const input = {
        name: "Company",
        categoryIds: [],
        tagIds: [],
        extraField: "should be ignored",
      };

      const result = createBusinessSchema.parse(input);
      expect(result).not.toHaveProperty("extraField");
    });

    it("handles case-sensitive validation", () => {
      const input = {
        NAME: "Company",
        categoryIds: [],
        tagIds: [],
      };

      expect(() => createBusinessSchema.parse(input)).toThrow();
    });
  });
});
