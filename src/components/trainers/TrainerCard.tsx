
import Link from "next/link";
import { MapPin, Star, ArrowUpRight } from "lucide-react";
import type { Trainer } from "@/data/trainers";

type TrainerCardProps = {
  trainer: Trainer;
};

export default function TrainerCard({ trainer }: TrainerCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-brand-card transition duration-300 hover:-translate-y-1 hover:border-brand-lime/40">
      <div className="relative h-64 overflow-hidden bg-[#2a302b]">
        <img
          src={trainer.image}
          alt={trainer.name}
          className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute bottom-4 left-4">
          <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
            {trainer.specialty}
          </span>
        </div>

        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
          <Star size={13} className="fill-brand-lime text-brand-lime" />
          {trainer.rating}
          <span className="font-normal text-gray-300">
            ({trainer.reviews})
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-brand-cream">
          {trainer.name}
        </h3>

        <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin size={13} />
          {trainer.location}, Sri Lanka
        </p>

        <div className="mt-5 flex items-center gap-5 border-y border-white/[0.07] py-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              Experience
            </p>
            <p className="mt-1 text-sm font-bold">
              {trainer.experience} years
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              Session price
            </p>
            <p className="mt-1 text-sm font-bold text-brand-lime">
              Rs. {trainer.price.toLocaleString("en-LK")}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {trainer.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/[0.05] px-2.5 py-1.5 text-[10px] font-medium text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          href="/login"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-brand-lime/30 py-3 text-xs font-bold text-brand-lime transition hover:bg-brand-lime hover:text-brand-background"
        >
          View Trainer Profile
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
}
