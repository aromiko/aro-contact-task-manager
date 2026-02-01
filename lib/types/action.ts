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

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: ActionError };
