import { api } from "./client";
import type { Job } from "../lib/types";

export async function getJobs() {
  const { data } = await api.get<Job[]>("/jobs");
  return data;
}

export async function getJob(id: string) {
  const { data } = await api.get<Job>(`/jobs/${id}`);
  return data;
}

export async function fetchJobsNow() {
  const { data } = await api.post("/jobs/fetch-now");
  return data;
}
