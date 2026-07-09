import { api } from "./client";
import type { Match } from "../lib/types";

export async function getMatches(params?: { level?: string; status?: string }) {
  const { data } = await api.get<Match[]>("/matches", { params });
  return data;
}

export async function getMatch(id: string) {
  const { data } = await api.get<Match>(`/matches/${id}`);
  return data;
}

export async function updateMatchStatus(id: number, status: Match["status"]) {
  const { data } = await api.patch<Match>(`/matches/${id}/status`, { status });
  return data;
}

export async function recalculateMatches() {
  const { data } = await api.post<{ matched: number }>("/matches/recalculate");
  return data;
}
