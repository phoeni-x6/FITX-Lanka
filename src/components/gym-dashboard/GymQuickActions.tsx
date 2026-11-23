
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  ImagePlus,
} from "lucide-react";

type GymQuickActionsProps = {
  gymId: string;
};

export default function GymQuickActions({
  gymId,
}: GymQuickActionsProps) {
  const actions = [
    {
      title: "View Public Profile",
      description: "See how your gym appears to visitors.",
      href: `/gyms/${gymId}`,
      icon: Building2,
    },
    {
      title: "Manage Requests",
      description: "Review and respond to incoming booking requests.",
      href: "#bookings",
      icon: CalendarDays,
    },
    {
      title: "Edit Gym Profile",
      description: "Update your gym details, facilities and images.",
      href: "/gym/dashboard/profile",
      icon: ImagePlus,
    },
  ];

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-[#EFEFE5]">
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-2xl border border-white/10 bg-[#222723] p-5 transition hover:border-[#C7F36B]/40 hover:bg-[#292F2A]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-[#C7F36B]/10 p-3 text-[#C7F36B]">
                  <Icon size={20} />
                </div>

                <ArrowUpRight
                  size={18}
                  className="text-white/30 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#C7F36B]"
                />
              </div>

              <h3 className="font-medium text-[#EFEFE5]">
                {action.title}
              </h3>

              <p className="mt-2 text-sm leading-5 text-white/40">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
