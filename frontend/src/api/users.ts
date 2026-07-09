import { api } from "./client";
import type { User } from "../lib/types";

export async function updateUser(payload: Partial<User>) {
  const { data } = await api.patch<User>("/users/me", payload);
  return data;
}

export async function updateSkills(payload: {
  extracted_skills: string[];
  extracted_keywords: string[];
  extracted_job_titles: string[];
  preferred_location: string | null;
}) {
  const { data } = await api.patch<{ matched: number }>("/users/me/skills", payload);
  return data;
}
