
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
  BriefcaseBusiness,
  Award,
  Wallet,
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

type TrainerProfile = {
  id: string;
  full_name: string;
  specialty: string;
  bio: string | null;
  location: string;
  experience_years: number;
  price_per_session: number | null;
  profile_image_url: string | null;
  is_approved: boolean;
};

const navigation = [
  {
    name: "Overview",
    href: "/trainers/dashboard",
    icon: LayoutDashboard,
    active: true,
  },
  {
    name: "Booking Requests",
    href: "/trainers/dashboard/bookings",
    icon: CalendarDays,
  },
  {
    name: "My Profile",
    href: "/profile",
    icon: UserRound,
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

export default function TrainerDashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [respondingBookingId, setRespondingBookingId] = useState<string | null>(
    null
  );

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace(
          `/login?redirectTo=${encodeURIComponent("/trainers/dashboard")}`
        );
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("display_name, role")
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

      setDisplayName(profile.display_name || "");

      const { data: trainerData, error: trainerError } = await supabase
        .from("trainer_profiles")
        .select(
          "id, full_name, specialty, bio, location, experience_years, price_per_session, profile_image_url, is_approved"
        )
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
      console.error("Trainer dashboard error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your trainer dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

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
      const { error: responseError } = await supabase.rpc(
        "respond_to_booking",
        {
          p_booking_id: booking.id,
          p_status: status,
          p_provider_response: null,
        }
      );

      if (responseError) throw responseError;

      await loadDashboard();
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

  const stats = useMemo(
    () => [
      {
        label: "Total Bookings",
        value: bookings.length,
        description: "All booking requests",
        icon: CalendarDays,
      },
      {
        label: "Pending Requests",
        value: bookings.filter((booking) => booking.status === "pending")
          .length,
        description: "Waiting for your response",
        icon: Clock3,
      },
      {
        label: "Accepted",
        value: bookings.filter((booking) => booking.status === "accepted")
          .length,
        description: "Accepted bookings",
        icon: CheckCircle2,
      },
      {
        label: "Completed",
        value: bookings.filter((booking) => booking.status === "completed")
          .length,
        description: "Completed bookings",
        icon: Award,
      },
    ],
    [bookings]
  );

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  );

  const recentBookings = bookings.slice(0, 5);

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
                  Trainer Dashboard
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
                <AlertCircle className="mt-0.5 shrink-0 text-red-400" />

                <div>
                  <h2 className="font-bold text-red-300">
                    Unable to load your dashboard
                  </h2>
                  <p className="mt-2 break-words text-sm text-gray-400">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => void loadDashboard()}
                    className="mt-4 text-sm font-bold text-brand-lime hover:underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          ) : !trainer ? (
            <div className="rounded-3xl border border-white/[0.08] bg-brand-card p-8 text-center sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-lime/10 text-brand-lime">
                <Dumbbell size={28} />
              </div>

              <h1 className="mt-6 text-2xl font-extrabold">
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
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-400">
                <Clock3 size={28} />
              </div>

              <h1 className="mt-6 text-2xl font-extrabold">
                Your application is awaiting approval
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400">
                Your trainer profile is not approved yet. Once the FitX Lanka
                team approves it, you can start receiving and managing booking
                requests here.
              </p>

              <span className="mt-6 inline-flex rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-xs font-bold text-yellow-400">
                Approval pending
              </span>
            </div>
          ) : (
            <>
              {/* Welcome section */}
              <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#222923] p-7 sm:p-10">
                <div className="relative z-10 max-w-2xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-brand-lime/20 bg-brand-lime/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-lime">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-lime" />
                    Approved Trainer
                  </span>

                  <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">
                    Welcome{trainer.full_name ? `, ${trainer.full_name}` : ""}
                    <span className="block text-brand-lime">
                      Let's get to work.
                    </span>
                  </h1>

                  <p className="mt-4 max-w-lg text-sm leading-7 text-gray-400">
                    Manage your booking requests, connect with clients and
                    keep your coaching schedule organised — all in one place.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <a
                      href="#booking-requests"
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-lime px-5 py-3 text-sm font-bold text-brand-background transition hover:bg-[#d5ff7b]"
                    >
                      View Requests <ArrowUpRight size={17} />
                    </a>

                    <Link
                      href="/profile"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-brand-cream transition hover:border-brand-lime hover:text-brand-lime"
                    >
                      My Profile
                    </Link>
                  </div>
                </div>

                <div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full bg-brand-lime/[0.07] blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 right-20 h-64 w-64 rounded-full bg-brand-lime/[0.05] blur-3xl" />
              </section>

              {/* Trainer profile summary */}
              <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-brand-card p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                    <Dumbbell size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Specialty</p>
                    <p className="mt-1 truncate text-sm font-semibold">
                      {trainer.specialty}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-brand-card p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                    <MapPin size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="mt-1 truncate text-sm font-semibold">
                      {trainer.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-brand-card p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                    <BriefcaseBusiness size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="mt-1 text-sm font-semibold">
                      {trainer.experience_years}{" "}
                      {trainer.experience_years === 1 ? "year" : "years"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-brand-card p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                    <Wallet size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Session Price</p>
                    <p className="mt-1 text-sm font-semibold">
                      {trainer.price_per_session !== null
                        ? `LKR ${Number(
                            trainer.price_per_session
                          ).toLocaleString("en-LK")}`
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Statistics */}
              <section className="mt-10">
                <div className="mb-5">
                  <h2 className="text-lg font-bold">Booking overview</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Track your client requests and coaching activity.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-white/[0.07] bg-brand-card p-5 transition hover:border-brand-lime/30"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                            <Icon size={19} />
                          </div>

                          <span className="text-2xl font-extrabold tabular-nums">
                            {stat.value}
                          </span>
                        </div>

                        <h3 className="mt-5 text-sm font-semibold">
                          {stat.label}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          {stat.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Booking requests */}
              <section
                id="booking-requests"
                className="mt-10 scroll-mt-24 rounded-2xl border border-white/[0.07] bg-brand-card p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">Booking requests</h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Review and manage requests from your clients.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void loadDashboard()}
                    disabled={loading || !!respondingBookingId}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-brand-lime transition hover:text-brand-cream disabled:opacity-50"
                  >
                    <RefreshCw size={14} />
                    Refresh
                  </button>
                </div>

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

                {pendingBookings.length > 0 && (
                  <div className="mt-6 flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.05] px-4 py-3">
                    <Clock3 size={16} className="text-yellow-400" />
                    <p className="text-xs text-gray-300">
                      You have{" "}
                      <span className="font-bold text-yellow-400">
                        {pendingBookings.length} pending{" "}
                        {pendingBookings.length === 1
                          ? "request"
                          : "requests"}
                      </span>{" "}
                      waiting for your response.
                    </p>
                  </div>
                )}

                {recentBookings.length === 0 ? (
                  <div className="mt-7 flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-5 py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-gray-500">
                      <CalendarDays size={25} />
                    </div>

                    <h3 className="mt-5 text-sm font-bold">
                      No booking requests yet
                    </h3>

                    <p className="mt-2 max-w-sm text-xs leading-6 text-gray-500">
                      When clients send you trainer session requests, they will
                      appear here.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {recentBookings.map((booking) => {
                      const isPending = booking.status === "pending";
                      const isResponding =
                        respondingBookingId === booking.id;

                      return (
                        <article
                          key={booking.id}
                          className="rounded-xl border border-white/[0.07] bg-[#171A18]/60 p-4 transition hover:border-brand-lime/20 sm:p-5"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
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
                                <h3 className="break-words text-sm font-bold text-brand-cream">
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
                              className={`inline-flex w-fit shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold capitalize ${getStatusStyle(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </div>

                          {(booking.preferred_start_at ||
                            booking.preferred_end_at) && (
                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.07] pt-4 text-xs text-gray-400">
                              {booking.preferred_start_at && (
                                <span className="flex items-center gap-2">
                                  <CalendarDays
                                    size={14}
                                    className="text-brand-lime"
                                  />
                                  {formatDate(booking.preferred_start_at)}
                                </span>
                              )}

                              {booking.preferred_start_at && (
                                <span className="flex items-center gap-2">
                                  <Clock3
                                    size={14}
                                    className="text-brand-lime"
                                  />
                                  {formatTime(booking.preferred_start_at)}
                                  {booking.preferred_end_at &&
                                    ` – ${formatTime(
                                      booking.preferred_end_at
                                    )}`}
                                </span>
                              )}
                            </div>
                          )}

                          {booking.message && (
                            <div className="mt-4 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
                              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
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

                          {booking.provider_response && (
                            <div className="mt-4 rounded-lg border border-brand-lime/10 bg-brand-lime/[0.04] p-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-lime">
                                Your response
                              </p>

                              <p className="mt-1 break-words text-xs leading-5 text-gray-300">
                                {booking.provider_response}
                              </p>
                            </div>
                          )}

                          <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.07] pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[10px] text-gray-600">
                              Requested {formatDate(booking.created_at)}
                            </p>

                            {isPending && (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void respondToBooking(booking, "rejected")
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
                                    void respondToBooking(booking, "accepted")
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

                {bookings.length > 5 && (
                  <p className="mt-5 text-center text-xs text-gray-500">
                    Showing the 5 most recent requests out of {bookings.length}.
                  </p>
                )}
              </section>

              {/* Bottom section */}
              <section className="mt-8 flex flex-col gap-3 rounded-2xl border border-brand-lime/10 bg-brand-lime/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    Your coaching journey starts here.
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Keep your profile updated and respond to client requests.
                  </p>
                </div>

                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 text-xs font-bold text-brand-lime hover:underline"
                >
                  Manage Profile <ArrowUpRight size={14} />
                </Link>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
