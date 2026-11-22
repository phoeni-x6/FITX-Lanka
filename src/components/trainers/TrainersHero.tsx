
import { Dumbbell, Users, Award, MapPin } from "lucide-react";

export default function TrainersHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(199,243,107,0.12),_transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-lime/20 bg-brand-lime/[0.08] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-lime">
            <Dumbbell size={14} />
            Find your fitness partner
          </span>

          <h1 className="mt-7 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-7xl">
            Meet the people
            <br />
            who move you
            <span className="text-brand-lime">.</span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
            Find experienced personal trainers who understand your goals.
            Discover the right expertise, compare your options, and take
            your next step with confidence.
          </p>

          <div className="mt-9 flex flex-wrap gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-brand-lime" />
              Personal guidance
            </div>
            <div className="flex items-center gap-2">
              <Award size={16} className="text-brand-lime" />
              Experienced trainers
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-brand-lime" />
              Across Sri Lanka
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
