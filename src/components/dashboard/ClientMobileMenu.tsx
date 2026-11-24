
"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Dumbbell,
  Search,
  CalendarDays,
  Bell,
  UserRound,
  ArrowUpRight,
} from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Find Trainers", href: "/trainers", icon: Dumbbell },
  { name: "Explore Gyms", href: "/gyms", icon: Search },
  { name: "My Bookings", href: "/dashboard/bookings", icon: CalendarDays },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  { name: "My Profile", href: "/profile", icon: UserRound },
];

export default function ClientMobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open dashboard menu"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-brand-cream transition hover:border-brand-lime/40 hover:text-brand-lime lg:hidden"
      >
        <Menu size={21} />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <aside className="absolute inset-y-0 left-0 flex w-[min(82vw,320px)] flex-col border-r border-white/10 bg-[#1C201D] shadow-2xl">
              <div className="flex h-20 items-center justify-between border-b border-white/[0.07] px-5">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime text-brand-background">
                    <Dumbbell size={22} strokeWidth={2.5} />
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-brand-cream">
                      FitX <span className="text-brand-lime">Lanka</span>
                    </h2>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500">
                      Client Dashboard
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-7">
                <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  Workspace
                </p>

                <nav className="space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        item.href !== "/profile" &&
                        pathname.startsWith(`${item.href}/`));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                          active
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

                <div className="mt-8 rounded-xl bg-white/[0.04] p-4">
                  <p className="text-xs font-semibold text-brand-cream">
                    Ready to get started?
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Find the right trainer or gym for your goals.
                  </p>

                  <Link
                    href="/trainers"
                    onClick={() => setOpen(false)}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-brand-lime hover:underline"
                  >
                    Explore trainers <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="border-t border-white/[0.07] p-5">
                <LogoutButton />
              </div>
            </aside>
          </div>,
          document.body
        )}
    </>
  );
}
