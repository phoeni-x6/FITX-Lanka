
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  Clock,
  Inbox,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import GymDashboardSidebar from "@/components/gym-dashboard/GymDashboardSidebar";
import GymDashboardHeader from "@/components/gym-dashboard/GymDashboardHeader";

type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  related_booking_id: string | null;
  is_read: boolean;
  created_at: string;
};

type FilterType = "all" | "unread";

export default function GymNotificationsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [ownerName, setOwnerName] = useState("there");
  const [gymName, setGymName] = useState("Gym Owner Dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((notification) => !notification.is_read)
      : notifications;

  const loadNotifications = useCallback(async () => {
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please log in to view your notifications.");
      }

      setOwnerName(
        user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "there"
      );

      const { data: gymData, error: gymError } = await supabase
        .from("gym_profiles")
        .select("gym_name")
        .eq("owner_id", user.id)
        .eq("is_approved", true)
        .maybeSingle();

      if (gymError) throw gymError;

      if (gymData?.gym_name) {
        setGymName(gymData.gym_name);
      }

      const { data, error: notificationError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (notificationError) throw notificationError;

      setNotifications(data || []);
    } catch (err) {
      console.error("Gym notifications error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let active = true;

    const setupRealtime = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!active || authError || !user) {
        return;
      }

      // Register the Realtime callback BEFORE subscribing.
      channel = supabase
        .channel(`gym-notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            if (active) {
              void loadNotifications();
            }
          }
        );

      if (!active) return;

      channel.subscribe();
    };

    void loadNotifications();
    void setupRealtime();

    return () => {
      active = false;

      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [supabase, loadNotifications]);

  const markAsRead = async (notificationId: string) => {
    setUpdating(notificationId);
    setError("");

    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (updateError) {
      setError("Unable to mark this notification as read.");
    } else {
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    }

    setUpdating(null);
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    setMarkingAll(true);
    setError("");

    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false);

    if (updateError) {
      setError("Unable to mark all notifications as read.");
    } else {
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    }

    setMarkingAll(false);
  };

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("en-LK", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));

  return (
    <div className="min-h-screen bg-brand-background text-brand-cream">
      <GymDashboardSidebar
        gymId={null}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <main className="min-h-screen lg:pl-64">
        <GymDashboardHeader
          gymName={gymName}
          ownerName={ownerName}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
          {/* Heading */}
          <div className="mb-8">
            <Link
              href="/gym/dashboard"
              className="mb-5 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-brand-lime"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-lime/10 text-brand-lime">
                  <Bell size={23} />
                </div>

                <div>
                  <h1 className="text-2xl font-extrabold sm:text-3xl">
                    Notifications
                  </h1>
                  <p className="mt-1 text-sm text-gray-400">
                    Stay updated with your bookings and gym activity.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    void loadNotifications();
                  }}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:border-brand-lime/40 hover:text-brand-lime disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0 || markingAll}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-lime px-4 py-3 text-sm font-bold text-brand-background transition hover:bg-[#d5ff7b] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {markingAll ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCheck size={16} />
                  )}
                  Mark all as read
                </button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.07] bg-brand-card p-5">
              <p className="text-sm text-gray-400">Total notifications</p>
              <p className="mt-2 text-3xl font-extrabold">
                {notifications.length}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                All received notifications
              </p>
            </div>

            <div className="rounded-2xl border border-brand-lime/20 bg-brand-card p-5">
              <p className="text-sm text-gray-400">Unread notifications</p>
              <p className="mt-2 text-3xl font-extrabold text-brand-lime">
                {unreadCount}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Notifications that need your attention
              </p>
            </div>
          </div>

          {/* Notification panel */}
          <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-brand-card">
            <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
              <div>
                <h2 className="text-lg font-bold">All notifications</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Your latest booking requests and updates
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    filter === "all"
                      ? "bg-brand-lime text-brand-background"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  All
                </button>

                <button
                  type="button"
                  onClick={() => setFilter("unread")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    filter === "unread"
                      ? "bg-brand-lime text-brand-background"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  Unread
                  {unreadCount > 0 && (
                    <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mx-5 mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300 sm:mx-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center">
                <Loader2
                  size={30}
                  className="animate-spin text-brand-lime"
                />
                <p className="mt-4 text-sm text-gray-400">
                  Loading notifications...
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] text-gray-500">
                  <Inbox size={30} />
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  {filter === "unread"
                    ? "You're all caught up!"
                    : "No notifications yet"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  {filter === "unread"
                    ? "You don't have any unread notifications."
                    : "Booking updates and important alerts will appear here."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {filteredNotifications.map((notification) => (
                  <article
                    key={notification.id}
                    className={`flex gap-4 px-5 py-5 transition hover:bg-white/[0.02] sm:px-6 ${
                      !notification.is_read ? "bg-brand-lime/[0.025]" : ""
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        notification.type === "booking"
                          ? "bg-brand-lime/10 text-brand-lime"
                          : "bg-white/[0.06] text-gray-400"
                      }`}
                    >
                      {notification.type === "booking" ? (
                        <CalendarDays size={20} />
                      ) : (
                        <Bell size={20} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-brand-cream">
                          {notification.title}
                        </h3>

                        {!notification.is_read && (
                          <span className="h-2 w-2 rounded-full bg-brand-lime" />
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-gray-400">
                        {notification.message}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock size={13} />
                          {formatDate(notification.created_at)}
                        </span>

                        {notification.related_booking_id && (
                          <Link
                            href="/gym/dashboard"
                            onClick={() => {
                              if (!notification.is_read) {
                                void markAsRead(notification.id);
                              }
                            }}
                            className="text-xs font-bold text-brand-lime hover:underline"
                          >
                            View dashboard
                          </Link>
                        )}

                        {!notification.is_read && (
                          <button
                            type="button"
                            onClick={() => void markAsRead(notification.id)}
                            disabled={updating === notification.id}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 transition hover:text-brand-lime disabled:opacity-50"
                          >
                            {updating === notification.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Check size={13} />
                            )}
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {!loading && filteredNotifications.length > 0 && (
              <div className="border-t border-white/[0.07] px-5 py-4 text-xs text-gray-500 sm:px-6">
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
