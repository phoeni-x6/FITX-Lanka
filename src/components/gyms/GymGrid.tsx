
import { SearchX, Dumbbell } from "lucide-react";
import type { Gym } from "@/data/gyms";
import GymCard from "./GymCard";

type GymGridProps = {
  gyms: Gym[];
  clearFilters: () => void;
};

export default function GymGrid({
  gyms,
  clearFilters,
}: GymGridProps) {
  if (gyms.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-brand-card px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-lime/10">
          <SearchX size={25} className="text-brand-lime" />
        </div>

        <h3 className="mt-5 text-lg font-bold text-brand-cream">
          No gyms found
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-400">
          We couldn't find any gyms matching your search. Try changing
          your filters or search for something else.
        </p>

        <button
          onClick={clearFilters}
          className="mt-6 rounded-xl bg-brand-lime px-5 py-3 text-xs font-bold text-brand-background transition hover:bg-brand-cream"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-brand-cream">
            Explore gyms
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Find a space that matches your training goals.
          </p>
        </div>

        <span className="rounded-full border border-brand-lime/20 bg-brand-lime/[0.08] px-3 py-1.5 text-xs font-semibold text-brand-lime">
          {gyms.length} {gyms.length === 1 ? "gym" : "gyms"}
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {gyms.map((gym) => (
          <GymCard key={gym.id} gym={gym} />
        ))}
      </div>
    </div>
  );
}
