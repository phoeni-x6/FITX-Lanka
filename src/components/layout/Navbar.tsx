
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Dumbbell,
  UserRound,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type UserProfile = {
  display_name: string;
  role: "client" | "trainer" | "gym_owner" | "admin";
};

const navigation = [
  { name: "Home", href: "/" },
  { name: "Trainers", href: "/trainers" },
  { name: "Gyms", href: "/gyms" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (profile) {
        setUser(profile as UserProfile);
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const getDashboardLink = () => {
    if (!user) return "/login";

    switch (user.role) {
      case "trainer":
        return "/trainers/dashboard";
      case "gym_owner":
        return "/gym/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/dashboard";
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error.message);
      return;
    }

    setUser(null);
    setMenuOpen(false);
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-brand-background/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime text-brand-background">
            <Dumbbell size={22} strokeWidth={2.5} />
          </div>

          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-brand-cream">
              FitX <span className="text-brand-lime">Lanka</span>
            </span>
            <span className="text-[9px] font-medium uppercase tracking-[0.25em] text-gray-500">
              Fitness Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-9 md:flex">
          {navigation.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition ${
                  active
                    ? "text-brand-lime"
                    : "text-gray-400 hover:text-brand-cream"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          {!loading && (
            <>
              {user ? (
                <>
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-brand-cream transition hover:border-brand-lime/50 hover:text-brand-lime"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-xl bg-brand-lime px-4 py-2.5 text-sm font-bold text-brand-background transition hover:bg-lime-300"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-xl px-4 py-2.5 text-sm font-medium text-brand-cream transition hover:text-brand-lime"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="rounded-xl bg-brand-lime px-5 py-2.5 text-sm font-bold text-brand-background transition hover:bg-lime-300"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-brand-cream md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="border-t border-white/[0.07] bg-brand-card px-5 py-5 md:hidden">
          <div className="flex flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                  pathname === item.href
                    ? "bg-brand-lime/10 text-brand-lime"
                    : "text-gray-300 hover:bg-white/5"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {!loading && (
            <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5">
              {user ? (
                <>
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-brand-cream"
                  >
                    <UserRound size={17} />
                    Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 rounded-xl bg-brand-lime px-4 py-3 text-sm font-bold text-brand-background"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-medium text-brand-cream"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="rounded-xl bg-brand-lime px-4 py-3 text-center text-sm font-bold text-brand-background"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
