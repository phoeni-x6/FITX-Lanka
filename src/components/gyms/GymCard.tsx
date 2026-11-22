
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Star,
  ArrowUpRight,
  Dumbbell,
} from "lucide-react";
import type { Gym } from "@/data/gyms";

type GymCardProps = {
  gym: Gym;
};

export default function GymCard({ gym }: GymCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-brand-card transition duration-300 hover:-translate-y-1 hover:border-brand-lime/30">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={gym.image}
          alt={gym.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
          <MapPin size={13} className="text-brand-lime" />
          {gym.location}
        </div>

        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
          <Star size={13} className="fill-brand-lime text-brand-lime" />
          {gym.rating.toFixed(1)}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-brand-cream transition group-hover:text-brand-lime">
              {gym.name}
            </h3>
            <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-gray-400">
              {gym.description}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {gym.facilities.slice(0, 3).map((item) => (
            <span
              key={item}
              className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-medium text-gray-300"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Monthly membership
            </p>
            <p className="mt-1 text-sm font-bold text-brand-lime">
              {gym.membershipPrice !== null
                ? `LKR ${gym.membershipPrice.toLocaleString()}`
                : "Contact gym"}
            </p>
          </div>

          <Link
            href={`/gyms/${gym.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-lime px-4 py-2.5 text-xs font-bold text-brand-background transition hover:bg-brand-cream"
          >
            View Gym
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
