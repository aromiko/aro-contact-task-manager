import { z } from "zod";

export const createBusinessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Business name is required")
    .max(150, "Business name must be 150 characters or less"),
  categoryIds: z.array(z.string().uuid()).optional().default([]),
  tagIds: z.array(z.string().uuid()).optional().default([]),
});

export const updateBusinessSchema = z.object({
  id: z.string().uuid("Invalid business ID"),
  name: z
    .string()
    .trim()
    .min(1, "Business name is required")
    .max(150, "Business name must be 150 characters or less"),
});

export const businessTagsSchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
  tagIds: z.array(z.string().uuid()).min(0),
});

export const businessCategoriesSchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
  categoryIds: z.array(z.string().uuid()).min(0),
});

export const deleteBusinessSchema = z.object({
  id: z.string().uuid("Invalid business ID"),
});

export const createPersonSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  phone: z
    .string()
    .trim()
    .max(20, "Phone is too long")
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  business_id: z.string().uuid("Invalid business ID"),
  tagIds: z.array(z.string().uuid()).optional().default([]),
});

export const updatePersonSchema = z.object({
  personId: z.string().uuid("Invalid person ID"),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  phone: z
    .string()
    .trim()
    .max(20, "Phone is too long")
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  business_id: z.string().uuid("Invalid business ID").nullable().optional(),
});

export const deletePersonSchema = z.object({
  id: z.string().uuid("Invalid person ID"),
});

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required")
    .max(200, "Task title is too long"),
  businessId: z.string().uuid("Invalid business ID").optional(),
  personId: z.string().uuid("Invalid person ID").optional(),
});

export const completeTaskSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
});

export const reopenTaskSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
});

export const deleteTaskSchema = z.object({
  id: z.string().uuid("Invalid task ID"),
});

export const assignTaskSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
  personId: z.string().uuid().optional(),
  businessId: z.string().uuid().optional(),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
export type CreatePersonInput = z.infer<typeof createPersonSchema>;
export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;
