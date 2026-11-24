
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  BriefcaseBusiness,
  Wallet,
  Dumbbell,
  Loader2,
  AlertCircle,
  UserRound,
  CalendarDays,
  ArrowRight,
  GraduationCap,
  Award,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type TrainerProfile = {
  id: string;
  user_id: string;
  full_name: string;
  specialty: string;
  bio: string | null;
  location: string;
  experience_years: number;
  price_per_session: number | null;
  profile_image_url: string | null;
  specialties: string[] | null;
  locations: string[] | null;
};

type Qualification = {
  qualification_id: string;
  qualification_name: string;
  institution: string;
  year_obtained: number | null;
};

export default function TrainerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id as string;

  const supabase = useMemo(() => createClient(), []);

  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTrainer = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("trainer_profiles")
      .select(
        "id, user_id, full_name, specialty, bio, location, experience_years, price_per_session, profile_image_url, specialties, locations"
      )
      .eq("id", trainerId)
      .eq("is_approved", true)
      .maybeSingle();

    if (fetchError) {
      console.error("Error loading trainer:", fetchError);
      setError("Unable to load this trainer profile.");
      setTrainer(null);
      setQualifications([]);
      setLoading(false);
      return;
    }

    if (!data) {
      setError("This trainer profile is unavailable.");
      setTrainer(null);
      setQualifications([]);
      setLoading(false);
      return;
    }

    setTrainer(data as TrainerProfile);

    const { data: qualificationData, error: qualificationError } =
      await supabase.rpc("get_public_trainer_qualifications", {
        p_trainer_profile_id: trainerId,
      });

    if (qualificationError) {
      console.error(
        "Error loading trainer qualifications:",
        qualificationError
      );
      setQualifications([]);
    } else {
      setQualifications((qualificationData ?? []) as Qualification[]);
    }

    setLoading(false);
  }, [supabase, trainerId]);

  useEffect(() => {
    if (trainerId) {
      loadTrainer();
    }
  }, [trainerId, loadTrainer]);

  const handleBooking = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.push(
        `/login?redirectTo=${encodeURIComponent(
          `/bookings?trainer=${trainerId}`
        )}`
      );
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile check failed:", profileError);
      alert("Unable to verify your account. Please try again.");
      return;
    }

    if (profile?.role !== "client") {
      alert("Only client accounts can request trainer bookings.");
      return;
    }

    router.push(`/bookings?trainer=${trainerId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-background text-brand-cream">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="animate-spin text-brand-lime" />
          <p className="text-sm text-gray-400">
            Loading trainer profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !trainer) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-background px-5 text-center text-brand-cream">
        <AlertCircle size={40} className="text-red-400" />
        <h1 className="mt-5 text-xl font-bold">Trainer unavailable</h1>
        <p className="mt-2 text-sm text-gray-400">
          {error || "We couldn't find this trainer."}
        </p>
        <Link
          href="/trainers"
          className="mt-6 rounded-xl bg-brand-lime px-5 py-3 text-sm font-bold text-brand-background"
        >
          Browse Trainers
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-brand-background text-brand-cream">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
        <Link
          href="/trainers"
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-brand-lime"
        >
          <ArrowLeft size={16} />
          Back to Trainers
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-brand-card">
            <div className="relative h-72 bg-[#2a302b] sm:h-96">
              {trainer.profile_image_url ? (
                <img
                  src={trainer.profile_image_url}
                  alt={trainer.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <UserRound size={90} className="text-gray-600" />
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">
                Personal Trainer
              </p>

              <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                {trainer.full_name}
              </h1>

              <p className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                <MapPin size={16} className="text-brand-lime" />
                {trainer.location}, Sri Lanka
              </p>

              <div className="mt-7 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                  <BriefcaseBusiness size={20} className="text-brand-lime" />
                  <p className="mt-3 text-xs text-gray-500">Experience</p>
                  <p className="mt-1 font-bold">
                    {trainer.experience_years} years
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                  <Wallet size={20} className="text-brand-lime" />
                  <p className="mt-3 text-xs text-gray-500">
                    Price per session
                  </p>
                  <p className="mt-1 font-bold text-brand-lime">
                    {trainer.price_per_session !== null
                      ? `Rs. ${Number(
                          trainer.price_per_session
                        ).toLocaleString("en-LK")}`
                      : "Contact for price"}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-bold">About the Trainer</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-400">
                  {trainer.bio || "This trainer hasn't added a bio yet."}
                </p>
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-bold">Specialties</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(trainer.specialties?.length
                    ? trainer.specialties
                    : [trainer.specialty]
                  ).map((item) => (
                    <span
                      key={item}
                      className="rounded-lg border border-brand-lime/20 bg-brand-lime/5 px-3 py-2 text-xs font-medium text-brand-lime"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {trainer.locations && trainer.locations.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-bold">Available Locations</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {trainer.locations.map((item) => (
                      <span
                        key={item}
                        className="rounded-lg bg-white/[0.05] px-3 py-2 text-xs text-gray-400"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Qualifications */}
              <div className="mt-10 border-t border-white/[0.08] pt-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-lime/10">
                    <GraduationCap size={23} className="text-brand-lime" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Qualifications & Certifications
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Professional education and credentials
                    </p>
                  </div>
                </div>

                {qualifications.length > 0 ? (
                  <div className="mt-6 space-y-4">
                    {qualifications.map((qualification) => (
                      <div
                        key={qualification.qualification_id}
                        className="flex gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-lime/10">
                          <Award size={20} className="text-brand-lime" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-brand-cream">
                            {qualification.qualification_name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-400">
                            {qualification.institution}
                          </p>

                          {qualification.year_obtained && (
                            <p className="mt-2 text-xs text-gray-500">
                              Obtained in {qualification.year_obtained}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl border border-white/[0.07] bg-white/[0.03] p-5 text-center">
                    <GraduationCap
                      size={28}
                      className="mx-auto text-gray-600"
                    />
                    <p className="mt-3 text-sm text-gray-400">
                      No qualifications have been added to this profile yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-white/[0.08] bg-brand-card p-6 sm:p-8 lg:sticky lg:top-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-lime/10">
                <Dumbbell size={23} className="text-brand-lime" />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Start your fitness journey
                </p>
                <h2 className="text-lg font-bold">Book a Session</h2>
              </div>
            </div>

            <p className="mt-6 text-sm leading-6 text-gray-400">
              Send a booking request to this trainer. They can review your
              preferred time and accept or reject your request.
            </p>

            <div className="mt-6 border-y border-white/[0.08] py-5">
              <p className="text-xs text-gray-500">Session price</p>
              <p className="mt-2 text-3xl font-extrabold text-brand-lime">
                {trainer.price_per_session !== null
                  ? `Rs. ${Number(
                      trainer.price_per_session
                    ).toLocaleString("en-LK")}`
                  : "Contact for price"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleBooking}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-lime px-5 py-4 text-sm font-extrabold text-brand-background transition hover:bg-brand-lime/90"
            >
              <CalendarDays size={18} />
              Book This Trainer
              <ArrowRight size={17} />
            </button>

            <p className="mt-4 text-center text-xs text-gray-500">
              Your booking is only confirmed after the trainer accepts it.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
