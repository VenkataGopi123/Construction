export const mockDashboardStats = {
  totalProjects: 24,
  activeProjects: 12,
  totalRevenue: 4850000,
  pendingPayments: 320000,
  totalWorkers: 156,
  materialAlerts: 5,
};

export const mockRevenueData = [
  { month: "Jan", revenue: 320000, expenses: 210000 },
  { month: "Feb", revenue: 380000, expenses: 245000 },
  { month: "Mar", revenue: 420000, expenses: 280000 },
  { month: "Apr", revenue: 390000, expenses: 260000 },
  { month: "May", revenue: 450000, expenses: 295000 },
  { month: "Jun", revenue: 510000, expenses: 320000 },
];

export const mockProjectProgress = [
  { name: "Skyline Tower", progress: 78 },
  { name: "Harbor Bridge", progress: 45 },
  { name: "Metro Station", progress: 92 },
  { name: "Green Valley", progress: 34 },
  { name: "Tech Campus", progress: 61 },
];

export const mockMaterialUsage = [
  { name: "Cement", used: 450, total: 500 },
  { name: "Steel", used: 280, total: 350 },
  { name: "Lumber", used: 120, total: 200 },
  { name: "Electrical", used: 85, total: 100 },
  { name: "Plumbing", used: 65, total: 80 },
];

export const mockRecentActivity = [
  { id: "1", action: "Project milestone completed", project: "Skyline Tower", time: "2 hours ago", type: "success" },
  { id: "2", action: "Material stock alert", project: "Harbor Bridge", time: "4 hours ago", type: "warning" },
  { id: "3", action: "Payment received", project: "Metro Station", time: "6 hours ago", type: "success" },
  { id: "4", action: "New quotation submitted", project: "Green Valley", time: "1 day ago", type: "info" },
  { id: "5", action: "Worker assigned", project: "Tech Campus", time: "1 day ago", type: "info" },
];

export interface ProjectSummary {
  id: string;
  name: string;
  type?: string;
  project_type?: string;
  status: string;
  progress?: number;
  progress_percent?: number;
  budget: number;
  client?: string;
  client_name?: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
}

export const mockProjects: ProjectSummary[] = [];

export const mockCustomers = [
  { id: "1", name: "Apex Corporation", email: "contact@apexcorp.com", phone: "+1 555-0101", projects: 3, totalValue: 5200000 },
  { id: "2", name: "City Council", email: "infra@citycouncil.gov", phone: "+1 555-0102", projects: 2, totalValue: 3800000 },
  { id: "3", name: "Green Homes Ltd", email: "info@greenhomes.com", phone: "+1 555-0103", projects: 1, totalValue: 950000 },
  { id: "4", name: "InnovateTech", email: "facilities@innovatetech.io", phone: "+1 555-0104", projects: 2, totalValue: 6100000 },
];

export interface MaterialSummary {
  id: string;
  name: string;
  category?: string;
  category_name?: string;
  quantity: number;
  unit: string;
  minStock?: number;
  min_stock_level?: number;
  price?: number;
  selling_price?: number;
  supplier?: string;
  supplier_name?: string;
}

export const mockMaterials: MaterialSummary[] = [];

export const mockSuppliers = [
  { id: "1", name: "BuildMart Supplies", contact: "John Smith", email: "john@buildmart.com", phone: "+1 555-0201", materials: 45, rating: 4.8 },
  { id: "2", name: "SteelCo Industries", contact: "Maria Garcia", email: "maria@steelco.com", phone: "+1 555-0202", materials: 28, rating: 4.6 },
  { id: "3", name: "TimberPro", contact: "David Lee", email: "david@timberpro.com", phone: "+1 555-0203", materials: 32, rating: 4.5 },
];

export const mockWorkers = [
  { id: "1", name: "James Wilson", role: "Site Supervisor", project: "Skyline Tower", status: "active", phone: "+1 555-0301" },
  { id: "2", name: "Sarah Chen", role: "Electrician", project: "Harbor Bridge", status: "active", phone: "+1 555-0302" },
  { id: "3", name: "Mike Johnson", role: "Plumber", project: "Tech Campus", status: "on_leave", phone: "+1 555-0303" },
  { id: "4", name: "Emily Davis", role: "Carpenter", project: "Green Valley", status: "active", phone: "+1 555-0304" },
];

export const mockPayments = [
  { id: "1", project: "Skyline Tower", client: "Apex Corp", amount: 250000, status: "paid", dueDate: "2024-05-15", paidDate: "2024-05-14" },
  { id: "2", project: "Harbor Bridge", client: "City Council", amount: 180000, status: "pending", dueDate: "2024-06-01" },
  { id: "3", project: "Tech Campus", client: "InnovateTech", amount: 420000, status: "partial", dueDate: "2024-05-30", paidDate: "2024-05-20" },
];

export const mockQuotations = [
  { id: "1", project: "Green Valley Residences", client: "Green Homes Ltd", amount: 950000, status: "pending", date: "2024-05-20" },
  { id: "2", project: "Office Complex", client: "Metro Developers", amount: 1200000, status: "approved", date: "2024-05-10" },
  { id: "3", project: "Warehouse Expansion", client: "LogiCorp", amount: 680000, status: "rejected", date: "2024-04-28" },
];

export const mockUsers = [
  { id: "1", name: "Admin User", email: "admin@harshithramconstruction.com", role: "admin", status: "active" },
  { id: "2", name: "John Manager", email: "manager@harshithramconstruction.com", role: "manager", status: "active" },
  { id: "3", name: "Jane Engineer", email: "engineer@harshithramconstruction.com", role: "engineer", status: "active" },
];
