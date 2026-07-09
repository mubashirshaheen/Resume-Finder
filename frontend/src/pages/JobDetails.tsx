import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMatch } from "../api/matches";
import MatchBadge from "../components/MatchBadge";
import type { Match } from "../lib/types";

export default function JobDetails() {
  const { matchId } = useParams();
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (matchId) getMatch(matchId).then(setMatch);
  }, [matchId]);

  if (!match) return <main className="p-8 text-sm text-slate-500">Loading job...</main>;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-ink">{match.job.title}</h1>
            <p className="mt-2 text-slate-600">{match.job.company || "Unknown company"} · {match.job.location || "United States"}</p>
          </div>
          <MatchBadge level={match.match_level} score={match.match_score} />
        </div>
        <a className="btn-primary mt-6" href={match.job.job_url} target="_blank" rel="noreferrer">Open job <ArrowUpRight className="h-4 w-4" /></a>
        <h2 className="mt-8 text-lg font-bold text-ink">Match detail</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{match.match_reason}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {match.matched_skills.map((skill) => <span key={skill} className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800">{skill}</span>)}
        </div>
        <h2 className="mt-8 text-lg font-bold text-ink">Description</h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">{match.job.description || "No description provided by source."}</p>
      </div>
    </main>
  );
}
