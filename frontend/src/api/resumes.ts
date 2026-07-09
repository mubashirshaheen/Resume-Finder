import { api } from "./client";
import type { Resume } from "../lib/types";

export async function uploadResume(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<Resume>("/resumes/upload", form);
  return data;
}

export async function getResume() {
  const { data } = await api.get<Resume | null>("/resumes/me");
  return data;
}

export async function getResumeStatus() {
  const { data } = await api.get<{ id: number | null; processing_status: string }>("/resumes/status");
  return data;
}
