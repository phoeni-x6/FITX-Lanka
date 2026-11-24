
import Link from "next/link";
import {
  MapPin,
  ArrowUpRight,
  UserRound,
  GraduationCap,
  BadgeCheck,
} from "lucide-react";

import type { Trainer } from "@/data/trainers";

type TrainerCardProps = {
  trainer: Trainer;
};

export default function TrainerCard({ trainer }: TrainerCardProps) {
  const qualifications = trainer.qualifications ?? [];
  const visibleQualifications = qualifications.slice(0, 2);
  const remainingQualifications = qualifications.length - 2;

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-brand-card transition duration-300 hover:-translate-y-1 hover:border-brand-lime/40">
      <div className="relative h-64 overflow-hidden bg-[#2a302b]">
        {trainer.image ? (
          <img
            src={trainer.image}
            alt={trainer.name}
            className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <UserRound size={64} className="text-gray-600" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute bottom-4 left-4">
          <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
            {trainer.specialty}
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
              {trainer.price !== null
                ? `Rs. ${trainer.price.toLocaleString("en-LK")}`
                : "Contact for price"}
            </p>
          </div>
        </div>

        {visibleQualifications.length > 0 && (
          <div className="mt-4">
            <div className="mb-3 flex items-center gap-2">
              <GraduationCap size={16} className="text-brand-lime" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Qualifications
              </p>
              <BadgeCheck size={14} className="text-brand-lime" />
              <span className="text-[9px] text-brand-lime">
                Verified
              </span>
            </div>

            <div className="space-y-2">
              {visibleQualifications.map((qualification) => (
                <div
                  key={qualification.qualification_id}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2"
                >
                  <p className="text-xs font-semibold text-brand-cream">
                    {qualification.qualification_name}
                  </p>

                  <p className="mt-1 text-[10px] text-gray-500">
                    {qualification.institution}
                    {qualification.year_obtained
                      ? ` · ${qualification.year_obtained}`
                      : ""}
                  </p>
                </div>
              ))}
            </div>

            {remainingQualifications > 0 && (
              <p className="mt-2 text-[10px] font-medium text-brand-lime">
                + {remainingQualifications} more qualifications
              </p>
            )}
          </div>
        )}

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
          href={`/trainers/${trainer.id}`}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-brand-lime/30 py-3 text-xs font-bold text-brand-lime transition hover:bg-brand-lime hover:text-brand-background"
        >
          View Trainer Profile
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
}
