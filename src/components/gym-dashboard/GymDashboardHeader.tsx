
"use client";

import { useState } from "react";
import { Menu, Search } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";

type Props = {
  gymName: string;
  ownerName: string;
  onMenuClick?: () => void;
};

export default function GymDashboardHeader({
  gymName,
  ownerName,
  onMenuClick,
}: Props) {
  const [search, setSearch] = useState("");

  const initials = ownerName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-brand-background/90 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg border border-white/10 p-2 text-gray-400 hover:text-brand-lime lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-base font-bold sm:text-lg">
              Gym Owner Dashboard
            </h1>
            <p className="mt-0.5 truncate text-xs text-gray-500">
              Managing {gymName}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-brand-card px-3 py-2 md:flex">
            <Search size={16} className="text-gray-500" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              className="w-32 bg-transparent text-xs text-brand-cream outline-none placeholder:text-gray-600 lg:w-44"
            />
          </div>

          <NotificationBell />

          <div className="flex items-center gap-3 border-l border-white/10 pl-3 sm:pl-5">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-brand-cream">
                {ownerName}
              </p>
              <p className="mt-0.5 text-[10px] text-gray-500">
                Gym Owner
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime text-sm font-extrabold text-brand-background">
              {initials || "GO"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
