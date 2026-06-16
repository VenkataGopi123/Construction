import type { Role } from "./constants";

export function isAdminRole(role?: Role | string | null): boolean {
  return role === "admin";
}

export function getDashboardRole(role?: Role | string | null): Role {
  if (role === "admin") return "admin";
  return "user";
}
