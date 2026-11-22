
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Dumbbell,
  Mail,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#171A18] px-4 py-10 text-[#EFEFE5]">

      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#C7F36B]/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#C7F36B]/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[440px]">

        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C7F36B]">
            <Dumbbell className="h-6 w-6 text-[#171A18]" />
          </div>

          <span className="text-2xl font-black tracking-tight">
            FITX<span className="text-[#C7F36B]">.</span>
            <span className="ml-1 text-sm font-semibold text-[#A5AAA2]">
              LANKA
            </span>
          </span>
        </Link>

        {/* Card */}
        <div className="rounded-3xl border border-white/[0.07] bg-[#222723] p-7 shadow-2xl shadow-black/30 sm:p-9">

          <Link
            href="/login"
            className="mb-7 inline-flex items-center gap-2 text-sm text-[#A5AAA2] transition hover:text-[#C7F36B]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          <div className="mb-7">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#C7F36B]/20 bg-[#C7F36B]/10">
              <Mail className="h-7 w-7 text-[#C7F36B]" />
            </div>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#C7F36B]">
              Account recovery
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight">
              Forgot password?
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#A5AAA2]">
              No worries. Enter your registered email address and we'll send
              you a link to reset your password.
            </p>
          </div>

          {success ? (
            <div className="space-y-5">
              <div className="flex gap-3 rounded-xl border border-[#C7F36B]/20 bg-[#C7F36B]/10 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#C7F36B]" />
                <div>
                  <p className="font-semibold text-[#C7F36B]">
                    Check your email
                  </p>
                  <p className="mt-1 text-sm leading-5 text-[#D5D9D1]">
                    If an account exists for this email, you'll receive a
                    password reset link.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSuccess(false)}
                className="w-full rounded-xl border border-white/10 bg-[#171A18] px-4 py-3 text-sm font-semibold transition hover:border-[#C7F36B]/40"
              >
                Try another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium text-[#D5D9D1]">
                  Email address
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777E76]" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-white/10 bg-[#171A18] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#686F67] focus:border-[#C7F36B]"
                  />
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#C7F36B] px-4 py-3.5 text-sm font-extrabold text-[#171A18] transition hover:bg-[#d4ff7a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  <>
                    Send reset link
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="mt-7 text-center text-xs text-[#686F67]">
          Your goals. Your people. Your move.
        </p>
      </div>
    </main>
  );
}
