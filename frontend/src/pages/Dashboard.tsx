import { RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchJobsNow } from "../api/jobs";
import { getMatches } from "../api/matches";
import JobCard from "../components/JobCard";
import type { Match } from "../lib/types";

const filters = ["all", "strong", "good", "weak", "saved", "applied", "recent"] as const;

export default function Dashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const params = filter === "strong" || filter === "good" || filter === "weak" ? { level: filter } : filter === "saved" || filter === "applied" ? { status: filter } : undefined;
    setMatches(await getMatches(params));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [filter]);

  const shown = useMemo(() => {
    if (filter !== "recent") return matches;
    return [...matches].sort((a, b) => Date.parse(b.job.posted_at || "") - Date.parse(a.job.posted_at || ""));
  }, [matches, filter]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-ink">Matched jobs</h1>
          <p className="mt-2 text-slate-600">Scored opportunities from stored matches, not live recalculation.</p>
        </div>
        <button className="btn-muted" onClick={async () => { await fetchJobsNow(); await load(); }}>
          <RefreshCcw className="h-4 w-4" /> Fetch jobs
        </button>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`rounded-md px-3 py-2 text-sm font-semibold capitalize ${filter === item ? "bg-ink text-white" : "bg-white text-slate-700"}`}>
            {item}
          </button>
        ))}
      </div>
      <section className="mt-6 grid gap-4">
        {loading ? <p className="text-sm text-slate-500">Loading matches...</p> : shown.map((match) => <JobCard key={match.id} match={match} onChange={load} />)}
        {!loading && shown.length === 0 && <p className="rounded-lg bg-white p-6 text-slate-600 shadow-soft">No matches yet. Upload a resume or fetch jobs to get started.</p>}
      </section>
    </main>
  );
}
