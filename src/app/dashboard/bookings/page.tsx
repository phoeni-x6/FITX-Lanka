
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Building2,
  Dumbbell,
  MapPin,
  RefreshCw,
  Loader2,
  AlertCircle,
  Search,
  X,
  UserRound,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import ClientMobileMenu from "@/components/dashboard/ClientMobileMenu";

type Provider = {
  full_name?: string | null;
  gym_name?: string | null;
  location?: string | null;
  city?: string | null;
};

type Booking = {
  id: string;
  request_type: "membership_enquiry" | "gym_visit" | "trainer_session";
  preferred_start_at: string | null;
  preferred_end_at: string | null;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "completed";
  message: string | null;
  provider_response: string | null;
  created_at: string;
  trainer: Provider | Provider[] | null;
  gym: Provider | Provider[] | null;
};

type Filter =
  | "all"
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

const filters: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" },
];

const getProvider = (provider: Provider | Provider[] | null) => {
  if (!provider) return null;
  return Array.isArray(provider) ? provider[0] || null : provider;
};

const getProviderName = (booking: Booking) => {
  const trainer = getProvider(booking.trainer);
  const gym = getProvider(booking.gym);

  return trainer?.full_name || gym?.gym_name || "Provider";
};

const getProviderLocation = (booking: Booking) => {
  const trainer = getProvider(booking.trainer);
  const gym = getProvider(booking.gym);

  return trainer?.location || gym?.city || gym?.location || "";
};

const getRequestLabel = (type: Booking["request_type"]) => {
  switch (type) {
    case "membership_enquiry":
      return "Membership enquiry";
    case "gym_visit":
      return "Gym visit";
    case "trainer_session":
      return "Trainer session";
    default:
      return "Booking request";
  }
};

const getStatusStyle = (status: Booking["status"]) => {
  switch (status) {
    case "accepted":
      return "border-green-500/20 bg-green-500/10 text-green-400";
    case "rejected":
      return "border-red-500/20 bg-red-500/10 text-red-400";
    case "pending":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
    case "completed":
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";
    case "cancelled":
      return "border-gray-500/20 bg-gray-500/10 text-gray-400";
    default:
      return "border-white/10 bg-white/5 text-gray-400";
  }
};

const formatDate = (value: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-LK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatTime = (value: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-LK", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export default function MyBookingsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmBooking, setConfirmBooking] = useState<Booking | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.href = `/login?redirectTo=${encodeURIComponent(
          "/dashboard/bookings"
        )}`;
        return;
      }

      const { data, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          id,
          request_type,
          preferred_start_at,
          preferred_end_at,
          status,
          message,
          provider_response,
          created_at,
          trainer:trainer_profiles (
            full_name,
            location
          ),
          gym:gym_profiles (
            gym_name,
            location,
            city
          )
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;

      setBookings((data || []) as unknown as Booking[]);
    } catch (err) {
      console.error("My bookings error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your bookings."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const cancelBooking = async () => {
    if (!confirmBooking) return;

    setCancellingId(confirmBooking.id);
    setCancelError("");

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "cancel_booking",
        {
          p_booking_id: confirmBooking.id,
        }
      );

      if (rpcError) throw rpcError;

      if (!data?.success) {
        throw new Error(data?.message || "Unable to cancel this request.");
      }

      setConfirmBooking(null);
      await loadBookings();
    } catch (err) {
      console.error("Booking cancellation error:", err);
      setCancelError(
        err instanceof Error
          ? err.message
          : "Unable to cancel this booking."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((booking) => booking.status === filter);
  }, [bookings, filter]);

  const filterCount = (value: Filter) => {
    if (value === "all") return bookings.length;
    return bookings.filter((booking) => booking.status === value).length;
  };

  return (
    <main className="min-h-screen bg-brand-background text-brand-cream">
      {/* Dashboard header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-brand-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <ClientMobileMenu />

            <div>
              <p className="text-sm font-bold text-brand-cream">
                Client Dashboard
              </p>
              <p className="hidden text-[11px] text-gray-500 sm:block">
                Manage your fitness journey
              </p>
            </div>
          </div>

          <Link
            href="/profile"
            aria-label="My profile"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-brand-card text-gray-400 transition hover:border-brand-lime/40 hover:text-brand-lime"
          >
            <UserRound size={18} />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-7 sm:px-8 sm:py-9">
        {/* Page heading */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-gray-400 transition hover:text-brand-lime"
            >
              <ArrowLeft size={15} />
              Back to dashboard
            </Link>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              My <span className="text-brand-lime">Bookings</span>
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              View and manage all your fitness booking requests.
            </p>
          </div>

          <button
            type="button"
            onClick={loadBookings}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs font-semibold text-brand-cream transition hover:border-brand-lime/40 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Summary cards */}
        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total", value: bookings.length },
            { label: "Pending", value: filterCount("pending") },
            { label: "Accepted", value: filterCount("accepted") },
            { label: "Rejected", value: filterCount("rejected") },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/[0.07] bg-brand-card p-4 transition hover:border-brand-lime/20 sm:p-5"
            >
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="mt-2 text-2xl font-extrabold tabular-nums">
                {item.value}
              </p>
            </div>
          ))}
        </section>

        {/* Filters */}
        <section className="mt-9">
          <div className="mb-4 flex items-center gap-2">
            <Search size={16} className="text-brand-lime" />
            <h2 className="text-sm font-bold">Filter requests</h2>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                  filter === item.value
                    ? "border-brand-lime bg-brand-lime text-brand-background"
                    : "border-white/10 bg-brand-card text-gray-400 hover:border-brand-lime/40 hover:text-brand-cream"
                }`}
              >
                {item.label}
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                    filter === item.value
                      ? "bg-brand-background/10"
                      : "bg-white/[0.06]"
                  }`}
                >
                  {filterCount(item.value)}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Booking list */}
        <section className="mt-6">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-white/[0.07] bg-brand-card">
              <Loader2
                size={28}
                className="animate-spin text-brand-lime"
              />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="mt-0.5 text-red-400"
                />
                <div>
                  <h3 className="text-sm font-bold text-red-300">
                    Unable to load your bookings
                  </h3>
                  <p className="mt-2 break-words text-xs leading-6 text-gray-400">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={loadBookings}
                    className="mt-4 text-xs font-bold text-brand-lime hover:underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-brand-card px-5 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] text-gray-500">
                <CalendarDays size={28} />
              </div>

              <h3 className="mt-5 text-base font-bold">
                {filter === "all"
                  ? "No bookings yet"
                  : `No ${filter} requests`}
              </h3>

              <p className="mt-2 max-w-sm text-xs leading-6 text-gray-500">
                {filter === "all"
                  ? "Your trainer requests and gym enquiries will appear here."
                  : "There are currently no booking requests with this status."}
              </p>

              {filter === "all" && (
                <Link
                  href="/gyms"
                  className="mt-5 rounded-xl bg-brand-lime px-5 py-3 text-xs font-bold text-brand-background transition hover:bg-[#d5ff7b]"
                >
                  Explore gyms
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const isTrainer =
                  booking.request_type === "trainer_session";

                const providerLocation = getProviderLocation(booking);

                return (
                  <article
                    key={booking.id}
                    className="rounded-2xl border border-white/[0.07] bg-brand-card p-5 transition hover:border-brand-lime/20 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                          {isTrainer ? (
                            <Dumbbell size={21} />
                          ) : (
                            <Building2 size={21} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="break-words text-base font-bold">
                            {getProviderName(booking)}
                          </h3>

                          <p className="mt-1 text-xs text-gray-400">
                            {getRequestLabel(booking.request_type)}
                          </p>

                          {providerLocation && (
                            <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                              <MapPin size={13} />
                              {providerLocation}
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`w-fit shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold capitalize ${getStatusStyle(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    {booking.preferred_start_at && (
                      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/[0.07] pt-4">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <CalendarDays
                            size={15}
                            className="text-brand-lime"
                          />
                          {formatDate(booking.preferred_start_at)}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock3
                            size={15}
                            className="text-brand-lime"
                          />
                          {formatTime(booking.preferred_start_at)}
                          {booking.preferred_end_at &&
                            ` – ${formatTime(booking.preferred_end_at)}`}
                        </div>
                      </div>
                    )}

                    {booking.message && (
                      <div className="mt-4 rounded-xl bg-white/[0.03] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          Your message
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-gray-300">
                          {booking.message}
                        </p>
                      </div>
                    )}

                    {booking.provider_response && (
                      <div className="mt-3 rounded-xl border border-brand-lime/10 bg-brand-lime/[0.04] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-lime">
                          Provider response
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-gray-300">
                          {booking.provider_response}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-3">
                      <p className="text-[10px] text-gray-600">
                        Requested {formatDate(booking.created_at)}
                      </p>

                      {booking.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => {
                            setCancelError("");
                            setConfirmBooking(booking);
                          }}
                          className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                        >
                          Cancel request
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Cancellation confirmation dialog */}
      {confirmBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#222723] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  <AlertCircle size={22} />
                </div>

                <h2 className="mt-4 text-lg font-bold">
                  Cancel this request?
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!cancellingId) {
                    setConfirmBooking(null);
                    setCancelError("");
                  }
                }}
                disabled={!!cancellingId}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Are you sure you want to cancel your request with{" "}
              <span className="font-semibold text-brand-cream">
                {getProviderName(confirmBooking)}
              </span>
              ? This action cannot be undone.
            </p>

            {cancelError && (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs leading-5 text-red-300">
                {cancelError}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={!!cancellingId}
                onClick={() => {
                  setConfirmBooking(null);
                  setCancelError("");
                }}
                className="rounded-xl border border-white/10 px-4 py-3 text-xs font-semibold text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                Keep request
              </button>

              <button
                type="button"
                disabled={!!cancellingId}
                onClick={cancelBooking}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-xs font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancellingId ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, cancel request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
