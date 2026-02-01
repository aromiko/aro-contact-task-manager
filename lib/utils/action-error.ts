import { ZodError } from "zod";

export type ActionError = {
  type:
    | "validation"
    | "unauthorized"
    | "not_found"
    | "conflict"
    | "server_error";
  message: string;
  fields?: Record<string, string[]>;
};

export function parseValidationError(error: ZodError): ActionError {
  const fields: Record<string, string[]> = {};

  const flattened = error.flatten();

  const fieldErrors = flattened.fieldErrors as Record<
    string,
    string[] | undefined
  >;
  Object.entries(fieldErrors).forEach(([field, messages]) => {
    if (Array.isArray(messages) && messages.length > 0) {
      fields[field] = messages;
    }
  });

  return {
    type: "validation",
    message: flattened.formErrors?.join("; ") || "Validation failed",
    fields: Object.keys(fields).length > 0 ? fields : undefined,
  };
}

export function handleActionError(error: unknown): ActionError {
  if (error instanceof Error) {
    console.error("[Action Error]", error.message, error.stack);
  } else {
    console.error("[Action Error]", error);
  }

  if (error instanceof ZodError) {
    return parseValidationError(error);
  }

  if (error instanceof Error) {
    if (
      error.message.includes("Not authorized") ||
      error.message.includes("Unauthorized")
    ) {
      return {
        type: "unauthorized",
        message: "You do not have permission to perform this action",
      };
    }

    if (error.message.includes("not found")) {
      return {
        type: "not_found",
        message: "The requested resource was not found",
      };
    }

    if (
      error.message.includes("conflict") ||
      error.message.includes("already")
    ) {
      return {
        type: "conflict",
        message: "This resource already exists or conflicts with existing data",
      };
    }
  }

  return {
    type: "server_error",
    message:
      "An error occurred while processing your request. Please try again.",
  };
}

export class SafeActionError extends Error {
  constructor(
    public actionError: ActionError,
    message: string = actionError.message,
  ) {
    super(message);
    this.name = "SafeActionError";
  }
}

export const createActionError = {
  validation: (
    message: string,
    fields?: Record<string, string[]>,
  ): ActionError => ({
    type: "validation",
    message,
    fields,
  }),

  unauthorized: (
    message = "You do not have permission to perform this action",
  ): ActionError => ({
    type: "unauthorized",
    message,
  }),

  notFound: (resource = "The requested resource"): ActionError => ({
    type: "not_found",
    message: `${resource} was not found`,
  }),

  conflict: (
    message = "This resource already exists or conflicts with existing data",
  ): ActionError => ({
    type: "conflict",
    message,
  }),

  server: (
    message = "An error occurred while processing your request. Please try again.",
  ): ActionError => ({
    type: "server_error",
    message,
  }),
};
