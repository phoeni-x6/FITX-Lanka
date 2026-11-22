
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Dumbbell,
  Target,
  Users,
  HeartPulse,
  Trophy,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(199,243,107,0.12),_transparent_45%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-lime/20 bg-brand-lime/[0.08] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-lime">
              <Sparkles size={14} />
              About FitX Lanka
            </span>

            <h1 className="mt-7 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Fitness is better
              <br />
              when we grow
              <span className="text-brand-lime"> together.</span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
              FitX Lanka is a fitness marketplace designed to bring
              people, personal trainers, and gyms together.
              We're making it easier to discover the right people
              and places to support your fitness journey.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/trainers"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-lime px-6 py-3.5 text-sm font-bold text-brand-background transition hover:bg-brand-cream"
              >
                Explore Trainers
                <ArrowUpRight size={17} />
              </Link>

              <Link
                href="/gyms"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3.5 text-sm font-semibold text-brand-cream transition hover:border-brand-lime/40 hover:text-brand-lime"
              >
                Explore Gyms
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-brand-lime/10 blur-3xl" />

            <div className="relative h-[360px] overflow-hidden rounded-3xl border border-white/10 sm:h-[460px]">
              <Image
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=90"
                alt="Modern fitness training environment"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              <div className="absolute bottom-7 left-7 right-7">
                <div className="flex items-center gap-2 text-brand-lime">
                  <Dumbbell size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Your fitness community
                  </span>
                </div>

                <p className="mt-3 max-w-sm text-2xl font-bold leading-snug text-white sm:text-3xl">
                  Your goals. Your people. Your move.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-10 lg:py-28">
        <div className="relative order-2 lg:order-1">
          <div className="relative h-[320px] overflow-hidden rounded-3xl sm:h-[420px]">
            <Image
              src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1000&q=85"
              alt="Athlete training with weights"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          <div className="absolute -bottom-5 right-5 rounded-2xl border border-brand-lime/20 bg-brand-card p-5 sm:right-8">
            <Dumbbell size={25} className="text-brand-lime" />
            <p className="mt-2 text-sm font-bold text-brand-cream">
              Built around fitness
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Connecting the community
            </p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">
            Our Story
          </p>

          <h2 className="mt-5 text-3xl font-extrabold leading-tight text-brand-cream sm:text-4xl">
            Making fitness
            <span className="text-brand-lime"> more accessible.</span>
          </h2>

          <p className="mt-6 text-sm leading-7 text-gray-400">
            Finding the right gym or personal trainer shouldn't be
            complicated. People often spend time searching across
            different platforms, comparing options, and trying to
            find the right fit.
          </p>

          <p className="mt-4 text-sm leading-7 text-gray-400">
            FitX Lanka aims to bring these choices into one convenient
            platform. We want to make discovering fitness opportunities
            easier while helping trainers and gyms connect with
            people who are ready to take the next step.
          </p>

          <div className="mt-7 flex items-start gap-3">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-brand-lime" />
            <p className="text-sm text-gray-300">
              One platform to discover gyms and personal trainers.
            </p>
          </div>

          <div className="mt-4 flex items-start gap-3">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-brand-lime" />
            <p className="text-sm text-gray-300">
              More opportunities for fitness professionals.
            </p>
          </div>

          <div className="mt-4 flex items-start gap-3">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-brand-lime" />
            <p className="text-sm text-gray-300">
              A simpler way to explore fitness options.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="border-y border-white/[0.06] bg-brand-card/40">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">
              Our Mission
            </span>

            <h2 className="mt-5 text-3xl font-extrabold leading-tight text-brand-cream sm:text-5xl">
              Helping everyone find their
              <span className="text-brand-lime"> fitness fit.</span>
            </h2>

            <p className="mt-6 text-sm leading-7 text-gray-400 sm:text-base">
              Our mission is to make fitness discovery simpler by
              connecting individuals with gyms and trainers that
              match their goals, preferences, and lifestyle.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Target,
                title: "Discover",
                description:
                  "Explore different gyms and training professionals in one place.",
              },
              {
                icon: Users,
                title: "Connect",
                description:
                  "Make meaningful connections between clients, trainers, and gyms.",
              },
              {
                icon: HeartPulse,
                title: "Progress",
                description:
                  "Take the next step towards a healthier and more active lifestyle.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/[0.07] bg-brand-card p-7 transition hover:-translate-y-1 hover:border-brand-lime/30"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-lime/10">
                    <Icon size={23} className="text-brand-lime" />
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-brand-cream">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-400">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">
            What We Do
          </p>

          <h2 className="mt-5 text-3xl font-extrabold text-brand-cream sm:text-4xl">
            Everything starts with
            <span className="text-brand-lime"> the right connection.</span>
          </h2>

          <p className="mt-5 text-sm leading-7 text-gray-400">
            Whether you're looking for a place to train or offering
            professional fitness services, FitX Lanka helps bring
            the fitness community together.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="group overflow-hidden rounded-3xl border border-white/[0.07] bg-brand-card">
            <div className="relative h-64 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1000&q=85"
                alt="Personal trainer coaching a client"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="p-7 sm:p-9">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-lime">
                For Individuals
              </p>

              <h3 className="mt-3 text-2xl font-bold text-brand-cream">
                Find your next training partner.
              </h3>

              <p className="mt-4 text-sm leading-7 text-gray-400">
                Discover personal trainers and gyms, explore available
                options, and send booking or membership enquiries
                through one platform.
              </p>

              <Link
                href="/trainers"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-brand-lime transition hover:text-brand-cream"
              >
                Explore Trainers
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>

          <div className="group overflow-hidden rounded-3xl border border-white/[0.07] bg-brand-card">
            <div className="relative h-64 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1000&q=85"
                alt="Modern gym training facilities"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="p-7 sm:p-9">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-lime">
                For Fitness Professionals
              </p>

              <h3 className="mt-3 text-2xl font-bold text-brand-cream">
                Grow your fitness presence.
              </h3>

              <p className="mt-4 text-sm leading-7 text-gray-400">
                Personal trainers and gym owners can apply to join
                FitX Lanka, showcase their services, and connect
                with potential clients.
              </p>

              <Link
                href="/register"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-brand-lime transition hover:text-brand-cream"
              >
                Get Started
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* VISION */}
      <section className="relative overflow-hidden border-y border-white/[0.06] bg-brand-card/40">
        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-brand-lime/[0.06] blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-10 lg:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">
              Our Vision
            </p>

            <h2 className="mt-5 text-3xl font-extrabold leading-tight text-brand-cream sm:text-5xl">
              A stronger fitness community,
              <span className="text-brand-lime"> together.</span>
            </h2>

            <p className="mt-6 text-sm leading-7 text-gray-400">
              We envision a future where discovering fitness
              opportunities is easier for everyone. We want to
              support a connected fitness community across Sri Lanka,
              where individuals and fitness professionals can grow
              together.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1100&q=85"
              alt="Athlete working towards fitness goals"
              width={1100}
              height={750}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="h-[320px] w-full object-cover sm:h-[420px]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <div className="absolute bottom-7 left-7">
              <Trophy size={28} className="text-brand-lime" />
              <p className="mt-3 text-2xl font-bold text-white">
                Every goal starts somewhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="relative overflow-hidden rounded-3xl border border-brand-lime/20 bg-brand-card px-7 py-14 text-center sm:px-12 sm:py-20">
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-lime/10 blur-3xl" />

          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-lime/10">
              <Dumbbell size={27} className="text-brand-lime" />
            </div>

            <h2 className="mx-auto mt-7 max-w-2xl text-3xl font-extrabold leading-tight text-brand-cream sm:text-5xl">
              Your fitness journey deserves the
              <span className="text-brand-lime"> right connections.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-gray-400">
              Explore gyms, discover personal trainers, and find
              opportunities to move closer to your goals.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link
                href="/trainers"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-lime px-6 py-3.5 text-sm font-bold text-brand-background transition hover:bg-brand-cream"
              >
                Explore FitX Lanka
                <ArrowUpRight size={17} />
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3.5 text-sm font-semibold text-brand-cream transition hover:border-brand-lime/40 hover:text-brand-lime"
              >
                Create an Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
