import { BriefcaseBusiness } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await login({ email: String(form.get("email")), password: String(form.get("password")) });
      await refresh();
      navigate("/");
    } catch {
      setError("Invalid email or password.");
    }
  };

  return (
    <main className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-[1fr_420px]">
      <section>
        <div className="flex items-center gap-3 text-accent">
          <BriefcaseBusiness className="h-10 w-10" />
          <span className="text-sm font-bold uppercase tracking-wide">Resume Agent</span>
        </div>
        <h1 className="mt-5 max-w-2xl text-5xl font-black leading-tight text-ink">Your resume becomes a live job matching engine.</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
          Upload a CV, extract your profile locally with Ollama, and work through scored LinkedIn matches from one focused dashboard.
        </p>
      </section>
      <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-bold text-ink">Log in</h2>
        <label className="mt-5 block text-sm font-semibold text-slate-700">Email<input className="field mt-2" name="email" type="email" required /></label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">Password<input className="field mt-2" name="password" type="password" required /></label>
        {error && <p className="mt-3 text-sm text-coral">{error}</p>}
        <button className="btn-primary mt-5 w-full">Log in</button>
        <p className="mt-4 text-center text-sm text-slate-600">
          New here? <Link className="font-semibold text-accent" to="/signup">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
