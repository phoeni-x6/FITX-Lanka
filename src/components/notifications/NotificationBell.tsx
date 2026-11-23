
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  related_booking_id: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell() {
  const supabase = useMemo(() => createClient(), []);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const loadNotifications = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setNotifications([]);
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select(
          "id, title, message, type, related_booking_id, is_read, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error("Notification loading error:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadNotifications();

    const channel = supabase
      .channel("user-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        () => {
          void loadNotifications();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadNotifications, supabase]);

  const markAsRead = async (notificationId: string) => {
    setUpdatingId(notificationId);

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Mark notification as read error:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter((notification) => !notification.is_read)
      .map((notification) => notification.id);

    if (unreadIds.length === 0) return;

    setUpdatingId("all");

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", unreadIds);

      if (error) throw error;

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatTime = (date: string) =>
    new Date(date).toLocaleString("en-LK", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-gray-400 transition hover:border-brand-lime/40 hover:text-brand-lime"
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-lime px-1 text-[10px] font-extrabold text-brand-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-14 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#222723] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] p-4">
              <div>
                <h3 className="text-sm font-bold text-brand-cream">
                  Notifications
                </h3>
                <p className="mt-1 text-[11px] text-gray-500">
                  {unreadCount} unread
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={updatingId !== null}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-lime hover:underline disabled:opacity-50"
                >
                  {updatingId === "all" ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <CheckCheck size={14} />
                  )}
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[390px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2
                    size={22}
                    className="animate-spin text-brand-lime"
                  />
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Bell
                    size={25}
                    className="mx-auto text-gray-600"
                  />
                  <p className="mt-3 text-sm font-semibold text-gray-400">
                    You're all caught up
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    New notifications will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-b border-white/[0.05] p-4 transition hover:bg-white/[0.03] ${
                      !notification.is_read
                        ? "bg-brand-lime/[0.035]"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          notification.is_read
                            ? "bg-gray-600"
                            : "bg-brand-lime"
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-brand-cream">
                          {notification.title}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-400">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-[10px] text-gray-600">
                          {formatTime(notification.created_at)}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          {notification.related_booking_id && (
                            <Link
                              href="/bookings"
                              onClick={() => setOpen(false)}
                              className="text-[11px] font-semibold text-brand-lime hover:underline"
                            >
                              View bookings
                            </Link>
                          )}

                          {!notification.is_read && (
                            <button
                              type="button"
                              onClick={() =>
                                markAsRead(notification.id)
                              }
                              disabled={updatingId !== null}
                              className="ml-auto text-[10px] font-semibold text-gray-400 hover:text-brand-lime disabled:opacity-50"
                            >
                              {updatingId === notification.id
                                ? "Updating..."
                                : "Mark as read"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
