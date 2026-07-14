import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", institution: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password, form.institution || undefined);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't create your account. Is the backend running?"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page py-20 max-w-sm mx-auto">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2">Create an account</h1>
      <p className="text-inkmute mb-8">Join the archive as a researcher.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">Full name</label>
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-white focus:border-navy outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">Institution</label>
          <input
            value={form.institution}
            onChange={(e) => update("institution", e.target.value)}
            placeholder="Optional for independent researchers"
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-white focus:border-navy outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-white focus:border-navy outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-white focus:border-navy outline-none"
          />
          <p className="text-xs text-inkmute mt-1">At least 8 characters.</p>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-navy text-white font-medium py-2.5 rounded-sm hover:bg-navy-dark transition-colors disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-inkmute mt-6 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-navy font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
