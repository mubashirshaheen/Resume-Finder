import type { Match } from "../lib/types";

const styles = {
  strong: "bg-emerald-100 text-emerald-800",
  good: "bg-sky-100 text-sky-800",
  weak: "bg-amber-100 text-amber-800"
};

export default function MatchBadge({ level, score }: { level: Match["match_level"]; score: number }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold capitalize ${styles[level]}`}>
      {level} {Math.round(score)}%
    </span>
  );
}
