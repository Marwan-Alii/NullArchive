import { FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/auth/reset-password", { token, new_password: password });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't reset your password. The link may have expired — try requesting a new one."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="container-page py-20 max-w-sm mx-auto text-center">
        <h1 className="font-serif text-2xl font-semibold text-ink mb-3">Invalid reset link</h1>
        <p className="text-inkmute mb-6">
          This link is missing its reset token. Request a new one from the login page.
        </p>
        <Link to="/forgot-password" className="text-navy font-medium hover:underline">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="container-page py-20 max-w-sm mx-auto text-center">
        <h1 className="font-serif text-2xl font-semibold text-ink mb-3">Password updated</h1>
        <p className="text-inkmute mb-6">You can now log in with your new password.</p>
        <Link
          to="/login"
          className="bg-navy text-white px-6 py-3 rounded-sm font-medium hover:bg-navy-dark transition-colors inline-block"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-20 max-w-sm mx-auto">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2">Set a new password</h1>
      <p className="text-inkmute mb-8">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">New password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-white focus:border-navy outline-none"
          />
          <p className="text-xs text-inkmute mt-1">At least 8 characters.</p>
        </div>
        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">Confirm password</label>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-white focus:border-navy outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-navy text-white font-medium py-2.5 rounded-sm hover:bg-navy-dark transition-colors disabled:opacity-50"
        >
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
