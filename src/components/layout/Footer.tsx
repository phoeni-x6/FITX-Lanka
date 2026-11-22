
import Link from "next/link";
import { Dumbbell, ArrowUpRight } from "lucide-react";
import { FaInstagram, FaFacebookF } from "react-icons/fa";

const footerLinks = {
  platform: [
    { name: "Find Trainers", href: "/trainers" },
    { name: "Explore Gyms", href: "/gyms" },
    { name: "About Us", href: "/about" },
  ],
  account: [
    { name: "Login", href: "/login" },
    { name: "Create Account", href: "/register" },
    { name: "My Dashboard", href: "/dashboard" },
  ],
  support: [
    { name: "Contact Us", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-brand-background">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-lime text-brand-background">
                <Dumbbell size={23} strokeWidth={2.5} />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-brand-cream">
                  FitX <span className="text-brand-lime">Lanka</span>
                </h2>
                <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-gray-500">
                  Fitness Marketplace
                </p>
              </div>
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-7 text-gray-400">
              Your goals. Your people. Your move.
              Discover trusted fitness trainers and gyms across Sri Lanka
              and take the next step in your fitness journey.
            </p>

            {/* Social links */}
            <div className="mt-7 flex items-center gap-3">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-gray-400 transition hover:border-brand-lime hover:text-brand-lime"
              >
                <FaInstagram size={18} />
              </a>

              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-gray-400 transition hover:border-brand-lime hover:text-brand-lime"
              >
                <FaFacebookF size={17} />
              </a>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="mb-5 text-sm font-bold text-brand-cream">
              Platform
            </h3>

            <ul className="space-y-4">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition hover:text-brand-lime"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h3 className="mb-5 text-sm font-bold text-brand-cream">
              Account
            </h3>

            <ul className="space-y-4">
              {footerLinks.account.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition hover:text-brand-lime"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="mb-5 text-sm font-bold text-brand-cream">
              Support
            </h3>

            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition hover:text-brand-lime"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/[0.07] pt-7 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} FitX Lanka. All rights reserved.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 transition hover:text-brand-lime"
          >
            Back to top
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
