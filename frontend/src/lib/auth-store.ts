import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "./api";
import type { Role } from "./constants";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role | string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
  }) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

function normalizeUser(user: any): User {
  const name = user.name || [user.first_name, user.last_name].filter(Boolean).join(" ") || "User";

  return {
    id: user.id,
    name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || user.avatar_url,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/login", { email, password });
          const payload = data.data || data;
          const token = payload.token || payload.accessToken;
          const user = normalizeUser(payload.user);
          localStorage.setItem("token", token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch {
          set({ isLoading: false });
          throw new Error("Invalid credentials");
        }
      },

      register: async (formData: any) => {
        set({ isLoading: true });
        try {
          const [firstName, ...rest] = formData.name.trim().split(/\s+/);
          await api.post("/auth/register", {
            email: formData.email,
            password: formData.password,
            first_name: firstName,
            last_name: rest.join(" ") || undefined,
            phone: formData.phone,
            role: 'customer',
          });
          set({ isLoading: false });
        } catch {
          set({ isLoading: false });
          throw new Error("Registration failed");
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: "harshith-ram-construction-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
