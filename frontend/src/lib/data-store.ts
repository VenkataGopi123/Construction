import { create } from "zustand";
import api from "./api";

export interface Service {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  details?: string;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  progress: number;
  budget: string;
  description?: string;
  imageUrl?: string;
}

export interface Material {
  id: string;
  name: string;
  stock: number;
  unit: string;
  status: "healthy" | "low";
  description?: string;
}

interface DataState {
  services: Service[];
  projects: Project[];
  materials: Material[];

  isLoading: boolean;
  error: string | null;

  fetchAll: () => Promise<void>;

  addService: (service: Omit<Service, "id">) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  addProject: (project: Omit<Project, "id">) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  addMaterial: (material: Omit<Material, "id">) => Promise<void>;
  updateMaterial: (id: string, material: Partial<Material>) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
}

export const useDataStore = create<DataState>()((set, get) => ({
  services: [],
  projects: [],
  materials: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });

    try {
      const [servicesRes, projectsRes, materialsRes] = await Promise.allSettled([
        api.get("/services"),
        api.get("/projects"),
        api.get("/materials"),
      ]);

      const updates: Partial<DataState> = {};

      if (servicesRes.status === "fulfilled" && servicesRes.value.data.success) {
        updates.services = servicesRes.value.data.data.map((s: any) => ({
          id: s.id,
          title: s.name,
          description: s.description,
          imageUrl: s.image_url,
          details: s.category || "",
        }));
      }

      if (projectsRes.status === "fulfilled" && projectsRes.value.data.success) {
        const rawProjects = Array.isArray(projectsRes.value.data.data) ? projectsRes.value.data.data : projectsRes.value.data.data.items;
        if (rawProjects) {
          updates.projects = rawProjects.map((p: any) => ({
            id: p.id,
            name: p.name,
            type: p.project_type,
            progress: p.progress_percent,
            budget: p.budget?.toString() || "0",
            description: p.description || "",
          }));
        }
      }

      if (materialsRes.status === "fulfilled" && materialsRes.value.data.success) {
        const rawMaterials = Array.isArray(materialsRes.value.data.data) ? materialsRes.value.data.data : materialsRes.value.data.data.items;
        if (rawMaterials) {
          updates.materials = rawMaterials.map((m: any) => ({
            id: m.id,
            name: m.name,
            stock: parseFloat(m.quantity || "0"),
            unit: m.unit || "unit",
            status: parseFloat(m.quantity) <= parseFloat(m.min_stock_level || "10") ? "low" : "healthy",
            description: m.description,
          }));
        }
      }

      set({ ...updates, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addService: async (service) => {
    const payload = {
      name: service.title,
      description: service.description,
      image_url: service.imageUrl,
      category: service.details,
    };
    await api.post("/services", payload);
    await get().fetchAll();
  },
  updateService: async (id, service) => {
    const payload = {
      name: service.title,
      description: service.description,
      image_url: service.imageUrl,
      category: service.details,
    };
    await api.put(`/services/${id}`, payload);
    await get().fetchAll();
  },
  deleteService: async (id) => {
    await api.delete(`/services/${id}`);
    await get().fetchAll();
  },

  addProject: async (project) => {
    const payload = {
      name: project.name,
      project_type: project.type || 'residential',
      client_name: 'Walk-in Client', // dummy default
      budget: parseFloat(project.budget) || 0,
      description: project.description,
      progress_percent: project.progress || 0,
      project_code: `PRJ-${Math.floor(Math.random() * 10000)}`,
    };
    await api.post("/projects", payload);
    await get().fetchAll();
  },
  updateProject: async (id, project) => {
    const payload: any = {};
    if (project.name) payload.name = project.name;
    if (project.type) payload.project_type = project.type;
    if (project.budget) payload.budget = parseFloat(project.budget);
    if (project.description) payload.description = project.description;
    if (project.progress !== undefined) payload.progress_percent = project.progress;
    await api.put(`/projects/${id}`, payload);
    await get().fetchAll();
  },
  deleteProject: async (id) => {
    await api.delete(`/projects/${id}`);
    await get().fetchAll();
  },

  addMaterial: async (material) => {
    const payload = {
      name: material.name,
      quantity: material.stock,
      unit: material.unit,
      description: material.description,
      cost_price: 0,
      selling_price: 0,
      min_stock_level: 10,
      sku: `MAT-${Math.floor(Math.random() * 10000)}`,
    };
    await api.post("/materials", payload);
    await get().fetchAll();
  },
  updateMaterial: async (id, material) => {
    const payload: any = {};
    if (material.name) payload.name = material.name;
    if (material.stock !== undefined) payload.quantity = material.stock;
    if (material.unit) payload.unit = material.unit;
    if (material.description) payload.description = material.description;
    await api.put(`/materials/${id}`, payload);
    await get().fetchAll();
  },
  deleteMaterial: async (id) => {
    await api.delete(`/materials/${id}`);
    await get().fetchAll();
  },
}));
