
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Dumbbell,
  CalendarDays,
  UserRound,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  Bell,
  XCircle,
  Plus,
  MapPin,
  Loader2,
  AlertCircle,
  Building2,
  RefreshCw,
} from "lucide-react";

import ClientMobileMenu from "@/components/dashboard/ClientMobileMenu";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/auth/LogoutButton";
import NotificationBell from "@/components/notifications/NotificationBell";

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

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard, active: true },
  { name: "Find Trainers", href: "/trainers", icon: Dumbbell },
  { name: "Explore Gyms", href: "/gyms", icon: Search },
  { name: "My Bookings", href: "/dashboard/bookings", icon: CalendarDays },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "My Profile", href: "/profile", icon: UserRound },
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

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          `/login?redirectTo=${encodeURIComponent("/dashboard")}`
        );
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("display_name, role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role !== "client") {
        router.replace(
          profile.role === "trainer"
            ? "/trainers/dashboard"
            : profile.role === "gym_owner"
              ? "/gym/dashboard"
              : "/admin/dashboard"
        );
        return;
      }

      setDisplayName(profile.display_name || "");

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
      console.error("Client dashboard error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(
    () => [
      {
        label: "Total Bookings",
        value: bookings.length,
        description: "All your booking requests",
        icon: CalendarDays,
      },
      {
        label: "Pending Requests",
        value: bookings.filter((booking) => booking.status === "pending").length,
        description: "Waiting for a response",
        icon: Clock3,
      },
      {
        label: "Accepted",
        value: bookings.filter((booking) => booking.status === "accepted").length,
        description: "Accepted requests",
        icon: CheckCircle2,
      },
      {
        label: "Rejected",
        value: bookings.filter((booking) => booking.status === "rejected").length,
        description: "Declined requests",
        icon: XCircle,
      },
    ],
    [bookings]
  );

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="min-h-screen bg-brand-background text-brand-cream">
      {/* Sidebar */}
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
                Client Dashboard
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
              Ready to get started?
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Find the right trainer or gym for your goals.
            </p>

            <Link
              href="/trainers"
              className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-brand-lime hover:underline"
            >
              Explore trainers <ArrowUpRight size={14} />
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
              <ClientMobileMenu />

              <div>
                <p className="text-xs text-gray-500">
                  Your fitness journey
                </p>
                <p className="text-sm font-semibold text-brand-cream">
                  Client Dashboard
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

        {/* Dashboard content */}
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          {/* Welcome section */}
          <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#222923] p-7 sm:p-10">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-lime/20 bg-brand-lime/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-lime">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-lime" />
                Your fitness starts here
              </span>

              <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">
                Welcome{displayName ? `, ${displayName}` : " to your"}
                <span className="block text-brand-lime">
                  fitness journey.
                </span>
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-7 text-gray-400">
                Find trusted personal trainers, explore gyms, and manage your
                fitness booking requests — all in one place.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/trainers"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-lime px-5 py-3 text-sm font-bold text-brand-background transition hover:bg-[#d5ff7b]"
                >
                  Find a Trainer <ArrowUpRight size={17} />
                </Link>

                <Link
                  href="/gyms"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-brand-cream transition hover:border-brand-lime hover:text-brand-lime"
                >
                  Explore Gyms
                </Link>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full bg-brand-lime/[0.07] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 right-20 h-64 w-64 rounded-full bg-brand-lime/[0.05] blur-3xl" />
          </section>

          {/* Statistics */}
          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-lg font-bold">Your activity</h2>
              <p className="mt-1 text-sm text-gray-500">
                A quick overview of your fitness bookings.
              </p>
            </div>

            {loading ? (
              <div className="flex min-h-36 items-center justify-center rounded-2xl border border-white/[0.07] bg-brand-card">
                <Loader2 className="animate-spin text-brand-lime" size={25} />
              </div>
            ) : (
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
            )}
          </section>

          {/* Bookings and quick actions */}
          <section className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Recent bookings */}
            <div
              id="recent-bookings"
              className="scroll-mt-24 rounded-2xl border border-white/[0.07] bg-brand-card p-6 xl:col-span-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Recent bookings</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Keep track of your latest requests.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void loadDashboard()}
                  disabled={loading}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-brand-lime transition hover:text-brand-cream disabled:opacity-50"
                >
                  <RefreshCw
                    size={14}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>

              {error ? (
                <div className="mt-7 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      size={19}
                      className="mt-0.5 shrink-0 text-red-400"
                    />

                    <div>
                      <p className="text-sm font-semibold text-red-300">
                        Unable to load your bookings
                      </p>

                      <p className="mt-2 break-words text-xs leading-5 text-gray-400">
                        {error}
                      </p>

                      <button
                        type="button"
                        onClick={() => void loadDashboard()}
                        className="mt-4 text-xs font-bold text-brand-lime hover:underline"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex min-h-48 items-center justify-center">
                  <Loader2
                    size={25}
                    className="animate-spin text-brand-lime"
                  />
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-5 py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-gray-500">
                    <CalendarDays size={25} />
                  </div>

                  <h3 className="mt-5 text-sm font-bold">
                    No bookings yet
                  </h3>

                  <p className="mt-2 max-w-sm text-xs leading-6 text-gray-500">
                    Your trainer booking requests and gym enquiries will appear
                    here once you get started.
                  </p>

                  <Link
                    href="/trainers"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-lime px-4 py-2.5 text-xs font-bold text-brand-background transition hover:bg-[#d5ff7b]"
                  >
                    Find your first trainer <Plus size={15} />
                  </Link>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {recentBookings.map((booking) => {
                    const providerName = getProviderName(booking);
                    const providerLocation = getProviderLocation(booking);
                    const isTrainer =
                      booking.request_type === "trainer_session";

                    return (
                      <div
                        key={booking.id}
                        className="rounded-xl border border-white/[0.07] bg-[#171A18]/60 p-4 transition hover:border-brand-lime/20 sm:p-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                              {isTrainer ? (
                                <Dumbbell size={20} />
                              ) : (
                                <Building2 size={20} />
                              )}
                            </div>

                            <div className="min-w-0">
                              <h3 className="break-words text-sm font-bold text-brand-cream">
                                {providerName}
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
                            className={`inline-flex w-fit shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold capitalize ${getStatusStyle(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        {booking.preferred_start_at && (
                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.07] pt-4 text-xs text-gray-400">
                            <span className="flex items-center gap-2">
                              <CalendarDays
                                size={14}
                                className="text-brand-lime"
                              />
                              {formatDate(booking.preferred_start_at)}
                            </span>

                            <span className="flex items-center gap-2">
                              <Clock3
                                size={14}
                                className="text-brand-lime"
                              />
                              {formatTime(booking.preferred_start_at)}
                              {booking.preferred_end_at &&
                                ` – ${formatTime(booking.preferred_end_at)}`}
                            </span>
                          </div>
                        )}

                        {booking.provider_response && (
                          <div className="mt-4 rounded-lg border border-brand-lime/10 bg-brand-lime/[0.04] p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-lime">
                              Provider response
                            </p>

                            <p className="mt-1 break-words text-xs leading-5 text-gray-300">
                              {booking.provider_response}
                            </p>
                          </div>
                        )}

                        <p className="mt-3 text-right text-[10px] text-gray-600">
                          Requested {formatDate(booking.created_at)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && !error && bookings.length > 5 && (
                <p className="mt-5 text-center text-xs text-gray-500">
                  Showing your 5 most recent requests out of {bookings.length}.
                </p>
              )}
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-white/[0.07] bg-brand-card p-6">
              <h2 className="text-lg font-bold">Quick actions</h2>
              <p className="mt-1 text-xs text-gray-500">
                What would you like to do today?
              </p>

              <div className="mt-6 space-y-3">
                <Link
                  href="/trainers"
                  className="group flex items-center gap-4 rounded-xl border border-white/[0.07] p-4 transition hover:border-brand-lime/40 hover:bg-white/[0.02]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                    <Dumbbell size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Find Trainers</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Connect with professionals
                    </p>
                  </div>

                  <ArrowUpRight
                    size={16}
                    className="text-gray-500 transition group-hover:text-brand-lime"
                  />
                </Link>

                <Link
                  href="/gyms"
                  className="group flex items-center gap-4 rounded-xl border border-white/[0.07] p-4 transition hover:border-brand-lime/40 hover:bg-white/[0.02]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                    <MapPin size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Explore Gyms</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Discover gyms near you
                    </p>
                  </div>

                  <ArrowUpRight
                    size={16}
                    className="text-gray-500 transition group-hover:text-brand-lime"
                  />
                </Link>

                <Link
                  href="/profile"
                  className="group flex items-center gap-4 rounded-xl border border-white/[0.07] p-4 transition hover:border-brand-lime/40 hover:bg-white/[0.02]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                    <UserRound size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">My Profile</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Manage your account details
                    </p>
                  </div>

                  <ArrowUpRight
                    size={16}
                    className="text-gray-500 transition group-hover:text-brand-lime"
                  />
                </Link>
              </div>
            </div>
          </section>

          {/* Bottom note */}
          <div className="mt-8 flex flex-col gap-2 rounded-2xl border border-brand-lime/10 bg-brand-lime/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                Small steps. Big progress.
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Your next fitness opportunity is just around the corner.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-lime hover:underline"
            >
              Back to FitX Lanka <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
