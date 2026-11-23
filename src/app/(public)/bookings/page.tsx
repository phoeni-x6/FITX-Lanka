
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Dumbbell,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Send,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Provider = {
  id: string;
  name: string;
  location: string;
  description: string | null;
  image: string | null;
};

type RequestType = "membership_enquiry" | "gym_visit" | "trainer_session";

const supabase = createClient();

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const gymId = searchParams.get("gym");
  const trainerId = searchParams.get("trainer");
  const initialType = searchParams.get("type");

  const isGym = Boolean(gymId);
  const providerId = gymId || trainerId;

  const [provider, setProvider] = useState<Provider | null>(null);
  const [requestType, setRequestType] = useState<RequestType>(
    isGym
      ? initialType === "visit"
        ? "gym_visit"
        : "membership_enquiry"
      : "trainer_session"
  );

  const [preferredDate, setPreferredDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProvider = async () => {
      if (!providerId) {
        setError("No gym or trainer was selected.");
        setLoading(false);
        return;
      }

      const table = isGym ? "gym_profiles" : "trainer_profiles";

      const { data, error: fetchError } = await supabase
        .from(table)
        .select("*")
        .eq("id", providerId)
        .eq("is_approved", true)
        .maybeSingle();

      if (fetchError) {
        console.error(fetchError);
        setError("Unable to load provider details.");
        setLoading(false);
        return;
      }

      if (!data) {
        setError("This gym or trainer is unavailable.");
        setLoading(false);
        return;
      }

      setProvider({
        id: data.id,
        name: isGym ? data.gym_name : data.full_name,
        location: data.city || data.location || "Sri Lanka",
        description: data.description || data.bio || null,
        image: isGym
          ? data.cover_image_url
          : data.profile_image_url,
      });

      setLoading(false);
    };

    fetchProvider();
  }, [providerId, isGym]);

  const isScheduled = requestType !== "membership_enquiry";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!providerId || !provider) {
      setError("Provider information is missing.");
      return;
    }

    if (isScheduled && (!preferredDate || !startTime || !endTime)) {
      setError("Please select your preferred date, start time and end time.");
      return;
    }

    let preferredStartAt: string | null = null;
    let preferredEndAt: string | null = null;

    if (isScheduled) {
      const start = new Date(`${preferredDate}T${startTime}`);
      const end = new Date(`${preferredDate}T${endTime}`);

      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        end <= start
      ) {
        setError("The end time must be later than the start time.");
        return;
      }

      if (start <= new Date()) {
        setError("Please select a future date and time.");
        return;
      }

      preferredStartAt = start.toISOString();
      preferredEndAt = end.toISOString();
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }

      const bookingData = {
        client_id: user.id,
        trainer_id: isGym ? null : providerId,
        gym_id: isGym ? providerId : null,
        request_type: requestType,
        preferred_start_at: preferredStartAt,
        preferred_end_at: preferredEndAt,
        message: message.trim() || null,
        status: "pending",
      };

      const { error: insertError } = await supabase
        .from("bookings")
        .insert(bookingData);

      if (insertError) {
        console.error(insertError);
        throw new Error(insertError.message);
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto animate-spin text-brand-lime" />
          <p className="mt-4 text-sm text-gray-400">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error && !provider) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-5">
        <div className="max-w-md text-center">
          <AlertCircle size={40} className="mx-auto text-red-400" />
          <h1 className="mt-5 text-2xl font-bold text-brand-cream">
            Unable to continue
          </h1>
          <p className="mt-3 text-sm text-gray-400">{error}</p>
          <Link
            href="/gyms"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand-lime px-5 py-3 text-sm font-bold text-brand-background"
          >
            <ArrowLeft size={16} />
            Back to gyms
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center px-5">
        <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-brand-card p-8 text-center sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-lime/10">
            <CheckCircle2 size={34} className="text-brand-lime" />
          </div>

          <h1 className="mt-6 text-2xl font-black text-brand-cream">
            Request submitted!
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            Your request has been sent to {provider?.name}. It is currently
            pending provider approval.
          </p>

          <div className="mt-7 space-y-3">
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center rounded-xl bg-brand-lime px-5 py-3.5 text-sm font-bold text-brand-background transition hover:bg-brand-cream"
            >
              Go to dashboard
            </Link>

            <Link
              href="/gyms"
              className="flex w-full items-center justify-center rounded-xl border border-white/10 px-5 py-3.5 text-sm font-semibold text-brand-cream transition hover:border-brand-lime/40"
            >
              Explore more gyms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-brand-background pb-20">
      <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-8 lg:px-10">
        <Link
          href={isGym ? `/gyms/${providerId}` : "/trainers"}
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-brand-lime"
        >
          <ArrowLeft size={17} />
          Back
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Booking form */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-white/[0.07] bg-brand-card p-6 sm:p-9">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">
                FitX Lanka bookings
              </span>

              <h1 className="mt-3 text-3xl font-black text-brand-cream">
                {isGym ? "Request a gym booking" : "Request a trainer session"}
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                Send your request directly to the provider. They will review
                it and respond to your request.
              </p>

              <form onSubmit={handleSubmit} className="mt-9 space-y-7">
                {/* Request type */}
                {isGym && (
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-brand-cream">
                      What would you like to do?
                    </label>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setRequestType("membership_enquiry")}
                        className={`rounded-xl border p-4 text-left transition ${
                          requestType === "membership_enquiry"
                            ? "border-brand-lime bg-brand-lime/10"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <Dumbbell
                          size={21}
                          className={
                            requestType === "membership_enquiry"
                              ? "text-brand-lime"
                              : "text-gray-400"
                          }
                        />
                        <p className="mt-3 text-sm font-bold text-brand-cream">
                          Membership enquiry
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Ask about membership options and pricing.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRequestType("gym_visit")}
                        className={`rounded-xl border p-4 text-left transition ${
                          requestType === "gym_visit"
                            ? "border-brand-lime bg-brand-lime/10"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <CalendarDays
                          size={21}
                          className={
                            requestType === "gym_visit"
                              ? "text-brand-lime"
                              : "text-gray-400"
                          }
                        />
                        <p className="mt-3 text-sm font-bold text-brand-cream">
                          Request a gym visit
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Arrange a preferred date and time to visit.
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Appointment date and time */}
                {isScheduled && (
                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-brand-cream">
                        Preferred date
                      </label>

                      <div className="relative">
                        <CalendarDays
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-lime"
                        />
                        <input
                          type="date"
                          value={preferredDate}
                          min={new Date().toLocaleDateString("en-CA")}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          required
                          className="w-full rounded-xl border border-white/10 bg-brand-background py-3.5 pl-11 pr-4 text-sm text-brand-cream outline-none transition focus:border-brand-lime"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-brand-cream">
                          Start time
                        </label>
                        <div className="relative">
                          <Clock
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-lime"
                          />
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                            className="w-full rounded-xl border border-white/10 bg-brand-background py-3.5 pl-11 pr-4 text-sm text-brand-cream outline-none focus:border-brand-lime"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-brand-cream">
                          End time
                        </label>
                        <div className="relative">
                          <Clock
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-lime"
                          />
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                            className="w-full rounded-xl border border-white/10 bg-brand-background py-3.5 pl-11 pr-4 text-sm text-brand-cream outline-none focus:border-brand-lime"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-cream">
                    Additional message
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    maxLength={1000}
                    placeholder={
                      requestType === "membership_enquiry"
                        ? "Ask about membership plans, facilities, prices or anything else..."
                        : "Tell the provider more about your request..."
                    }
                    className="w-full resize-none rounded-xl border border-white/10 bg-brand-background px-4 py-3.5 text-sm text-brand-cream outline-none transition placeholder:text-gray-600 focus:border-brand-lime"
                  />

                  <p className="mt-2 text-right text-xs text-gray-600">
                    {message.length}/1000
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-lime px-5 py-4 text-sm font-bold text-brand-background transition hover:bg-brand-cream disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting request...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Submit booking request
                    </>
                  )}
                </button>

                <p className="text-center text-xs leading-5 text-gray-500">
                  This is a request, not a confirmed booking. The provider
                  must accept it before your booking is confirmed.
                </p>
              </form>
            </div>
          </div>

          {/* Provider information */}
          <aside className="lg:col-span-2">
            <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-brand-card">
              <div className="relative h-56 bg-brand-background">
                {provider?.image ? (
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Dumbbell size={50} className="text-brand-lime/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <span className="rounded-full border border-brand-lime/30 bg-brand-lime/10 px-3 py-1.5 text-xs font-semibold text-brand-lime">
                    Verified provider
                  </span>
                  <h2 className="mt-3 text-2xl font-black text-white">
                    {provider?.name}
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <MapPin size={18} className="text-brand-lime" />
                  {provider?.location}
                </div>

                {provider?.description && (
                  <p className="mt-5 text-sm leading-6 text-gray-400">
                    {provider.description}
                  </p>
                )}

                <div className="mt-6 border-t border-white/[0.07] pt-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Request summary
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-400">Request type</span>
                    <span className="text-right text-sm font-semibold text-brand-cream">
                      {requestType === "membership_enquiry"
                        ? "Membership enquiry"
                        : requestType === "gym_visit"
                          ? "Gym visit"
                          : "Trainer session"}
                    </span>
                  </div>

                  {isScheduled && preferredDate && (
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-400">Preferred date</span>
                      <span className="text-sm font-semibold text-brand-cream">
                        {preferredDate}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function BookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-brand-background">
          <Loader2 className="animate-spin text-brand-lime" size={32} />
        </div>
      }
    >
      <BookingForm />
    </Suspense>
  );
}
