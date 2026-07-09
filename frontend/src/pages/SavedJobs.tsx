import { useEffect, useState } from "react";
import { getMatches } from "../api/matches";
import JobCard from "../components/JobCard";
import type { Match } from "../lib/types";

export default function SavedJobs() {
  const [saved, setSaved] = useState<Match[]>([]);
  const [applied, setApplied] = useState<Match[]>([]);

  const load = async () => {
    setSaved(await getMatches({ status: "saved" }));
    setApplied(await getMatches({ status: "applied" }));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black text-ink">Saved and applied</h1>
      <section className="mt-6">
        <h2 className="text-xl font-bold text-ink">Saved</h2>
        <div className="mt-3 grid gap-4">{saved.map((match) => <JobCard key={match.id} match={match} onChange={load} />)}</div>
        {saved.length === 0 && <p className="mt-3 text-sm text-slate-600">No saved jobs yet.</p>}
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-bold text-ink">Applied</h2>
        <div className="mt-3 grid gap-4">{applied.map((match) => <JobCard key={match.id} match={match} onChange={load} />)}</div>
        {applied.length === 0 && <p className="mt-3 text-sm text-slate-600">No applied jobs yet.</p>}
      </section>
    </main>
  );
}
