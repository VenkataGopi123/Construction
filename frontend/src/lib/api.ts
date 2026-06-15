import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("harshith-ram-construction-auth");
      localStorage.removeItem("buildmaster-auth");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export async function fetchWithFallback<T>(
  endpoint: string,
  fallback: T
): Promise<{ data: T; isMock: boolean; error?: string }> {
  try {
    const response = await api.get<T>(endpoint);
    const body = response.data as T & { data?: T };
    return { data: body?.data ?? response.data, isMock: false };
  } catch (err) {
    const message =
      err instanceof AxiosError
        ? err.response?.data?.message || err.message
        : "Failed to fetch data";
    return { data: fallback, isMock: true, error: message };
  }
}

export default api;
