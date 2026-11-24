
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Search,
  Dumbbell,
  CalendarDays,
  UserRound,
  ArrowUpRight,
  Bell,
  Check,
  CheckCheck,
  RefreshCw,
  Loader2,
  Inbox,
  CircleDot,
  AlertCircle,
} from "lucide-react";

import ClientMobileMenu from "@/components/dashboard/ClientMobileMenu";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/auth/LogoutButton";
import NotificationBell from "@/components/notifications/NotificationBell";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  related_booking_id: string | null;
  is_read: boolean;
  created_at: string;
};

type Filter = "all" | "unread";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Find Trainers", href: "/trainers", icon: Dumbbell },
  { name: "Explore Gyms", href: "/gyms", icon: Search },
  { name: "My Bookings", href: "/dashboard/bookings", icon: CalendarDays },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    active: true,
  },
  { name: "My Profile", href: "/profile", icon: UserRound },
];

export default function ClientNotificationsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.href = `/login?redirectTo=${encodeURIComponent(
          "/dashboard/notifications"
        )}`;
        return;
      }

      setUserId(user.id);

      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select(
          "id, title, message, type, related_booking_id, is_read, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setNotifications((data || []) as Notification[]);
    } catch (err) {
      console.error("Notifications error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Initial notification load.
  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  // Realtime updates.
  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!active || authError || !user) return;

      const notificationChannel = supabase
        .channel(`client-notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
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

      channel = notificationChannel;

      if (active) {
        notificationChannel.subscribe();
      }
    };

    void setupRealtime();

    return () => {
      active = false;

      if (channel) {
        void supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, [supabase, loadNotifications]);

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;

    setUpdatingId(notificationId);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (updateError) throw updateError;

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Mark as read error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update notification."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const markAllAsRead = async () => {
    if (!userId || unreadCount === 0) return;

    setMarkingAll(true);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (updateError) throw updateError;

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (err) {
      console.error("Mark all as read error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark notifications as read."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((notification) => !notification.is_read)
      : notifications;

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Unknown date";

    return new Intl.DateTimeFormat("en-LK", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const getNotificationLink = (notification: Notification) => {
    if (
      notification.type === "booking" &&
      notification.related_booking_id
    ) {
      return "/dashboard/bookings";
    }

    return null;
  };

  const handleNotificationClick = async (
    notification: Notification
  ) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    const destination = getNotificationLink(notification);

    if (destination) {
      window.location.href = destination;
    }
  };

  return (
    <div className="min-h-screen bg-brand-background text-brand-cream">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.07] bg-[#1C201D] lg:flex">
        <Link
          href="/"
          className="flex h-20 items-center gap-3 border-b border-white/[0.07] px-7"
        >
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

        <div className="flex-1 px-4 py-8">
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
              {/* Shared mobile navigation */}
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

        {/* Page content */}
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          {/* Page heading */}
          <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-lime">
                Your updates
              </p>

              <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                Notifications
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Stay updated with your bookings and fitness activity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadNotifications()}
              disabled={loading}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs font-semibold text-brand-cream transition hover:border-brand-lime/40 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </section>

          {/* Summary cards */}
          <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.07] bg-brand-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">
                    Total notifications
                  </p>
                  <p className="mt-2 text-3xl font-extrabold tabular-nums">
                    {notifications.length}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                  <Bell size={20} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-lime/10 bg-brand-lime/[0.04] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">
                    Unread notifications
                  </p>
                  <p className="mt-2 text-3xl font-extrabold tabular-nums text-brand-lime">
                    {unreadCount}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                  <CircleDot size={20} />
                </div>
              </div>
            </div>
          </section>

          {/* Notifications panel */}
          <section className="mt-8 rounded-2xl border border-white/[0.07] bg-brand-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Your notifications
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Review updates and responses to your requests.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void markAllAsRead()}
                disabled={unreadCount === 0 || markingAll}
                className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-brand-lime transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {markingAll ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <CheckCheck size={15} />
                )}
                Mark all as read
              </button>
            </div>

            {/* Filters */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-5">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                    filter === "all"
                      ? "border-brand-lime bg-brand-lime text-brand-background"
                      : "border-white/10 bg-[#171A18]/60 text-gray-400 hover:text-white"
                  }`}
                >
                  All
                </button>

                <button
                  type="button"
                  onClick={() => setFilter("unread")}
                  className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                    filter === "unread"
                      ? "border-brand-lime bg-brand-lime text-brand-background"
                      : "border-white/10 bg-[#171A18]/60 text-gray-400 hover:text-white"
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              <p className="text-[10px] text-gray-500">
                {filteredNotifications.length}{" "}
                {filteredNotifications.length === 1
                  ? "notification"
                  : "notifications"}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0 text-red-400"
                  />
                  <div>
                    <p className="text-xs font-semibold text-red-300">
                      Something went wrong
                    </p>
                    <p className="mt-1 break-words text-xs leading-5 text-gray-400">
                      {error}
                    </p>
                    <button
                      type="button"
                      onClick={() => void loadNotifications()}
                      className="mt-3 text-xs font-bold text-brand-lime hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notification list */}
            <div className="mt-5">
              {loading ? (
                <div className="flex min-h-64 items-center justify-center">
                  <Loader2
                    size={27}
                    className="animate-spin text-brand-lime"
                  />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 px-5 py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] text-gray-500">
                    <Inbox size={28} />
                  </div>

                  <h3 className="mt-5 text-sm font-bold">
                    {filter === "unread"
                      ? "You're all caught up"
                      : "No notifications yet"}
                  </h3>

                  <p className="mt-2 max-w-sm text-xs leading-6 text-gray-500">
                    {filter === "unread"
                      ? "You don't have any unread notifications."
                      : "Updates about your booking requests will appear here."}
                  </p>

                  {filter === "all" && (
                    <Link
                      href="/trainers"
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-lime px-4 py-2.5 text-xs font-bold text-brand-background transition hover:bg-[#d5ff7b]"
                    >
                      Find a trainer <ArrowUpRight size={14} />
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => {
                    const destination =
                      getNotificationLink(notification);
                    const isUpdating =
                      updatingId === notification.id;

                    return (
                      <article
                        key={notification.id}
                        onClick={() => {
                          if (destination) {
                            void handleNotificationClick(notification);
                          }
                        }}
                        className={`rounded-xl border p-4 transition sm:p-5 ${
                          notification.is_read
                            ? "border-white/[0.07] bg-[#171A18]/60"
                            : "border-brand-lime/20 bg-brand-lime/[0.035]"
                        } ${
                          destination
                            ? "cursor-pointer hover:border-brand-lime/40"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                            {notification.type === "booking" ? (
                              <CalendarDays size={20} />
                            ) : (
                              <Bell size={20} />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex items-center gap-2">
                                <h3 className="break-words text-sm font-bold text-brand-cream">
                                  {notification.title}
                                </h3>

                                {!notification.is_read && (
                                  <CircleDot
                                    size={12}
                                    className="shrink-0 text-brand-lime"
                                  />
                                )}
                              </div>

                              <span className="shrink-0 text-[10px] text-gray-600">
                                {formatDate(notification.created_at)}
                              </span>
                            </div>

                            <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-6 text-gray-400">
                              {notification.message}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              {destination ? (
                                <span className="text-[10px] font-semibold text-brand-lime">
                                  View booking{" "}
                                  <ArrowUpRight
                                    className="ml-1 inline"
                                    size={12}
                                  />
                                </span>
                              ) : (
                                <span className="text-[10px] capitalize text-gray-600">
                                  {notification.type}
                                </span>
                              )}

                              {!notification.is_read && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    void markAsRead(notification.id);
                                  }}
                                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 transition hover:text-brand-lime disabled:opacity-50"
                                >
                                  {isUpdating ? (
                                    <Loader2
                                      size={13}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Check size={13} />
                                  )}
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Bottom note */}
          <div className="mt-8 flex flex-col gap-2 rounded-2xl border border-brand-lime/10 bg-brand-lime/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                Small steps. Big progress.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Stay on top of your fitness journey with FitX Lanka.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-lime hover:underline"
            >
              Back to dashboard <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
