import type { FormEvent } from "react";
import { useState } from "react";

function split(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function SkillEditor({
  skills,
  keywords,
  titles,
  location,
  onSave
}: {
  skills: string[];
  keywords: string[];
  titles: string[];
  location: string | null;
  onSave: (payload: { skills: string[]; keywords: string[]; titles: string[]; location: string }) => Promise<void>;
}) {
  const [skillText, setSkillText] = useState(skills.join(", "));
  const [keywordText, setKeywordText] = useState(keywords.join(", "));
  const [titleText, setTitleText] = useState(titles.join(", "));
  const [place, setPlace] = useState(location || "");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    await onSave({ skills: split(skillText), keywords: split(keywordText), titles: split(titleText), location: place });
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <label className="block text-sm font-semibold text-slate-700">
        Skills
        <textarea className="field mt-2 min-h-24" value={skillText} onChange={(e) => setSkillText(e.target.value)} />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Keywords
        <textarea className="field mt-2 min-h-20" value={keywordText} onChange={(e) => setKeywordText(e.target.value)} />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Job titles
        <input className="field mt-2" value={titleText} onChange={(e) => setTitleText(e.target.value)} />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Preferred location
        <input className="field mt-2" value={place} onChange={(e) => setPlace(e.target.value)} />
      </label>
      <button className="btn-primary" disabled={saving}>
        {saving ? "Saving..." : "Save and recalculate"}
      </button>
    </form>
  );
}
