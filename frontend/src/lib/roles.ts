import type { Role } from "./constants";

export function isAdminRole(role?: Role | string | null): boolean {
  return role === "admin" || role === "super_admin";
}

export function getDashboardRole(role?: Role | string | null): Role {
  if (role === "super_admin") return "admin";
  if (role === "project_manager") return "manager";
  if (role === "material_manager") return "manager";
  if (role === "supplier") return "customer";
  return (role || "customer") as Role;
}
