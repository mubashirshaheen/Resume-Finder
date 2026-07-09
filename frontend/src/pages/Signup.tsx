import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, signup } from "../api/auth";
import { useAuth } from "../hooks/useAuth";

export default function Signup() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      full_name: String(form.get("full_name")),
      email: String(form.get("email")),
      password: String(form.get("password")),
      preferred_location: String(form.get("preferred_location") || "")
    };
    try {
      await signup(payload);
      await login({ email: payload.email, password: payload.password });
      await refresh();
      navigate("/upload");
    } catch {
      setError("Signup failed. Try another email or a longer password.");
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-lg items-center px-4 py-10">
      <form onSubmit={submit} className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-black text-ink">Create your account</h1>
        <label className="mt-5 block text-sm font-semibold text-slate-700">Full name<input className="field mt-2" name="full_name" required /></label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">Email<input className="field mt-2" name="email" type="email" required /></label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">Preferred location<input className="field mt-2" name="preferred_location" placeholder="United States, Remote, New York..." /></label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">Password<input className="field mt-2" name="password" type="password" minLength={8} required /></label>
        {error && <p className="mt-3 text-sm text-coral">{error}</p>}
        <button className="btn-primary mt-5 w-full">Sign up</button>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already registered? <Link className="font-semibold text-accent" to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}
