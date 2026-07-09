import { api } from "./client";
import type { User } from "../lib/types";

export async function signup(payload: { email: string; password: string; full_name: string; preferred_location?: string }) {
  const { data } = await api.post<User>("/auth/signup", payload);
  return data;
}

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post<{ access_token: string }>("/auth/login", payload);
  localStorage.setItem("resume_agent_token", data.access_token);
  return data;
}

export async function me() {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export function logout() {
  localStorage.removeItem("resume_agent_token");
}
