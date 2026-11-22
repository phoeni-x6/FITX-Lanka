
import Link from "next/link";
import { ArrowUpRight, Dumbbell } from "lucide-react";

export default function BecomeGymCTA() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
      <div className="relative overflow-hidden rounded-3xl border border-brand-lime/20 bg-brand-card p-8 sm:p-12 lg:p-16">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-lime/[0.08] blur-3xl" />

        <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-lime/20 bg-brand-lime/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-lime">
              <Dumbbell size={13} />
              Grow with FitX Lanka
            </div>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-brand-cream sm:text-4xl">
              Own a gym?
              <br />
              <span className="text-brand-lime">
                Get discovered here.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-400">
              Connect with people looking for their next training space.
              Create your gym listing and reach more potential members
              through FitX Lanka.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex shrink-0 items-center gap-3 rounded-xl bg-brand-lime px-6 py-4 text-sm font-bold text-brand-background transition hover:bg-brand-cream"
          >
            List Your Gym
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
