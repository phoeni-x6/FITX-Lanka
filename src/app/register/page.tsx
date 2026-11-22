
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Dumbbell,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    const phoneRegex = /^\+94\d{9}$/;

    if (!phoneRegex.test(phone.trim())) {
      setError("Enter your mobile number in +94XXXXXXXXX format.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          display_name: fullName.trim(),
          phone: phone.trim(),
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setSuccess(
      "Your account has been created. Please check your email to verify your account before signing in."
    );

    setLoading(false);
  };

  const handleGoogleRegister = async () => {
    setError("");
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#171A18] px-4 py-10 text-[#EFEFE5]">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#C7F36B]/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#C7F36B]/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[460px]">

        {/* Logo */}
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2"
        >
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

        {/* Registration card */}
        <div className="rounded-3xl border border-white/[0.07] bg-[#222723] p-7 shadow-2xl shadow-black/30 sm:p-9">

          <div className="mb-7">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#C7F36B]">
              Join FitX Lanka
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight">
              Create your account.
            </h1>

            <p className="mt-2 text-sm text-[#A5AAA2]">
              Start your fitness journey with us.
            </p>
          </div>

          {/* Google registration */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={googleLoading || loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#171A18] px-4 py-3.5 text-sm font-semibold transition hover:border-[#C7F36B]/40 hover:bg-[#292F2A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg viewBox="0 0 48 48" className="h-5 w-5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.73 6C44.43 38.02 46.98 31.84 46.98 24.55z" />
                <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.12.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs font-medium text-[#777E76]">
              OR REGISTER WITH EMAIL
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Registration form */}
          <form onSubmit={handleRegister} className="space-y-4">

            {/* Full name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#D5D9D1]">
                Full name
              </label>

              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777E76]" />

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  autoComplete="name"
                  className="w-full rounded-xl border border-white/10 bg-[#171A18] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#686F67] focus:border-[#C7F36B]"
                />
              </div>
            </div>

            {/* Mobile number */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#D5D9D1]">
                Mobile number
              </label>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777E76]" />

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94771234567"
                  required
                  autoComplete="tel"
                  className="w-full rounded-xl border border-white/10 bg-[#171A18] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#686F67] focus:border-[#C7F36B]"
                />
              </div>

              <p className="mt-1.5 text-xs text-[#777E76]">
                Use Sri Lankan international format (+94).
              </p>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#D5D9D1]">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777E76]" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
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
                Confirm password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777E76]" />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
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

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div
                role="status"
                className="flex gap-2 rounded-xl border border-[#C7F36B]/20 bg-[#C7F36B]/10 px-4 py-3 text-sm text-[#C7F36B]"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#C7F36B] px-4 py-3.5 text-sm font-extrabold text-[#171A18] transition hover:bg-[#d4ff7a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

          </form>

          {/* Login link */}
          <p className="mt-7 text-center text-sm text-[#A5AAA2]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-[#C7F36B] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-7 text-center text-xs text-[#686F67]">
          Your goals. Your people. Your move.
        </p>

        <p className="mt-2 text-center text-xs text-[#555C54]">
          © {new Date().getFullYear()} FitX Lanka. All rights reserved.
        </p>

      </div>
    </main>
  );
}
