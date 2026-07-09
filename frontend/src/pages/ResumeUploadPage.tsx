import { useEffect, useState } from "react";
import { getResume, getResumeStatus } from "../api/resumes";
import ResumeUpload from "../components/ResumeUpload";
import type { Resume } from "../lib/types";

export default function ResumeUploadPage() {
  const [resume, setResume] = useState<Resume | null>(null);

  const load = async () => setResume(await getResume());

  useEffect(() => {
    load();
    const timer = window.setInterval(async () => {
      const status = await getResumeStatus();
      if (status.id) load();
    }, 4000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-black text-ink">CV upload</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <ResumeUpload onUploaded={load} />
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="font-bold text-ink">Latest resume</h2>
          {resume ? (
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-800">File:</span> {resume.original_filename}</p>
              <p><span className="font-semibold text-slate-800">Status:</span> {resume.processing_status}</p>
              <p><span className="font-semibold text-slate-800">Experience:</span> {resume.experience_level || "Pending"}</p>
              <div className="flex flex-wrap gap-2">
                {resume.extracted_skills.slice(0, 10).map((skill) => <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800" key={skill}>{skill}</span>)}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">No active resume yet.</p>
          )}
        </aside>
      </div>
    </main>
  );
}
