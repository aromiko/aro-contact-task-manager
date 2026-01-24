import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeRef<T>(ref: T | T[] | null): T | null {
  if (!ref) return null;
  return Array.isArray(ref) ? (ref[0] ?? null) : ref;
}
