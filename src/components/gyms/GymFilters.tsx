
"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

type GymFiltersProps = {
  search: string;
  setSearch: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  facility: string;
  setFacility: (value: string) => void;
  locations: string[];
  facilities: string[];
  clearFilters: () => void;
};

export default function GymFilters({
  search,
  setSearch,
  location,
  setLocation,
  facility,
  setFacility,
  locations,
  facilities,
  clearFilters,
}: GymFiltersProps) {
  const hasFilters =
    search !== "" ||
    location !== "All Locations" ||
    facility !== "All Facilities";

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-brand-card p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={17} className="text-brand-lime" />
          <h2 className="text-sm font-bold text-brand-cream">
            Find your gym
          </h2>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 transition hover:text-brand-lime"
          >
            <X size={14} />
            Clear filters
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gyms or facilities..."
            className="w-full rounded-xl border border-white/10 bg-brand-background py-3.5 pl-11 pr-4 text-sm text-brand-cream outline-none transition placeholder:text-gray-600 focus:border-brand-lime/50"
          />
        </div>

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-brand-background px-4 py-3.5 text-sm text-brand-cream outline-none focus:border-brand-lime/50"
        >
          {locations.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={facility}
          onChange={(e) => setFacility(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-brand-background px-4 py-3.5 text-sm text-brand-cream outline-none focus:border-brand-lime/50"
        >
          {facilities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
