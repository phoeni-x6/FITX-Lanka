
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Dumbbell,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [checking, setChecking] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error || !data.session) {
        setValidSession(false);
      } else {
        setValidSession(true);
      }

      setChecking(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setValidSession(true);
        setChecking(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleResetPassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    await supabase.auth.signOut();

    setTimeout(() => {
      router.push("/login?password-reset=success");
    }, 2000);
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

        <div className="rounded-3xl border border-white/[0.07] bg-[#222723] p-7 shadow-2xl shadow-black/30 sm:p-9">

          <div className="mb-7">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#C7F36B]/20 bg-[#C7F36B]/10">
              <Lock className="h-7 w-7 text-[#C7F36B]" />
            </div>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#C7F36B]">
              Account security
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight">
              Reset your password.
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#A5AAA2]">
              Create a new secure password for your FitX Lanka account.
            </p>
          </div>

          {checking ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="mb-3 h-7 w-7 animate-spin text-[#C7F36B]" />
              <p className="text-sm text-[#A5AAA2]">
                Verifying your reset link...
              </p>
            </div>
          ) : success ? (
            <div className="rounded-xl border border-[#C7F36B]/20 bg-[#C7F36B]/10 p-5">
              <CheckCircle2 className="mb-3 h-7 w-7 text-[#C7F36B]" />
              <p className="font-semibold text-[#C7F36B]">
                Password updated successfully!
              </p>
              <p className="mt-2 text-sm text-[#D5D9D1]">
                Redirecting you to the login page...
              </p>
            </div>
          ) : !validSession ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <AlertCircle className="mb-2 h-5 w-5 text-red-400" />
                <p className="font-semibold text-red-400">
                  Invalid or expired link
                </p>
                <p className="mt-1 text-sm leading-5 text-[#D5D9D1]">
                  This password reset link is invalid or has expired. Please
                  request a new one.
                </p>
              </div>

              <Link
                href="/forgot-password"
                className="flex w-full items-center justify-center rounded-xl bg-[#C7F36B] px-4 py-3.5 text-sm font-extrabold text-[#171A18] transition hover:bg-[#d4ff7a]"
              >
                Request a new reset link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">

              {/* New password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#D5D9D1]">
                  New password
                </label>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777E76]" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-[#171A18] py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-[#686F67] focus:border-[#C7F36B]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777E76] hover:text-white"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#D5D9D1]">
                  Confirm new password
                </label>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777E76]" />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-[#171A18] py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-[#686F67] focus:border-[#C7F36B]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777E76] hover:text-white"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#777E76]">
                Use at least 8 characters for your new password.
              </p>

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
                    Updating password...
                  </>
                ) : (
                  <>
                    Update password
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
