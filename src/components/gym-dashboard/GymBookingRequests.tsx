
"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
  MessageSquare,
  Inbox,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export type GymBooking = {
  id: string;
  request_type: string;
  status: string;
  preferred_start_at: string | null;
  preferred_end_at: string | null;
  message: string | null;
  provider_response?: string | null;
  created_at: string;
};

type Props = {
  bookings: GymBooking[];
  onUpdated: () => void;
};

const filters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function GymBookingRequests({
  bookings,
  onUpdated,
}: Props) {
  const supabase = useMemo(() => createClient(), []);

  const [responses, setResponses] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formatRequestType = (type: string) => {
    switch (type) {
      case "gym_visit":
        return "Gym Visit";
      case "membership_enquiry":
        return "Membership Enquiry";
      default:
        return type.replaceAll("_", " ");
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Not scheduled";

    return new Date(date).toLocaleString("en-LK", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const statusStyle = (status: string) => {
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

  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const filteredBookings = bookings.filter((booking) =>
    activeFilter === "all" ? true : booking.status === activeFilter
  );

  const handleResponse = async (
    bookingId: string,
    status: "accepted" | "rejected"
  ) => {
    setProcessingId(bookingId);
    setError("");
    setSuccess("");

    try {
      const { error: rpcError } = await supabase.rpc(
        "respond_to_booking",
        {
          p_booking_id: bookingId,
          p_status: status,
          p_provider_response: responses[bookingId]?.trim() || null,
        }
      );

      if (rpcError) throw rpcError;

      setSuccess(
        status === "accepted"
          ? "Booking request accepted successfully."
          : "Booking request rejected successfully."
      );

      setResponses((previous) => {
        const updated = { ...previous };
        delete updated[bookingId];
        return updated;
      });

      onUpdated();
    } catch (err) {
      console.error("Booking response error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update this booking request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="scroll-mt-24 rounded-2xl border border-white/[0.07] bg-brand-card p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Booking Management</h2>
          <p className="mt-1 text-xs text-gray-500">
            Review, manage and respond to requests sent to your gym.
          </p>
        </div>

        <span className="rounded-lg bg-brand-lime/10 px-3 py-1.5 text-xs font-bold text-brand-lime">
          {pendingCount} pending
        </span>
      </div>

      {/* Summary counts */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total",
            count: bookings.length,
            color: "text-brand-cream",
          },
          {
            label: "Pending",
            count: pendingCount,
            color: "text-yellow-400",
          },
          {
            label: "Accepted",
            count: bookings.filter((b) => b.status === "accepted").length,
            color: "text-green-400",
          },
          {
            label: "Rejected",
            count: bookings.filter((b) => b.status === "rejected").length,
            color: "text-red-400",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              {item.label}
            </p>
            <p className={`mt-2 text-2xl font-extrabold ${item.color}`}>
              {item.count}
            </p>
          </div>
        ))}
      </div>

      {/* Feedback */}
      {error && (
        <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-400">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="mt-7">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-400">
          <Filter size={14} />
          Filter requests
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => {
            const count =
              filter.value === "all"
                ? bookings.length
                : bookings.filter(
                    (booking) => booking.status === filter.value
                  ).length;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                  activeFilter === filter.value
                    ? "border-brand-lime bg-brand-lime text-brand-background"
                    : "border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20 hover:text-brand-cream"
                }`}
              >
                {filter.label}
                <span
                  className={`text-[10px] ${
                    activeFilter === filter.value
                      ? "text-brand-background/70"
                      : "text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Booking list */}
      {filteredBookings.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-5 py-12 text-center">
          <Inbox size={30} className="text-gray-500" />

          <h3 className="mt-4 text-sm font-bold">
            {bookings.length === 0
              ? "No booking requests yet"
              : `No ${activeFilter} requests`}
          </h3>

          <p className="mt-2 max-w-sm text-xs leading-6 text-gray-500">
            {bookings.length === 0
              ? "Gym visit requests and membership enquiries will appear here."
              : "Try selecting another filter to view your booking requests."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filteredBookings.map((booking) => {
            const isProcessing = processingId === booking.id;
            const isPending = booking.status === "pending";

            return (
              <article
                key={booking.id}
                className="rounded-xl border border-white/[0.07] p-4 transition hover:border-brand-lime/20 sm:p-5"
              >
                {/* Request heading */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                      {booking.request_type === "gym_visit" ? (
                        <CalendarDays size={19} />
                      ) : (
                        <Users size={19} />
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold">
                        {formatRequestType(booking.request_type)}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Received {formatDate(booking.created_at)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-bold capitalize ${statusStyle(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>

                {/* Preferred dates */}
                <div className="mt-4 rounded-lg bg-white/[0.03] p-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    <Clock3 size={13} />
                    {booking.request_type === "membership_enquiry"
                      ? "Membership enquiry"
                      : "Preferred schedule"}
                  </div>

                  {booking.request_type === "membership_enquiry" ? (
                    <p className="mt-2 text-xs text-gray-400">
                      The client is enquiring about gym membership.
                      No visit date was requested.
                    </p>
                  ) : (
                    <div className="mt-2 space-y-1 text-xs text-gray-400">
                      <p>
                        Start: {formatDate(booking.preferred_start_at)}
                      </p>
                      {booking.preferred_end_at && (
                        <p className="text-gray-500">
                          End: {formatDate(booking.preferred_end_at)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Client message */}
                {booking.message && (
                  <div className="mt-3 rounded-lg border border-white/[0.05] p-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      <MessageSquare size={13} />
                      Client message
                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-gray-400">
                      {booking.message}
                    </p>
                  </div>
                )}

                {/* Provider response */}
                {!isPending && booking.provider_response && (
                  <div className="mt-3 rounded-lg border border-brand-lime/10 bg-brand-lime/[0.04] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-lime">
                      Your response
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-gray-400">
                      {booking.provider_response}
                    </p>
                  </div>
                )}

                <p className="mt-3 text-[10px] text-gray-600">
                  Request ID: {booking.id.slice(0, 8)}
                </p>

                {/* Pending actions */}
                {isPending && (
                  <div className="mt-5 border-t border-white/[0.07] pt-4">
                    <label
                      htmlFor={`response-${booking.id}`}
                      className="text-xs font-semibold text-gray-400"
                    >
                      Response message (optional)
                    </label>

                    <textarea
                      id={`response-${booking.id}`}
                      value={responses[booking.id] || ""}
                      onChange={(event) =>
                        setResponses((previous) => ({
                          ...previous,
                          [booking.id]: event.target.value,
                        }))
                      }
                      rows={2}
                      placeholder="Add a message for the client..."
                      disabled={isProcessing}
                      className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-brand-background px-4 py-3 text-xs text-brand-cream outline-none transition placeholder:text-gray-600 focus:border-brand-lime/50 disabled:opacity-50"
                    />

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleResponse(booking.id, "accepted")
                        }
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-lime px-4 py-2.5 text-xs font-bold text-brand-background transition hover:bg-[#d5ff7b] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={15} />
                        )}
                        Accept Request
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleResponse(booking.id, "rejected")
                        }
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 px-4 py-2.5 text-xs font-bold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <XCircle size={15} />
                        )}
                        Reject Request
                      </button>
                    </div>
                  </div>
                )}

                {!isPending && (
                  <div className="mt-4 flex items-center gap-2 border-t border-white/[0.07] pt-4 text-xs text-gray-500">
                    <CheckCircle2 size={14} />
                    This request has already been processed.
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
