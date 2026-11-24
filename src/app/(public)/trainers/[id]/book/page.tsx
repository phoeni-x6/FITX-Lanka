
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Loader2,
  Send,
  UserRound,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type TrainerInfo = {
  id: string;
  full_name: string;
  specialty: string;
  location: string;
  price_per_session: number | null;
  profile_image_url: string | null;
};

export default function TrainerBookingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const trainerId = params.id;

  const supabase = useMemo(() => createClient(), []);

  const [trainer, setTrainer] = useState<TrainerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPage() {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace(
          `/login?redirectTo=${encodeURIComponent(
            `/trainers/${trainerId}/book`
          )}`
        );
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        setError("Unable to verify your account. Please try again.");
        setLoading(false);
        return;
      }

      if (profile.role !== "client") {
        setError("Only client accounts can request trainer sessions.");
        setLoading(false);
        return;
      }

      const { data: trainerData, error: trainerError } = await supabase
        .from("trainer_profiles")
        .select(
          "id, full_name, specialty, location, price_per_session, profile_image_url"
        )
        .eq("id", trainerId)
        .eq("is_approved", true)
        .single();

      if (trainerError || !trainerData) {
        setError(
          "This trainer could not be found or is not currently available."
        );
        setLoading(false);
        return;
      }

      setTrainer(trainerData);
      setLoading(false);
    }

    loadPage();
  }, [supabase, trainerId, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!trainer) return;

    if (!date || !time) {
      setError("Please select your preferred date and time.");
      return;
    }

    const startDate = new Date(`${date}T${time}`);

    if (Number.isNaN(startDate.getTime())) {
      setError("Please select a valid date and time.");
      return;
    }

    if (startDate <= new Date()) {
      setError("Please select a future date and time.");
      return;
    }

    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    setSubmitting(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Your session has expired. Please log in again.");
      setSubmitting(false);
      return;
    }

    const { error: bookingError } = await supabase
      .from("bookings")
      .insert({
        client_id: user.id,
        trainer_id: trainer.id,
        request_type: "trainer_session",
        preferred_start_at: startDate.toISOString(),
        preferred_end_at: endDate.toISOString(),
        message: message.trim() || null,
        status: "pending",
      });

    if (bookingError) {
      console.error("Booking request error:", bookingError);
      setError(
        "Unable to submit your booking request. Please check your details and try again."
      );
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-charcoal">
        <Loader2 className="animate-spin text-brand-lime" size={32} />
      </main>
    );
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-charcoal px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-brand-card p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-lime/10">
            <Send size={28} className="text-brand-lime" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-brand-cream">
            Request submitted!
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            Your session request has been sent to {trainer?.full_name}.
            It will remain pending until the trainer responds.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/bookings"
              className="rounded-xl bg-brand-lime px-5 py-3 text-sm font-bold text-brand-charcoal transition hover:opacity-90 !text-black" 
            >
              View My Bookings
            </Link>

            <Link
              href="/trainers"
              className="text-sm font-medium text-gray-400 transition hover:text-brand-lime"
            >
              Browse More Trainers
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-charcoal px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/trainers/${trainerId}`}
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-brand-lime"
        >
          <ArrowLeft size={16} />
          Back to Trainer Profile
        </Link>

        {error && !trainer ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-400">
            {error}
          </div>
        ) : trainer ? (
          <>
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">
                FitX Lanka
              </p>

              <h1 className="mt-3 text-3xl font-bold text-brand-cream sm:text-4xl">
                Request a Training Session
              </h1>

              <p className="mt-3 text-sm text-gray-400">
                Choose your preferred date and time. The trainer will review
                your request.
              </p>
            </div>

            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-brand-card p-5">
              {trainer.profile_image_url ? (
                <img
                  src={trainer.profile_image_url}
                  alt={trainer.full_name}
                  className="h-16 w-16 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/[0.05]">
                  <UserRound size={28} className="text-gray-500" />
                </div>
              )}

              <div className="min-w-0">
                <h2 className="font-bold text-brand-cream">
                  {trainer.full_name}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {trainer.specialty} · {trainer.location}
                </p>

                <p className="mt-2 text-sm font-semibold text-brand-lime">
                  {trainer.price_per_session !== null
                    ? `Rs. ${Number(
                        trainer.price_per_session
                      ).toLocaleString("en-LK")} / session`
                    : "Contact for price"}
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 rounded-2xl border border-white/[0.08] bg-brand-card p-6 sm:p-8"
            >
              <div>
                <label
                  htmlFor="booking-date"
                  className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-cream"
                >
                  <CalendarDays size={16} className="text-brand-lime" />
                  Preferred Date
                </label>

                <input
                  id="booking-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toLocaleDateString("en-CA")}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#171A18] px-4 py-3 text-sm text-brand-cream scheme-dark outline-none transition focus:border-brand-lime focus:ring-1 focus:ring-brand-lime/30"
                />
              </div>

              <div>
                <label
                  htmlFor="booking-time"
                  className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-cream"
                >
                  <Clock size={16} className="text-brand-lime" />
                  Preferred Start Time
                </label>

                <input
                  id="booking-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#171A18] px-4 py-3 text-sm text-brand-cream scheme-dark outline-none transition focus:border-brand-lime focus:ring-1 focus:ring-brand-lime/30"
                />

                <p className="mt-2 text-xs text-gray-500">
                  This request is for a one-hour session.
                </p>
              </div>

              <div>
                <label
                  htmlFor="booking-message"
                  className="mb-2 block text-sm font-semibold text-brand-cream"
                >
                  Message to Trainer
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    Optional
                  </span>
                </label>

                <textarea
                  id="booking-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Tell the trainer about your goals or anything they should know..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#171A18] px-4 py-3 text-sm text-brand-cream outline-none transition placeholder:text-gray-600 focus:border-brand-lime focus:ring-1 focus:ring-brand-lime/30"
                />

                <p className="mt-1 text-right text-[10px] text-gray-500">
                  {message.length}/1000
                </p>
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </p>
              )}

           <button
  type="submit"
  disabled={submitting}
  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-lime py-4 text-sm font-bold !text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
>
  {submitting ? (
    <>
      <Loader2 size={17} className="animate-spin" />
      Submitting Request...
    </>
  ) : (
    <>
      Submit Booking Request
      <Send size={16} />
    </>
  )}
</button>

              <p className="text-center text-xs text-gray-500">
                No payment is collected at this stage. Your request must be
                accepted by the trainer.
              </p>
            </form>
          </>
        ) : null}
      </div>
    </main>
  );
}
