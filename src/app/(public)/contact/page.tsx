
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  Mail,
  MessageCircle,
  Send,
  MapPin,
  Clock,
  Dumbbell,
  ChevronDown,
} from "lucide-react";

import { FaInstagram, FaFacebookF } from "react-icons/fa";

const faqs = [
  {
    question: "How can I find a personal trainer?",
    answer:
      "Visit our Trainers page to explore available trainers. You can search by location and specialty to find someone who matches your fitness goals.",
  },
  {
    question: "How can I list my gym on FitX Lanka?",
    answer:
      "Create an account and apply as a gym owner. Once your application is reviewed and approved, you can create and manage your gym listing.",
  },
  {
    question: "Is FitX Lanka free to use?",
    answer:
      "FitX Lanka is launching with free access to its core platform features. Any future changes to pricing will be communicated clearly.",
  },
  {
    question: "How do booking requests work?",
    answer:
      "You can send a request to a trainer or gym. The provider can then review and accept or reject your request.",
  },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(199,243,107,0.12),_transparent_45%)]" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-lime/20 bg-brand-lime/[0.08] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-lime">
            <MessageCircle size={14} />
            Get in touch
          </span>

          <h1 className="mt-7 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-brand-cream sm:text-5xl lg:text-7xl">
            Let's start a
            <br />
            <span className="text-brand-lime">conversation.</span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
            Have a question, suggestion, or want to work with us?
            We'd love to hear from you. Reach out and let's connect.
          </p>
        </div>
      </section>

      {/* CONTACT INFORMATION + FORM */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-10 lg:py-24">
        {/* CONTACT DETAILS */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">
            Contact information
          </p>

          <h2 className="mt-4 text-3xl font-extrabold text-brand-cream">
            We're here to help.
          </h2>

          <p className="mt-4 text-sm leading-7 text-gray-400">
            Whether you're a fitness enthusiast, trainer, or gym owner,
            feel free to contact us. We'll be happy to hear from you.
          </p>

          <div className="mt-9 space-y-5">
            {/* EMAIL */}
            <div className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-brand-card p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10">
                <Mail size={20} className="text-brand-lime" />
              </div>

              <div>
                <p className="text-sm font-bold text-brand-cream">
                  Email us
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  For general enquiries and support.
                </p>
                <p className="mt-2 text-sm font-semibold text-brand-lime">
                  support@fitxlanka.com
                </p>
              </div>
            </div>

            {/* LOCATION */}
            <div className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-brand-card p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10">
                <MapPin size={20} className="text-brand-lime" />
              </div>

              <div>
                <p className="text-sm font-bold text-brand-cream">
                  Location
                </p>
                <p className="mt-1 text-xs leading-6 text-gray-400">
                  Sri Lanka
                  <br />
                  Connecting the fitness community nationwide.
                </p>
              </div>
            </div>

            {/* RESPONSE TIME */}
            <div className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-brand-card p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-lime/10">
                <Clock size={20} className="text-brand-lime" />
              </div>

              <div>
                <p className="text-sm font-bold text-brand-cream">
                  Response time
                </p>
                <p className="mt-1 text-xs leading-6 text-gray-400">
                  We'll aim to respond to enquiries as soon as possible.
                </p>
              </div>
            </div>
          </div>

          {/* SOCIAL LINKS */}
          <div className="mt-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Follow FitX Lanka
            </p>

            <div className="mt-4 flex gap-3">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-gray-400 transition hover:border-brand-lime/40 hover:bg-brand-lime/10 hover:text-brand-lime"
              >
                <FaInstagram size={19} />
              </a>

              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-gray-400 transition hover:border-brand-lime/40 hover:bg-brand-lime/10 hover:text-brand-lime"
              >
                <FaFacebookF size={17} />
              </a>
            </div>
          </div>
        </div>

        {/* CONTACT FORM */}
        <div className="rounded-3xl border border-white/[0.07] bg-brand-card p-6 sm:p-9">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">
              Send a message
            </p>

            <h2 className="mt-3 text-2xl font-bold text-brand-cream">
              We'd love to hear from you.
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Fill out the form and tell us how we can help.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Contact form submission will be enabled soon.");
            }}
            className="space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-300">
                  Your name
                </label>

                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-white/10 bg-brand-background px-4 py-3.5 text-sm text-brand-cream outline-none transition placeholder:text-gray-600 focus:border-brand-lime/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-300">
                  Email address
                </label>

                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-brand-background px-4 py-3.5 text-sm text-brand-cream outline-none transition placeholder:text-gray-600 focus:border-brand-lime/50"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-300">
                Subject
              </label>

              <select
                required
                defaultValue=""
                className="w-full rounded-xl border border-white/10 bg-brand-background px-4 py-3.5 text-sm text-brand-cream outline-none transition focus:border-brand-lime/50"
              >
                <option value="" disabled>
                  Select a subject
                </option>
                <option>General enquiry</option>
                <option>Technical support</option>
                <option>Trainer application</option>
                <option>Gym partnership</option>
                <option>Feedback or suggestions</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-300">
                Your message
              </label>

              <textarea
                required
                rows={6}
                placeholder="Tell us how we can help..."
                className="w-full resize-none rounded-xl border border-white/10 bg-brand-background px-4 py-3.5 text-sm text-brand-cream outline-none transition placeholder:text-gray-600 focus:border-brand-lime/50"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-lime px-6 py-4 text-sm font-bold text-brand-background transition hover:bg-brand-cream"
            >
              Send Message
              <Send size={16} />
            </button>

            <p className="text-center text-[11px] leading-5 text-gray-500">
              Your information will only be used to respond to your enquiry.
            </p>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/[0.06] bg-brand-card/30">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 lg:px-10">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">
              FAQs
            </p>

            <h2 className="mt-4 text-3xl font-extrabold text-brand-cream sm:text-4xl">
              Frequently asked questions.
            </h2>

            <p className="mt-4 text-sm text-gray-400">
              Quick answers to common questions about FitX Lanka.
            </p>
          </div>

          <div className="mt-12 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border border-white/[0.07] bg-brand-card"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(isOpen ? null : index)
                    }
                    className="flex w-full items-center justify-between gap-5 p-5 text-left sm:p-6"
                  >
                    <span className="text-sm font-semibold text-brand-cream sm:text-base">
                      {faq.question}
                    </span>

                    <ChevronDown
                      size={19}
                      className={`shrink-0 text-brand-lime transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6">
                      <p className="text-sm leading-7 text-gray-400">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-brand-lime/20 bg-brand-card p-8 text-center sm:p-10 lg:flex-row lg:text-left">
          <div>
            <div className="flex items-center justify-center gap-2 text-brand-lime lg:justify-start">
              <Dumbbell size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">
                FitX Lanka
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-extrabold text-brand-cream sm:text-3xl">
              Ready to take your next step?
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Discover trainers and gyms that match your goals.
            </p>
          </div>

          <Link
            href="/trainers"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-lime px-6 py-3.5 text-sm font-bold text-brand-background transition hover:bg-brand-cream"
          >
            Explore Now
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
