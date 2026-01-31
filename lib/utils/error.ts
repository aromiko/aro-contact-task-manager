export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = "UNKNOWN_ERROR",
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred. Please try again.";
}

export function handleServerActionError(error: unknown): never {
  const message = getErrorMessage(error);
  console.error("Server action error:", error);

  throw new AppError(
    message || "Operation failed. Please try again.",
    "SERVER_ACTION_ERROR",
  );
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage: string = "Operation failed",
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(errorMessage, error);
    throw new AppError(errorMessage, "OPERATION_FAILED");
  }
}
