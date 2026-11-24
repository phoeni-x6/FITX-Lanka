
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  UserRound,
  Dumbbell,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  XCircle,
  MapPin,
  Loader2,
  AlertCircle,
  RefreshCw,
  Phone,
  MessageSquare,
  Search,
} from "lucide-react";

import TrainerMobileMenu from "@/components/dashboard/TrainerMobileMenu";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/auth/LogoutButton";
import NotificationBell from "@/components/notifications/NotificationBell";

type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

type Booking = {
  id: string;
  client_id: string;
  request_type: string;
  preferred_start_at: string | null;
  preferred_end_at: string | null;
  message: string | null;
  status: BookingStatus;
  provider_response: string | null;
  created_at: string;
  client_display_name: string;
  client_phone: string | null;
  client_avatar_url: string | null;
};

type Filter = "all" | BookingStatus;

type TrainerProfile = {
  id: string;
  full_name: string;
  is_approved: boolean;
};

const filters: { label: string; value: Filter }[] = [
  { label: "All requests", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" },
];

const navigation = [
  {
    name: "Overview",
    href: "/trainers/dashboard",
    icon: LayoutDashboard,
    active: false,
  },
  {
    name: "Booking Requests",
    href: "/trainers/dashboard/bookings",
    icon: CalendarDays,
    active: true,
  },
  {
    name: "My Profile",
    href: "/profile",
    icon: UserRound,
    active: false,
  },
];

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

const getStatusStyle = (status: BookingStatus) => {
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

export default function TrainerBookingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [respondingBookingId, setRespondingBookingId] = useState<
    string | null
  >(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace(
          `/login?redirectTo=${encodeURIComponent(
            "/trainers/dashboard/bookings"
          )}`
        );
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role !== "trainer") {
        router.replace(
          profile.role === "client"
            ? "/dashboard"
            : profile.role === "gym_owner"
              ? "/gym/dashboard"
              : "/admin/dashboard"
        );
        return;
      }

      const { data: trainerData, error: trainerError } = await supabase
        .from("trainer_profiles")
        .select("id, full_name, is_approved")
        .eq("user_id", user.id)
        .maybeSingle();

      if (trainerError) throw trainerError;

      if (!trainerData) {
        setTrainer(null);
        setBookings([]);
        return;
      }

      setTrainer(trainerData as TrainerProfile);

      if (!trainerData.is_approved) {
        setBookings([]);
        return;
      }

      const { data: bookingData, error: bookingError } = await supabase.rpc(
        "get_trainer_dashboard_bookings"
      );

      if (bookingError) throw bookingError;

      setBookings((bookingData || []) as Booking[]);
    } catch (err) {
      console.error("Trainer bookings error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your booking requests."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const respondToBooking = async (
    booking: Booking,
    status: "accepted" | "rejected"
  ) => {
    if (respondingBookingId) return;

    const action = status === "accepted" ? "accept" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this booking request?`
    );

    if (!confirmed) return;

    setRespondingBookingId(booking.id);
    setActionError("");

    try {
      const { data, error: responseError } = await supabase.rpc(
        "respond_to_booking",
        {
          p_booking_id: booking.id,
          p_status: status,
          p_provider_response: null,
        }
      );

      if (responseError) throw responseError;

      const result = data as
        | { success?: boolean; message?: string }
        | null;

      if (result?.success === false) {
        throw new Error(
          result.message || "Unable to process this booking request."
        );
      }

      await loadBookings();
    } catch (err) {
      console.error("Booking response error:", err);

      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to process this booking request."
      );
    } finally {
      setRespondingBookingId(null);
    }
  };

  const filteredBookings = useMemo(() => {
    if (filter === "all") return bookings;

    return bookings.filter((booking) => booking.status === filter);
  }, [bookings, filter]);

  const getFilterCount = (value: Filter) => {
    if (value === "all") return bookings.length;

    return bookings.filter((booking) => booking.status === value).length;
  };

  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-brand-background text-brand-cream">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.07] bg-[#1C201D] lg:flex">
        <div className="flex h-20 items-center border-b border-white/[0.07] px-7">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime text-brand-background">
              <Dumbbell size={22} strokeWidth={2.5} />
            </div>

            <div>
              <h1 className="text-lg font-extrabold">
                FitX <span className="text-brand-lime">Lanka</span>
              </h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500">
                Trainer Dashboard
              </p>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-8">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    item.active
                      ? "bg-brand-lime text-brand-background"
                      : "text-gray-400 hover:bg-white/[0.05] hover:text-brand-cream"
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/[0.07] p-5">
          <div className="mb-4 rounded-xl bg-white/[0.04] p-4">
            <p className="text-xs font-semibold text-brand-cream">
              Grow your coaching business
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Manage requests and connect with clients through FitX Lanka.
            </p>

            <Link
              href="/profile"
              className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-brand-lime hover:underline"
            >
              View your profile <ArrowUpRight size={14} />
            </Link>
          </div>

          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-brand-background/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <TrainerMobileMenu />

              <div>
                <p className="text-xs text-gray-500">
                  Manage your coaching business
                </p>
                <p className="text-sm font-semibold text-brand-cream">
                  Booking Requests
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />

              <Link
                href="/profile"
                aria-label="My profile"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime"
              >
                <UserRound size={19} />
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          {loading ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 size={30} className="animate-spin text-brand-lime" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-400"
                />

                <div>
                  <h2 className="font-bold text-red-300">
                    Unable to load booking requests
                  </h2>

                  <p className="mt-2 break-words text-sm text-gray-400">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => void loadBookings()}
                    className="mt-4 text-sm font-bold text-brand-lime hover:underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          ) : !trainer ? (
            <div className="rounded-3xl border border-white/[0.08] bg-brand-card p-8 text-center sm:p-12">
              <Dumbbell
                size={35}
                className="mx-auto text-brand-lime"
              />

              <h1 className="mt-5 text-2xl font-extrabold">
                Trainer profile not found
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400">
                We couldn't find a trainer profile connected to your account.
                Please contact the FitX Lanka team for assistance.
              </p>

              <Link
                href="/profile"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-lime px-5 py-3 text-sm font-bold text-brand-background"
              >
                View My Profile <ArrowUpRight size={16} />
              </Link>
            </div>
          ) : !trainer.is_approved ? (
            <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/[0.04] p-8 text-center sm:p-12">
              <Clock3 size={35} className="mx-auto text-yellow-400" />

              <h1 className="mt-5 text-2xl font-extrabold">
                Your application is awaiting approval
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400">
                Once the FitX Lanka team approves your trainer profile, you
                can start receiving and managing booking requests here.
              </p>

              <span className="mt-6 inline-flex rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-xs font-bold text-yellow-400">
                Approval pending
              </span>
            </div>
          ) : (
            <>
              {/* Page heading */}
              <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <Link
                    href="/trainers/dashboard"
                    className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-gray-400 transition hover:text-brand-lime"
                  >
                    <ArrowUpRight
                      size={14}
                      className="rotate-[-135deg]"
                    />
                    Back to overview
                  </Link>

                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">
                    Trainer workspace
                  </p>

                  <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                    Booking <span className="text-brand-lime">Requests</span>
                  </h1>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
                    Review requests from clients, check their preferred
                    schedules and manage your bookings.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void loadBookings()}
                  disabled={loading || !!respondingBookingId}
                  className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs font-semibold text-brand-cream transition hover:border-brand-lime/40 disabled:opacity-50"
                >
                  <RefreshCw size={15} />
                  Refresh requests
                </button>
              </section>

              {/* Summary */}
              <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {
                    label: "Total requests",
                    value: bookings.length,
                  },
                  {
                    label: "Pending",
                    value: getFilterCount("pending"),
                  },
                  {
                    label: "Accepted",
                    value: getFilterCount("accepted"),
                  },
                  {
                    label: "Completed",
                    value: getFilterCount("completed"),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/[0.07] bg-brand-card p-5"
                  >
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="mt-2 text-2xl font-extrabold tabular-nums">
                      {item.value}
                    </p>
                  </div>
                ))}
              </section>

              {/* Pending notice */}
              {pendingCount > 0 && (
                <div className="mt-6 flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.05] px-4 py-4">
                  <Clock3
                    size={19}
                    className="shrink-0 text-yellow-400"
                  />

                  <p className="text-xs leading-5 text-gray-300">
                    You have{" "}
                    <span className="font-bold text-yellow-400">
                      {pendingCount} pending{" "}
                      {pendingCount === 1 ? "request" : "requests"}
                    </span>{" "}
                    waiting for your response.
                  </p>
                </div>
              )}

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
                        {getFilterCount(item.value)}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Action error */}
              {actionError && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-red-400"
                  />

                  <p className="break-words text-xs leading-5 text-red-300">
                    {actionError}
                  </p>
                </div>
              )}

              {/* Booking list */}
              <section className="mt-6">
                {filteredBookings.length === 0 ? (
                  <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-brand-card px-5 py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] text-gray-500">
                      <CalendarDays size={28} />
                    </div>

                    <h3 className="mt-5 text-base font-bold">
                      {filter === "all"
                        ? "No booking requests yet"
                        : `No ${filter} requests`}
                    </h3>

                    <p className="mt-2 max-w-sm text-xs leading-6 text-gray-500">
                      {filter === "all"
                        ? "When clients request sessions with you, their booking requests will appear here."
                        : `You currently have no ${filter} booking requests.`}
                    </p>

                    {filter !== "all" && (
                      <button
                        type="button"
                        onClick={() => setFilter("all")}
                        className="mt-5 text-xs font-bold text-brand-lime hover:underline"
                      >
                        View all requests
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => {
                      const isPending = booking.status === "pending";
                      const isResponding =
                        respondingBookingId === booking.id;

                      return (
                        <article
                          key={booking.id}
                          className="rounded-2xl border border-white/[0.07] bg-brand-card p-5 transition hover:border-brand-lime/20 sm:p-6"
                        >
                          {/* Client information */}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                              {booking.client_avatar_url ? (
                                <img
                                  src={booking.client_avatar_url}
                                  alt=""
                                  className="h-12 w-12 shrink-0 rounded-xl border border-white/10 object-cover"
                                />
                              ) : (
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                                  <UserRound size={21} />
                                </div>
                              )}

                              <div className="min-w-0">
                                <h3 className="break-words text-base font-bold">
                                  {booking.client_display_name ||
                                    "FitX Client"}
                                </h3>

                                <p className="mt-1 text-xs text-gray-400">
                                  Trainer session request
                                </p>

                                {booking.client_phone && (
                                  <a
                                    href={`tel:${booking.client_phone}`}
                                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500 transition hover:text-brand-lime"
                                  >
                                    <Phone size={13} />
                                    {booking.client_phone}
                                  </a>
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

                          {/* Preferred date and time */}
                          {(booking.preferred_start_at ||
                            booking.preferred_end_at) && (
                            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/[0.07] pt-4">
                              {booking.preferred_start_at && (
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <CalendarDays
                                    size={15}
                                    className="text-brand-lime"
                                  />
                                  {formatDate(
                                    booking.preferred_start_at
                                  )}
                                </div>
                              )}

                              {booking.preferred_start_at && (
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <Clock3
                                    size={15}
                                    className="text-brand-lime"
                                  />
                                  {formatTime(
                                    booking.preferred_start_at
                                  )}

                                  {booking.preferred_end_at &&
                                    ` – ${formatTime(
                                      booking.preferred_end_at
                                    )}`}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Client message */}
                          {booking.message && (
                            <div className="mt-4 rounded-xl bg-white/[0.03] p-4">
                              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                <MessageSquare
                                  size={13}
                                  className="text-brand-lime"
                                />
                                Client message
                              </p>

                              <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-6 text-gray-300">
                                {booking.message}
                              </p>
                            </div>
                          )}

                          {/* Provider response */}
                          {booking.provider_response && (
                            <div className="mt-3 rounded-xl border border-brand-lime/10 bg-brand-lime/[0.04] p-4">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-lime">
                                Your response
                              </p>

                              <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-6 text-gray-300">
                                {booking.provider_response}
                              </p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="mt-5 flex flex-col gap-3 border-t border-white/[0.07] pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[10px] text-gray-600">
                              Requested {formatDate(booking.created_at)}
                            </p>

                            {isPending && (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void respondToBooking(
                                      booking,
                                      "rejected"
                                    )
                                  }
                                  disabled={!!respondingBookingId}
                                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/20 px-4 py-2.5 text-xs font-bold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isResponding ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <XCircle size={14} />
                                  )}
                                  Reject
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void respondToBooking(
                                      booking,
                                      "accepted"
                                    )
                                  }
                                  disabled={!!respondingBookingId}
                                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-lime px-4 py-2.5 text-xs font-bold text-brand-background transition hover:bg-[#d5ff7b] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isResponding ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <CheckCircle2 size={14} />
                                  )}
                                  Accept Request
                                </button>
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
