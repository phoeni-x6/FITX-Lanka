
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Dumbbell,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import ClientMobileMenu from "@/components/dashboard/ClientMobileMenu";

type Profile = {
  display_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
};

export default function AccountProfilePage() {
  const supabase = useMemo(() => createClient(), []);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const dashboardLink = useMemo(() => {
    switch (profile?.role) {
      case "trainer":
        return "/trainers/dashboard";
      case "gym_owner":
        return "/gym/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/dashboard";
    }
  }, [profile?.role]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please log in to view your account.");
      }

      setUserId(user.id);
      setEmail(user.email || "");
      setNewEmail(user.email || "");

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("display_name, phone, avatar_url, role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      setProfile(data);
      setDisplayName(data.display_name || "");
      setPhone(data.phone || "");
    } catch (err) {
      console.error("Profile loading error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const saveProfile = async () => {
    setError("");
    setMessage("");

    if (!displayName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim(),
          phone: phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          display_name: displayName.trim(),
          phone: phone.trim() || null,
        },
      });

      if (metadataError) {
        console.error("User metadata update error:", metadataError);
      }

      setProfile((current) =>
        current
          ? {
              ...current,
              display_name: displayName.trim(),
              phone: phone.trim() || null,
            }
          : current
      );

      setMessage("Your profile information has been updated.");
    } catch (err) {
      console.error("Profile update error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Your profile picture must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${userId}/profile-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      const { error: metadataError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (metadataError) {
        console.error("Avatar metadata update error:", metadataError);
      }

      setProfile((current) =>
        current ? { ...current, avatar_url: publicUrl } : current
      );

      setMessage("Your profile picture has been updated.");
    } catch (err) {
      console.error("Avatar upload error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload your profile picture."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const updateEmail = async () => {
    setError("");
    setMessage("");

    const requestedEmail = newEmail.trim().toLowerCase();

    if (!requestedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (requestedEmail === email.toLowerCase()) {
      setError("This is already your current email address.");
      return;
    }

    setChangingEmail(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: requestedEmail,
      });

      if (updateError) throw updateError;

      setMessage(
        "Email change requested. Please check your email and follow the confirmation instructions. Your current email remains active until the change is confirmed."
      );
    } catch (err) {
      console.error("Email update error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to request an email change."
      );
    } finally {
      setChangingEmail(false);
    }
  };

  const updatePassword = async () => {
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setNewPassword("");
      setConfirmPassword("");
      setMessage("Your password has been updated successfully.");
    } catch (err) {
      console.error("Password update error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const roleLabel = (role: string) => {
    const labels: Record<string, string> = {
      client: "Client",
      trainer: "Personal Trainer",
      gym_owner: "Gym Owner",
      admin: "Administrator",
    };

    return labels[role] || "Member";
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-[#171A18] px-4 py-3 text-sm text-brand-cream outline-none transition placeholder:text-gray-600 focus:border-brand-lime";

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-background text-brand-cream">
        <Loader2 size={32} className="animate-spin text-brand-lime" />
        <p className="mt-4 text-sm text-gray-400">
          Loading your account...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-background px-5 text-brand-cream">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Profile unavailable</h1>
          <p className="mt-3 text-sm text-gray-400">{error}</p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-brand-lime px-5 py-3 text-sm font-bold text-brand-background"
          >
            Back to FitX Lanka
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-brand-background text-brand-cream">
      {/* Top navigation */}
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#1C201D]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {profile.role === "client" && <ClientMobileMenu />}

            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime text-brand-background">
                <Dumbbell size={21} strokeWidth={2.5} />
              </div>

              <span className="text-lg font-extrabold">
                FitX <span className="text-brand-lime">Lanka</span>
              </span>
            </Link>
          </div>

          <Link
            href={dashboardLink}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-brand-lime"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-9 sm:px-8 lg:py-12">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">
            Account Settings
          </p>

          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Manage your personal information and account security.
          </p>
        </div>

        {/* Feedback */}
        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-brand-lime/20 bg-brand-lime/[0.06] p-4 text-sm text-brand-lime">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Profile summary */}
          <aside className="h-fit rounded-2xl border border-white/[0.07] bg-brand-card p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-brand-lime/30 bg-[#171A18]">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound size={42} className="text-gray-500" />
                  )}
                </div>

                <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-brand-card bg-brand-lime text-brand-background transition hover:bg-[#d5ff7b]">
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={uploadAvatar}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>

              <h2 className="mt-5 text-lg font-bold">
                {profile.display_name || "FitX Member"}
              </h2>

              <p className="mt-1 break-all text-xs text-gray-500">
                {email}
              </p>

              <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-lime/20 bg-brand-lime/[0.08] px-3 py-1.5 text-xs font-bold text-brand-lime">
                <ShieldCheck size={14} />
                {roleLabel(profile.role)}
              </span>

              <p className="mt-5 text-xs leading-5 text-gray-500">
                JPG, PNG or WebP. Maximum file size: 5 MB.
              </p>
            </div>
          </aside>

          {/* Settings */}
          <div className="space-y-6">
            {/* Personal information */}
            <section className="rounded-2xl border border-white/[0.07] bg-brand-card p-5 sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                  <UserRound size={19} />
                </div>

                <div>
                  <h2 className="font-bold">Personal Information</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Update your basic account details.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold">
                    Full Name
                  </label>
                  <input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Enter your full name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Phone Number
                  </label>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Enter your phone number"
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={saveProfile}
                disabled={saving}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-lime px-5 py-3 text-sm font-bold text-brand-background transition hover:bg-[#d5ff7b] disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Changes
              </button>
            </section>

            {/* Email settings */}
            <section className="rounded-2xl border border-white/[0.07] bg-brand-card p-5 sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                  <Mail size={19} className="text-brand-lime" />
                </div>

                <div>
                  <h2 className="font-bold">Email Address</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Your login and account email.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Current Email
                </label>
                <input
                  value={email}
                  disabled
                  className={`${inputClass} cursor-not-allowed opacity-60`}
                />
              </div>

              <div className="mt-5">
                <label className="text-sm font-semibold">
                  New Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  placeholder="Enter your new email"
                  className={inputClass}
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-gray-500">
                Supabase may require confirmation through your email
                addresses before applying this change.
              </p>

              <button
                type="button"
                onClick={updateEmail}
                disabled={changingEmail}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-brand-cream transition hover:border-brand-lime/40 hover:text-brand-lime disabled:opacity-50"
              >
                {changingEmail && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Request Email Change
              </button>
            </section>

            {/* Password settings */}
            <section className="rounded-2xl border border-white/[0.07] bg-brand-card p-5 sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                  <LockKeyhole size={19} className="text-brand-lime" />
                </div>

                <div>
                  <h2 className="font-bold">Change Password</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Choose a strong password for your account.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold">
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(event.target.value)
                      }
                      placeholder="Enter new password"
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-gray-500 hover:text-brand-cream"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Confirm new password"
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-gray-500 hover:text-brand-cream"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Use at least 8 characters.
              </p>

              <button
                type="button"
                onClick={updatePassword}
                disabled={changingPassword}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-brand-cream transition hover:border-brand-lime/40 hover:text-brand-lime disabled:opacity-50"
              >
                {changingPassword && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Update Password
              </button>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-600">
          Your FitX Lanka account information is protected.
        </div>
      </div>
    </main>
  );
}
