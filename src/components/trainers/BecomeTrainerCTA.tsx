
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function BecomeTrainerCTA() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
      <div className="relative overflow-hidden rounded-3xl border border-brand-lime/15 bg-[#222923] p-8 sm:p-12">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">
            Join the community
          </p>

          <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">
            Are you a personal trainer?
          </h2>

          <p className="mt-3 text-sm leading-7 text-gray-400">
            Connect with people who are ready to work towards their fitness
            goals. Apply to become a FitX Lanka trainer.
          </p>

          <Link
            href="/login"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand-lime px-5 py-3 text-sm font-bold text-brand-background transition hover:bg-[#d5ff7b]"
          >
            Become a Trainer
            <ArrowUpRight size={17} />
          </Link>
        </div>

        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-brand-lime/[0.08] blur-3xl" />
      </div>
    </section>
  );
}
