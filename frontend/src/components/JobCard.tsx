import { ArrowUpRight, Bookmark, CheckCircle2, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { updateMatchStatus } from "../api/matches";
import type { Match } from "../lib/types";
import MatchBadge from "./MatchBadge";

export default function JobCard({ match, onChange }: { match: Match; onChange: () => void }) {
  const posted = match.job.posted_at ? new Date(match.job.posted_at).toLocaleDateString() : "Recent";

  const setStatus = async (status: Match["status"]) => {
    await updateMatchStatus(match.id, status);
    onChange();
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to={`/jobs/${match.id}`} className="text-xl font-bold text-ink hover:text-accent">
            {match.job.title}
          </Link>
          <p className="mt-1 text-sm text-slate-600">
            {match.job.company || "Unknown company"} · {match.job.location || "United States"} · {posted}
          </p>
        </div>
        <MatchBadge level={match.match_level} score={match.match_score} />
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{match.job.description || match.match_reason}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {match.matched_skills.slice(0, 6).map((skill) => (
          <span key={skill} className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800">
            {skill}
          </span>
        ))}
        {match.missing_skills.slice(0, 4).map((skill) => (
          <span key={skill} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
            Missing: {skill}
          </span>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button className="btn-muted" onClick={() => setStatus("saved")}>
          <Bookmark className="h-4 w-4" /> Save
        </button>
        <button className="btn-muted" onClick={() => setStatus("applied")}>
          <CheckCircle2 className="h-4 w-4" /> Applied
        </button>
        <button className="btn-muted" onClick={() => setStatus("ignored")}>
          <EyeOff className="h-4 w-4" /> Ignore
        </button>
        <a className="btn-primary ml-auto" href={match.job.job_url} target="_blank" rel="noreferrer">
          Open <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}
