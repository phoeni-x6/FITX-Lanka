
"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  Bell,
  Building2,
  UserRound,
  Dumbbell,
  ArrowUpRight,
  X,
} from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

type Props = {
  gymId: string | null;
  mobileOpen?: boolean;
  onClose?: () => void;
};

export default function GymDashboardSidebar({
  gymId,
  mobileOpen = false,
  onClose,
}: Props) {
 const navigation = [
  {
    name: "Overview",
    href: "/gym/dashboard#overview",
    icon: LayoutDashboard,
  },
  {
    name: "Booking Requests",
    href: "/gym/dashboard#bookings",
    icon: CalendarDays,
  },
  {
    name: "Public Gym Profile",
    href: gymId ? `/gyms/${gymId}` : "/gyms",
    icon: Building2,
  },
  {
    name: "Notifications",
    href: "/gym/dashboard/notifications",
    icon: Bell,
  },
  {
    name: "Account Profile",
    href: "/profile",
    icon: UserRound,
  },
];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/[0.07] bg-[#1C201D] transition-transform duration-300 lg:w-64 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/[0.07] px-6">
          <Link href="/" onClick={onClose} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime text-brand-background">
              <Dumbbell size={22} strokeWidth={2.5} />
            </div>

            <div>
              <h1 className="text-lg font-extrabold">
                FitX <span className="text-brand-lime">Lanka</span>
              </h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500">
                Gym Owner Portal
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-8">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item, index) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    index === 0
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
              Grow your gym
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Manage enquiries and connect with people looking for their next
              fitness destination.
            </p>

            <Link
              href="/gyms"
              onClick={onClose}
              className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-brand-lime hover:underline"
            >
              Explore FitX Lanka <ArrowUpRight size={14} />
            </Link>
          </div>

          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
