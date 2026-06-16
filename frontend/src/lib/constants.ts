export const ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  user: "User",
};

export const PROJECT_TYPES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "renovation", label: "Renovation" },
] as const;

export const PROJECT_STATUSES = [
  { value: "planning", label: "Planning", color: "bg-blue-500" },
  { value: "in_progress", label: "In Progress", color: "bg-amber-500" },
  { value: "on_hold", label: "On Hold", color: "bg-yellow-500" },
  { value: "completed", label: "Completed", color: "bg-green-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
] as const;

export const MATERIAL_CATEGORIES = [
  "Cement & Concrete",
  "Steel & Rebar",
  "Lumber & Wood",
  "Electrical",
  "Plumbing",
  "Finishing",
  "Safety Equipment",
  "Tools & Machinery",
] as const;

export const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
] as const;

export const NAV_ITEMS = {
  admin: [
    { href: "/", label: "Home", icon: "Home" },
    { href: "/dashboard", label: "Overview", icon: "LayoutDashboard" },
    { href: "/dashboard/projects", label: "Projects", icon: "Building2" },
    { href: "/dashboard/materials", label: "Materials", icon: "Package" },
    { href: "/dashboard/settings", label: "Settings", icon: "Settings" },
  ],
  user: [
    { href: "/", label: "Home", icon: "Home" },
    { href: "/portal", label: "Portal", icon: "LayoutDashboard" },
    { href: "/portal/projects", label: "My Projects", icon: "Building2" },
  ],
};
