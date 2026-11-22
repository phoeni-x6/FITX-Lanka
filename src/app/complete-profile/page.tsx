
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserRound, Phone, Mail, Loader2, ArrowRight } from "lucide-react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? "");

      const metadata = user.user_metadata ?? {};

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("display_name, phone, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setError("Unable to load your profile. Please try again.");
        setLoading(false);
        return;
      }

      setFullName(
        profile?.display_name ||
          metadata.display_name ||
          metadata.full_name ||
          metadata.name ||
          ""
      );

      setPhone(profile?.phone || metadata.phone || "");

      setAvatarUrl(
        profile?.avatar_url ||
          metadata.avatar_url ||
          metadata.picture ||
          ""
      );

      setLoading(false);
    };

    loadProfile();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^\+94\d{9}$/.test(trimmedPhone)) {
      setError("Enter a valid Sri Lankan mobile number, e.g. +94771234567.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Your session has expired. Please log in again.");
      setSaving(false);
      router.replace("/login");
      return;
    }

    // Keep the user's profile metadata in sync with their profile record.
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        display_name: trimmedName,
        phone: trimmedPhone,
      },
    });

    if (metadataError) {
      setError(metadataError.message);
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: trimmedName,
        phone: trimmedPhone,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-background">
        <Loader2 className="h-7 w-7 animate-spin text-brand-lime" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-5 inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime text-brand-background">
              <span className="text-xl font-black">F</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-brand-cream">
              FitX <span className="text-brand-lime">Lanka</span>
            </span>
          </div>

          <h1 className="text-3xl font-bold text-brand-cream">
            Complete your profile
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Just a few details before you get started.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-brand-card p-6 shadow-2xl sm:p-8">
          <div className="mb-7 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-brand-lime/50 bg-brand-background">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarUrl("")}
                />
              ) : (
                <UserRound className="h-10 w-10 text-gray-500" />
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-cream">
                Full name
              </label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  minLength={2}
                  className="w-full rounded-xl border border-white/10 bg-brand-background py-3 pl-10 pr-4 text-sm text-brand-cream outline-none transition placeholder:text-gray-600 focus:border-brand-lime"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-brand-cream">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-gray-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-brand-cream">
                Mobile number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94771234567"
                  required
                  className="w-full rounded-xl border border-white/10 bg-brand-background py-3 pl-10 pr-4 text-sm text-brand-cream outline-none transition placeholder:text-gray-600 focus:border-brand-lime"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Use your Sri Lankan number with the +94 country code.
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-lime py-3.5 text-sm font-bold text-brand-background transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving profile...
                </>
              ) : (
                <>
                  Save and continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">
          Your information is kept secure and is not displayed publicly.
        </p>
      </div>
    </main>
  );
}
