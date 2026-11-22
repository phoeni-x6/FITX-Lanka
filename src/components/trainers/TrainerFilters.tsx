
"use client";

import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
} from "lucide-react";

type TrainerFiltersProps = {
  search: string;
  setSearch: (value: string) => void;
  specialty: string;
  setSpecialty: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  specialties: string[];
  locations: string[];
  clearFilters: () => void;
};

export default function TrainerFilters({
  search,
  setSearch,
  specialty,
  setSpecialty,
  location,
  setLocation,
  specialties,
  locations,
  clearFilters,
}: TrainerFiltersProps) {
  const hasFilters =
    search !== "" ||
    specialty !== "All" ||
    location !== "All Locations";

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-brand-card p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by trainer name or specialty..."
            className="h-12 w-full rounded-xl border border-white/10 bg-[#171A18] pl-12 pr-4 text-sm text-brand-cream outline-none transition placeholder:text-gray-600 focus:border-brand-lime/60"
          />
        </div>

        <div className="relative">
          <MapPin
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <select
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-[#171A18] pl-11 pr-4 text-sm text-brand-cream outline-none focus:border-brand-lime/60"
          >
            {locations.map((item) => (
              <option key={item} value={item} className="bg-[#171A18]">
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-400">
          <SlidersHorizontal size={14} />
          Filter by specialty
        </div>

        <div className="flex flex-wrap gap-2">
          {specialties.map((item) => (
            <button
              key={item}
              onClick={() => setSpecialty(item)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                specialty === item
                  ? "border-brand-lime bg-brand-lime text-brand-background"
                  : "border-white/10 bg-white/[0.02] text-gray-400 hover:border-brand-lime/50 hover:text-brand-cream"
              }`}
            >
              {item}
            </button>
          ))}

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-400/10"
            >
              <X size={13} />
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
