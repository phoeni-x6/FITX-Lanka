
import { Search } from "lucide-react";
import TrainerCard from "./TrainerCard";
import type { Trainer } from "@/data/trainers";

type TrainerGridProps = {
  trainers: Trainer[];
  clearFilters: () => void;
};

export default function TrainerGrid({
  trainers,
  clearFilters,
}: TrainerGridProps) {
  if (trainers.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-white/10 px-5 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-gray-500">
          <Search size={24} />
        </div>

        <h3 className="mt-5 text-lg font-bold">No trainers found</h3>

        <p className="mt-2 text-sm text-gray-500">
          Try another search term or change your filters.
        </p>

        <button
          onClick={clearFilters}
          className="mt-5 rounded-xl bg-brand-lime px-5 py-3 text-xs font-bold text-brand-background transition hover:bg-[#d5ff7b]"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {trainers.map((trainer) => (
        <TrainerCard key={trainer.id} trainer={trainer} />
      ))}
    </div>
  );
}
