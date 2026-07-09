import { UploadCloud } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { uploadResume } from "../api/resumes";

export default function ResumeUpload({ onUploaded }: { onUploaded: () => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const file = new FormData(event.currentTarget).get("file");
    if (!(file instanceof File) || !file.name) return;
    setBusy(true);
    setMessage("");
    try {
      await uploadResume(file);
      setMessage("Upload received. Resume Agent is extracting your profile.");
      onUploaded();
    } catch {
      setMessage("Upload failed. Please check that the file is a PDF under the size limit.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-lg border border-dashed border-slate-300 bg-white p-6 shadow-soft">
      <div className="flex flex-col items-center text-center">
        <UploadCloud className="h-10 w-10 text-accent" />
        <h2 className="mt-3 text-lg font-bold text-ink">Upload your CV</h2>
        <input className="field mt-5 max-w-md" name="file" type="file" accept="application/pdf" />
        <button className="btn-primary mt-4" disabled={busy}>
          {busy ? "Uploading..." : "Upload PDF"}
        </button>
        {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
      </div>
    </form>
  );
}
