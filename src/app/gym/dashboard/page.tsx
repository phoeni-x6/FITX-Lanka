
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import GymDashboardSidebar from "@/components/gym-dashboard/GymDashboardSidebar";
import GymDashboardHeader from "@/components/gym-dashboard/GymDashboardHeader";
import GymWelcome from "@/components/gym-dashboard/GymWelcome";
import GymStats from "@/components/gym-dashboard/GymStats";
import GymBookingRequests from "@/components/gym-dashboard/GymBookingRequests";
import GymQuickActions from "@/components/gym-dashboard/GymQuickActions";

type Gym = {
  id: string;
  gym_name: string;
  city: string | null;
  location: string | null;
  monthly_price: number | null;
  is_approved: boolean;
};

type Booking = {
  id: string;
  client_id: string;
  request_type: string;
  preferred_start_at: string | null;
  preferred_end_at: string | null;
  message: string | null;
  status: string;
  provider_response: string | null;
  created_at: string;
};

export default function GymDashboardPage() {
  const supabase = useMemo(() => createClient(), []);

  const [gym, setGym] = useState<Gym | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [ownerName, setOwnerName] = useState("there");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please log in to access your gym dashboard.");
      }

      setOwnerName(
        user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "there"
      );

      // Find the approved gym owned by the logged-in user.
      const { data: gymData, error: gymError } = await supabase
        .from("gym_profiles")
        .select(
          "id, gym_name, city, location, monthly_price, is_approved"
        )
        .eq("owner_id", user.id)
        .eq("is_approved", true)
        .maybeSingle();

      if (gymError) throw gymError;

      if (!gymData) {
        setGym(null);
        setBookings([]);
        return;
      }

      setGym(gymData);

      // Load booking requests for this gym.
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select(
          "id, client_id, request_type, preferred_start_at, preferred_end_at, message, status, provider_response, created_at"
        )
        .eq("gym_id", gymData.id)
        .order("created_at", { ascending: false });

      if (bookingError) throw bookingError;

      setBookings(bookingData || []);
    } catch (err) {
      console.error("Gym dashboard error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDashboard]);

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const acceptedBookings = bookings.filter(
    (booking) => booking.status === "accepted"
  ).length;

  const rejectedBookings = bookings.filter(
    (booking) => booking.status === "rejected"
  ).length;

  return (
    <div className="min-h-screen bg-brand-background text-brand-cream">
      {/* Sidebar */}
      <GymDashboardSidebar
        gymId={gym?.id ?? null}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content */}
      <main className="min-h-screen lg:pl-64">
        {/* Header */}
        <GymDashboardHeader
          gymName={gym?.gym_name ?? "Gym Owner Dashboard"}
          ownerName={ownerName}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <div
          id="overview"
          className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10"
        >
          {/* Loading state */}
          {loading ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
              <Loader2
                size={35}
                className="animate-spin text-brand-lime"
              />

              <p className="mt-4 text-sm text-gray-400">
                Loading your gym dashboard...
              </p>
            </div>
          ) : error ? (
            /* Error state */
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
              <h2 className="font-bold text-red-400">
                Unable to load dashboard
              </h2>

              <p className="mt-2 text-sm text-gray-400">{error}</p>

              <button
                onClick={loadDashboard}
                className="mt-5 rounded-xl bg-brand-lime px-5 py-2.5 text-sm font-bold text-brand-background transition hover:bg-[#d5ff7b]"
              >
                Try again
              </button>
            </div>
          ) : !gym ? (
            /* No approved gym */
            <section className="rounded-3xl border border-white/[0.08] bg-brand-card p-8 text-center sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-lime/10 text-brand-lime">
                <Building2 size={30} />
              </div>

              <h1 className="mt-6 text-2xl font-extrabold">
                Your gym profile isn't available yet
              </h1>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-gray-400">
                We couldn't find an approved gym profile connected to your
                account. If you've submitted an application, you can check
                its review status below.
              </p>

              <Link
                href="/gyms/application-status"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand-lime px-5 py-3 text-sm font-bold text-brand-background transition hover:bg-[#d5ff7b]"
              >
                Check application status
                <ArrowUpRight size={16} />
              </Link>
            </section>
          ) : (
            <>
              {/* Refresh dashboard */}
              <div className="mb-6 flex justify-end">
                <button
                  onClick={loadDashboard}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-400 transition hover:border-brand-lime hover:text-brand-lime disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>

              {/* Welcome */}
              <GymWelcome
                ownerName={ownerName}
                gymName={gym.gym_name}
              />

              {/* Statistics */}
              <section className="mt-10">
                <div className="mb-5">
                  <h2 className="text-lg font-bold">
                    Your gym activity
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    An overview of your booking requests.
                  </p>
                </div>

                <GymStats
                  totalBookings={totalBookings}
                  pendingBookings={pendingBookings}
                  acceptedBookings={acceptedBookings}
                  rejectedBookings={rejectedBookings}
                />
              </section>

              {/* Booking requests */}
              <section id="bookings" className="mt-10 scroll-mt-24">
                <GymBookingRequests
                  bookings={bookings}
                  onUpdated={loadDashboard}
                />
              </section>

              {/* Quick actions */}
              <section id="quick-actions" className="mt-10">
                <GymQuickActions gymId={gym.id} />
              </section>

              {/* Bottom note */}
              <div className="mt-8 flex flex-col gap-2 rounded-2xl border border-brand-lime/10 bg-brand-lime/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    Building stronger communities.
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Your gym is part of the FitX Lanka fitness community.
                  </p>
                </div>

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-xs font-bold text-brand-lime hover:underline"
                >
                  Back to FitX Lanka
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
