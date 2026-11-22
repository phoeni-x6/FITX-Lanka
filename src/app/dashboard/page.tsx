
import Link from "next/link";
import {
  LayoutDashboard,
  Search,
  Dumbbell,
  CalendarDays,
  Bell,
  UserRound,
  Settings,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  XCircle,
  Plus,
  MapPin,
} from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard, active: true },
  { name: "Find Trainers", href: "/trainers", icon: Dumbbell },
  { name: "Explore Gyms", href: "/gyms", icon: Search },
  { name: "My Bookings", href: "/bookings", icon: CalendarDays },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "My Profile", href: "/profile", icon: UserRound },
  { name: "Settings", href: "/settings", icon: Settings },
];

const stats = [
  {
    label: "Total Bookings",
    value: "0",
    description: "All your booking requests",
    icon: CalendarDays,
  },
  {
    label: "Pending Requests",
    value: "0",
    description: "Waiting for a response",
    icon: Clock3,
  },
  {
    label: "Accepted",
    value: "0",
    description: "Confirmed requests",
    icon: CheckCircle2,
  },
  {
    label: "Rejected",
    value: "0",
    description: "Declined requests",
    icon: XCircle,
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-brand-background text-brand-cream">

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.07] bg-[#1C201D] lg:flex">
        <Link href="/" className="flex h-20 items-center gap-3 border-b border-white/[0.07] px-7">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime text-brand-background">
            <Dumbbell size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold">
              FitX <span className="text-brand-lime">Lanka</span>
            </h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500">
              Client Dashboard
            </p>
          </div>
        </Link>

        <div className="flex-1 px-4 py-8">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    item.active
                      ? "bg-brand-lime text-brand-background"
                      : "text-gray-400 hover:bg-white/[0.05] hover:text-brand-cream"
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/[0.07] p-5">
          <div className="mb-4 rounded-xl bg-white/[0.04] p-4">
            <p className="text-xs font-semibold text-brand-cream">
              Ready to get started?
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Find the right trainer or gym for your goals.
            </p>
            <Link
              href="/trainers"
              className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-brand-lime hover:underline"
            >
              Explore trainers <ArrowUpRight size={14} />
            </Link>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64">

        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-brand-background/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-5 sm:px-8">
            <div>
              <p className="text-xs text-gray-500">Your fitness journey</p>
              <p className="text-sm font-semibold text-brand-cream">
                Client Dashboard
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/notifications"
                aria-label="Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-gray-400 transition hover:border-brand-lime hover:text-brand-lime"
              >
                <Bell size={18} />
              </Link>

              <Link
                href="/profile"
                aria-label="My profile"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime"
              >
                <UserRound size={19} />
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

          {/* Welcome section */}
          <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#222923] p-7 sm:p-10">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-lime/20 bg-brand-lime/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-lime">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-lime" />
                Your fitness starts here
              </span>

              <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">
                Welcome to your
                <span className="block text-brand-lime">fitness journey.</span>
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-7 text-gray-400">
                Find trusted personal trainers, explore gyms, and manage your
                fitness booking requests — all in one place.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/trainers"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-lime px-5 py-3 text-sm font-bold text-brand-background transition hover:bg-[#d5ff7b]"
                >
                  Find a Trainer <ArrowUpRight size={17} />
                </Link>

                <Link
                  href="/gyms"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-brand-cream transition hover:border-brand-lime hover:text-brand-lime"
                >
                  Explore Gyms
                </Link>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full bg-brand-lime/[0.07] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 right-20 h-64 w-64 rounded-full bg-brand-lime/[0.05] blur-3xl" />
          </section>

          {/* Statistics */}
          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-lg font-bold">Your activity</h2>
              <p className="mt-1 text-sm text-gray-500">
                A quick overview of your fitness bookings.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/[0.07] bg-brand-card p-5 transition hover:border-brand-lime/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                        <Icon size={19} />
                      </div>
                      <span className="text-2xl font-extrabold tabular-nums">
                        {stat.value}
                      </span>
                    </div>

                    <h3 className="mt-5 text-sm font-semibold">
                      {stat.label}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {stat.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bookings and quick actions */}
          <section className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-3">

            {/* Recent bookings */}
            <div className="rounded-2xl border border-white/[0.07] bg-brand-card p-6 xl:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Recent bookings</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Keep track of your latest requests.
                  </p>
                </div>

                <Link
                  href="/bookings"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-lime hover:underline"
                >
                  View all <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-5 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-gray-500">
                  <CalendarDays size={25} />
                </div>

                <h3 className="mt-5 text-sm font-bold">
                  No bookings yet
                </h3>

                <p className="mt-2 max-w-sm text-xs leading-6 text-gray-500">
                  Your trainer booking requests and gym enquiries will appear
                  here once you get started.
                </p>

                <Link
                  href="/trainers"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-lime px-4 py-2.5 text-xs font-bold text-brand-background transition hover:bg-[#d5ff7b]"
                >
                  Find your first trainer <Plus size={15} />
                </Link>
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-white/[0.07] bg-brand-card p-6">
              <h2 className="text-lg font-bold">Quick actions</h2>
              <p className="mt-1 text-xs text-gray-500">
                What would you like to do today?
              </p>

              <div className="mt-6 space-y-3">
                <Link
                  href="/trainers"
                  className="group flex items-center gap-4 rounded-xl border border-white/[0.07] p-4 transition hover:border-brand-lime/40 hover:bg-white/[0.02]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                    <Dumbbell size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Find Trainers</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Connect with professionals
                    </p>
                  </div>
                  <ArrowUpRight size={16} className="text-gray-500 transition group-hover:text-brand-lime" />
                </Link>

                <Link
                  href="/gyms"
                  className="group flex items-center gap-4 rounded-xl border border-white/[0.07] p-4 transition hover:border-brand-lime/40 hover:bg-white/[0.02]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                    <MapPin size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Explore Gyms</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Discover gyms near you
                    </p>
                  </div>
                  <ArrowUpRight size={16} className="text-gray-500 transition group-hover:text-brand-lime" />
                </Link>

                <Link
                  href="/profile"
                  className="group flex items-center gap-4 rounded-xl border border-white/[0.07] p-4 transition hover:border-brand-lime/40 hover:bg-white/[0.02]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                    <UserRound size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">My Profile</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Manage your account details
                    </p>
                  </div>
                  <ArrowUpRight size={16} className="text-gray-500 transition group-hover:text-brand-lime" />
                </Link>
              </div>
            </div>
          </section>

          {/* Bottom note */}
          <div className="mt-8 flex flex-col gap-2 rounded-2xl border border-brand-lime/10 bg-brand-lime/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                Small steps. Big progress.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Your next fitness opportunity is just around the corner.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-lime hover:underline"
            >
              Back to FitX Lanka <ArrowUpRight size={14} />
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
