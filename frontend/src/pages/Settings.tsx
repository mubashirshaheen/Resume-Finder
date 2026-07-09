import { useEffect, useState } from "react";
import { getResume } from "../api/resumes";
import { updateSkills } from "../api/users";
import SkillEditor from "../components/SkillEditor";
import { useAuth } from "../hooks/useAuth";
import type { Resume } from "../lib/types";

export default function Settings() {
  const { user, refresh } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getResume().then(setResume);
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-black text-ink">Settings</h1>
      <p className="mt-2 text-slate-600">Tune your extracted profile and recalculate matches.</p>
      <div className="mt-6">
        <SkillEditor
          skills={resume?.extracted_skills || []}
          keywords={resume?.extracted_keywords || []}
          titles={resume?.extracted_job_titles || []}
          location={user?.preferred_location || ""}
          onSave={async ({ skills, keywords, titles, location }) => {
            const result = await updateSkills({
              extracted_skills: skills,
              extracted_keywords: keywords,
              extracted_job_titles: titles,
              preferred_location: location
            });
            await refresh();
            setMessage(`Recalculated ${result.matched} matches.`);
          }}
        />
      </div>
      {message && <p className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</p>}
    </main>
  );
}
