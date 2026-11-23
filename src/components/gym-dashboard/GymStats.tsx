import { CalendarDays, CheckCircle2, Clock, XCircle } from "lucide-react";

type GymStatsProps = {
  totalBookings: number;
  pendingBookings: number;
  acceptedBookings: number;
  rejectedBookings: number;
};

const statConfig = [
  {
    key: "totalBookings",
    label: "Total Requests",
    icon: CalendarDays,
    color: "text-[#C7F36B]",
    bg: "bg-[#C7F36B]/10",
  },
  {
    key: "pendingBookings",
    label: "Pending",
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    key: "acceptedBookings",
    label: "Accepted",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    key: "rejectedBookings",
    label: "Rejected",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
] as const;

export default function GymStats({
  totalBookings,
  pendingBookings,
  acceptedBookings,
  rejectedBookings,
}: GymStatsProps) {
  const values = {
    totalBookings,
    pendingBookings,
    acceptedBookings,
    rejectedBookings,
  };

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statConfig.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.key}
            className="rounded-2xl border border-white/10 bg-[#222723] p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/45">{stat.label}</p>
                <p className="mt-3 text-3xl font-bold text-[#EFEFE5]">
                  {values[stat.key]}
                </p>
              </div>

              <div className={`rounded-xl p-3 ${stat.bg}`}>
                <Icon size={21} className={stat.color} />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}