import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Always show the same confirmation regardless of outcome, so we don't
    // leak whether an email is registered.
    try {
      await api.post(`/api/auth/forgot-password?email=${encodeURIComponent(email)}`);
    } finally {
      setSent(true);
    }
  }

  return (
    <div className="container-page py-20 max-w-sm mx-auto">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2">Reset password</h1>
      {sent ? (
        <p className="text-inkmute leading-relaxed">
          If an account exists for <span className="text-ink font-medium">{email}</span>,
          a reset link is on its way.
        </p>
      ) : (
        <>
          <p className="text-inkmute mb-8">
            Enter your email and we'll send a link to reset your password.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-ink block mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-white focus:border-navy outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-navy text-white font-medium py-2.5 rounded-sm hover:bg-navy-dark transition-colors"
            >
              Send reset link
            </button>
          </form>
        </>
      )}
      <p className="text-sm text-inkmute mt-6 text-center">
        <Link to="/login" className="text-navy font-medium hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
