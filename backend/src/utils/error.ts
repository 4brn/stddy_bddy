import type { Error } from "./types";

export const UNAUTHORIZED: Error = { error: "UNAUTHORIZED" };
export const INVALID_CREDENTIALS: Error = { error: "INVALID_CREDENTIALS" };
export const USER_FOUND: Error = { error: "USER_FOUND" };
export const INTERNAL_SERVER_ERROR: Error = { error: "INTERNAL_SERVER_ERROR" };
export const USER_NOT_FOUND: Error = { error: "USER_NOT_FOUND" };
export const SESSION_COOKIE_NOT_FOUND: Error = {
  error: "SESSION_COOKIE_NOT_FOUND",
};
export const SESSION_COOKIE_FOUND: Error = {
  error: "SESSION_COOKIE_FOUND",
};
