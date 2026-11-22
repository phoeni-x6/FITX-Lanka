
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Dumbbell,
  Users,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from "lucide-react";

const trainers = [
  {
    name: "Personal Training",
    category: "TRAINER DISCOVERY",
    description: "Find coaches who understand your goals.",
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&q=85",
    href: "/trainers",
    number: "01",
  },
  {
    name: "Fitness Facilities",
    category: "GYM DISCOVERY",
    description: "Discover gyms that match your lifestyle.",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=85",
    href: "/gyms",
    number: "02",
  },
];

const benefits = [
  {
    icon: Users,
    title: "The right people",
    description:
      "Discover fitness professionals and communities that align with your goals.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted providers",
    description:
      "Explore trainer and gym listings reviewed through our approval process.",
  },
  {
    icon: Zap,
    title: "Simple connections",
    description:
      "Send booking requests directly and let providers respond to you.",
  },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden bg-brand-background text-brand-cream">

      {/* HERO */}
      <section className="relative min-h-[720px] overflow-hidden lg:min-h-[780px]">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=2000&q=90')",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-brand-background via-brand-background/85 to-brand-background/20" />

        <div className="absolute inset-0 bg-gradient-to-t from-brand-background via-transparent to-brand-background/20" />

        <div className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-5 py-20 sm:px-8 lg:min-h-[780px] lg:px-10">

          <div className="max-w-3xl">

            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-lime/30 bg-brand-lime/10 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-brand-lime" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-lime">
                Your fitness journey starts here
              </span>
            </div>

            <h1 className="text-5xl font-black leading-[1.02] tracking-[-0.055em] sm:text-7xl lg:text-[88px]">
              FIND YOUR
              <br />
              <span className="text-brand-lime">FITNESS.</span>
              <br />
              FIND YOUR
              <br />
              PEOPLE.
            </h1>

            <p className="mt-8 max-w-lg text-base leading-8 text-gray-300 sm:text-lg">
              Discover personal trainers, explore gyms and connect
              with the right people to move your fitness journey forward.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

              <Link
                href="/trainers"
                className="group flex items-center justify-center gap-3 rounded-xl bg-brand-lime px-7 py-4 text-sm font-extrabold text-brand-background transition hover:bg-lime-300"
              >
                Explore Trainers
                <ArrowUpRight
                  size={18}
                  className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>

              <Link
                href="/gyms"
                className="flex items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/5 px-7 py-4 text-sm font-bold text-white backdrop-blur-md transition hover:border-brand-lime hover:text-brand-lime"
              >
                Explore Gyms
                <ArrowRight size={17} />
              </Link>

            </div>

            <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/10 pt-7">

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-lime">
                  DISCOVER
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Trainers & Gyms
                </p>
              </div>

              <div className="h-8 w-px bg-white/20" />

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-lime">
                  CONNECT
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Direct booking requests
                </p>
              </div>

              <div className="h-8 w-px bg-white/20" />

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-lime">
                  PROGRESS
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Your fitness journey
                </p>
              </div>

            </div>
          </div>

          {/* Floating hero label */}
          <div className="absolute bottom-16 right-10 hidden max-w-[210px] rounded-2xl border border-white/15 bg-black/40 p-5 backdrop-blur-xl xl:block">
            <Dumbbell className="mb-4 text-brand-lime" size={25} />
            <p className="text-xs font-bold uppercase tracking-widest text-brand-lime">
              FITX LANKA
            </p>
            <p className="mt-2 text-lg font-bold leading-snug">
              Your goals. Your people. Your move.
            </p>
          </div>

        </div>
      </section>

      {/* INTRO STRIP */}
      <section className="border-y border-white/[0.07] bg-brand-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">

          <p className="text-sm font-bold uppercase tracking-[0.15em] text-brand-cream">
            BUILT FOR EVERY FITNESS JOURNEY.
          </p>

          <p className="max-w-xl text-sm leading-6 text-gray-400">
            Whether you are starting out, building strength or
            taking your coaching career further, find your place here.
          </p>

        </div>
      </section>

      {/* DISCOVERY */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10 lg:py-32">

        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-brand-lime">
              EXPLORE THE PLATFORM
            </p>

            <h2 className="max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              YOUR NEXT STEP
              <br />
              <span className="text-brand-lime">STARTS HERE.</span>
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-7 text-gray-400">
            Find the right environment and the right guidance.
            Everything you need to take your next step in fitness.
          </p>

        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {trainers.map((item) => (
            <Link
              href={item.href}
              key={item.number}
              className="group relative min-h-[390px] overflow-hidden rounded-2xl border border-white/10 bg-brand-card sm:min-h-[480px]"
            >

              <Image
                src={item.image}
                alt={item.name}
                fill
                unoptimized
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              <div className="absolute left-6 top-6 flex items-center gap-3">
                <span className="rounded-full border border-white/20 bg-black/40 px-4 py-2 text-[10px] font-bold tracking-[0.18em] text-brand-lime backdrop-blur">
                  {item.category}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-6 sm:p-9">

                <div>
                  <span className="text-xs font-bold text-brand-lime">
                    {item.number} / DISCOVER
                  </span>

                  <h3 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                    {item.name}
                  </h3>

                  <p className="mt-3 text-sm text-gray-300">
                    {item.description}
                  </p>
                </div>

                <div className="ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-lime text-brand-background transition group-hover:rotate-45">
                  <ArrowUpRight size={23} />
                </div>

              </div>
            </Link>
          ))}

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-brand-card py-24 lg:py-28">

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-brand-lime">
              SIMPLE BY DESIGN
            </p>

            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              LESS SEARCHING.
              <br />
              <span className="text-brand-lime">MORE MOVING.</span>
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-3">

            {[
              {
                number: "01",
                title: "Discover",
                description:
                  "Browse trainers and gyms to find options that match your fitness goals.",
              },
              {
                number: "02",
                title: "Connect",
                description:
                  "Choose a provider and send a booking or membership request.",
              },
              {
                number: "03",
                title: "Get moving",
                description:
                  "The provider reviews your request and responds with confirmation or rejection.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="border-t border-white/15 pt-7"
              >
                <span className="text-5xl font-black text-brand-lime/30">
                  {step.number}
                </span>

                <h3 className="mt-6 text-2xl font-bold">
                  {step.title}
                </h3>

                <p className="mt-4 max-w-sm text-sm leading-7 text-gray-400">
                  {step.description}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* WHY FITX */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10 lg:py-32">

        <div className="grid items-center gap-14 lg:grid-cols-2">

          <div className="relative min-h-[420px] overflow-hidden rounded-2xl sm:min-h-[560px]">

            <Image
              src="https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=1200&q=85"
              alt="Athlete training in a gym"
              fill
              unoptimized
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">
                YOUR JOURNEY. YOUR RULES.
              </p>
              <p className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                BUILT AROUND
                <br />
                YOUR AMBITION.
              </p>
            </div>
          </div>

          <div>

            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-brand-lime">
              WHY FITX LANKA
            </p>

            <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              FITNESS IS
              <br />
              BETTER
              <br />
              <span className="text-brand-lime">TOGETHER.</span>
            </h2>

            <p className="mt-6 max-w-lg text-sm leading-8 text-gray-400">
              Finding the right gym or trainer should not be complicated.
              FitX Lanka brings fitness providers and people together
              through one simple platform.
            </p>

            <div className="mt-10 space-y-8">

              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div key={benefit.title} className="flex gap-5">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                      <Icon size={22} />
                    </div>

                    <div>
                      <h3 className="font-bold text-brand-cream">
                        {benefit.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-gray-400">
                        {benefit.description}
                      </p>
                    </div>

                  </div>
                );
              })}

            </div>

          </div>
        </div>
      </section>

      {/* PROVIDER CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-10 lg:pb-32">

        <div className="relative overflow-hidden rounded-3xl border border-brand-lime/20 bg-brand-card p-8 sm:p-12 lg:p-16">

          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-brand-lime/10 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-brand-lime">
                FOR FITNESS PROFESSIONALS
              </p>

              <h2 className="text-4xl font-black leading-tight sm:text-5xl">
                YOUR EXPERTISE.
                <br />
                <span className="text-brand-lime">YOUR OPPORTUNITY.</span>
              </h2>

              <p className="mt-6 max-w-lg text-sm leading-7 text-gray-400">
                Are you a personal trainer or gym owner?
                Join the FitX Lanka community and make it easier
                for people to discover your services.
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:items-end">

              <Link
                href="/register"
                className="group flex w-full items-center justify-between rounded-xl bg-brand-lime px-6 py-5 font-bold text-brand-background transition hover:bg-lime-300 sm:max-w-sm"
              >
                Join as a fitness provider
                <ArrowUpRight className="transition group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>

              <p className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle2 size={15} className="text-brand-lime" />
                Provider applications are reviewed before listing.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-white/10 bg-brand-lime px-5 py-20 text-center text-brand-background sm:py-24">

        <p className="text-xs font-black uppercase tracking-[0.25em]">
          YOUR NEXT CHAPTER STARTS NOW
        </p>

        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          YOUR GOALS.
          <br />
          YOUR PEOPLE.
          <br />
          YOUR MOVE.
        </h2>

        <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-brand-background/70">
          Find your fitness community and take the first step today.
        </p>

        <Link
          href="/register"
          className="mt-9 inline-flex items-center gap-3 rounded-xl bg-brand-background px-8 py-4 text-sm font-bold text-brand-cream transition hover:bg-black"
        >
          Get Started
          <ArrowUpRight size={18} />
        </Link>

      </section>

    </div>
  );
}
