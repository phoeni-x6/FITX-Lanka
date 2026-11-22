
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  MapPin,
  Award,
  ArrowLeft,
  Loader2,
  Dumbbell,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Qualification = {
  id: string;
  qualification_name: string;
  institution: string;
  year_obtained: number | null;
};

type TrainerApplication = {
  id: string;
  full_name: string;
  specialty: string;
  specialties: string[];
  bio: string | null;
  location: string;
  locations: string[];
  experience_years: number;
  price_per_session: number | null;
  profile_image_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
};

export default function TrainerApplicationStatusPage() {
  const supabase = createClient();

  const [application, setApplication] =
    useState<TrainerApplication | null>(null);

  const [qualifications, setQualifications] =
    useState<Qualification[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplication() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setError("Please log in to view your application.");
          return;
        }

        const { data, error: applicationError } = await supabase
          .from("trainer_applications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (applicationError) {
          throw applicationError;
        }

        if (!data) {
          setApplication(null);
          return;
        }

        setApplication(data as TrainerApplication);

        const {
          data: qualificationData,
          error: qualificationError,
        } = await supabase
          .from("trainer_application_qualifications")
          .select("*")
          .eq("application_id", data.id)
          .order("created_at", { ascending: true });

        if (qualificationError) {
          throw qualificationError;
        }

        setQualifications(
          (qualificationData || []) as Qualification[]
        );
      } catch (err) {
        console.error("Application status error:", err);
        setError("Unable to load your application. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, []);

  const status = application?.status?.toLowerCase();

  const statusConfig = {
    pending: {
      title: "Application Under Review",
      description:
        "Your application has been received. Our team is reviewing your details and qualifications.",
      icon: Clock,
      color: "text-yellow-400",
      background: "bg-yellow-400/10",
      border: "border-yellow-400/20",
    },
    approved: {
      title: "Application Approved!",
      description:
        "Congratulations! Your trainer application has been approved. You can now access your trainer dashboard.",
      icon: CheckCircle2,
      color: "text-brand-lime",
      background: "bg-brand-lime/10",
      border: "border-brand-lime/20",
    },
    rejected: {
      title: "Application Not Approved",
      description:
        "Unfortunately, your application was not approved at this time. Please review the feedback below.",
      icon: XCircle,
      color: "text-red-400",
      background: "bg-red-400/10",
      border: "border-red-400/20",
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || {
      title: "Application Status",
      description: "Your application status is being updated.",
      icon: Clock,
      color: "text-gray-400",
      background: "bg-white/5",
      border: "border-white/10",
    };

  const StatusIcon = config.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center px-6">
        <div className="text-center">
          <Loader2 className="w-9 h-9 text-brand-lime animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">
            Loading your application...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-brand-card border border-white/10 rounded-2xl p-8 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />

          <h1 className="text-xl font-bold text-brand-cream mb-3">
            Unable to load application
          </h1>

          <p className="text-gray-400 text-sm mb-6">
            {error}
          </p>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-brand-lime px-6 py-3 font-semibold text-brand-background"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-brand-background px-6 py-20">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-lime/10 flex items-center justify-center mx-auto mb-6">
            <Dumbbell className="w-8 h-8 text-brand-lime" />
          </div>

          <h1 className="text-3xl font-bold text-brand-cream mb-4">
            No Application Found
          </h1>

          <p className="text-gray-400 mb-8">
            You haven't submitted a trainer application yet.
            Complete your application to start your journey with FitX Lanka.
          </p>

          <Link
            href="/trainers/apply"
            className="inline-flex items-center justify-center rounded-xl bg-brand-lime px-7 py-3.5 font-bold text-brand-background hover:bg-white transition"
          >
            Apply as a Trainer
          </Link>
        </div>
      </div>
    );
  }

  const specialties =
    application.specialties?.length > 0
      ? application.specialties
      : [application.specialty];

  const locations =
    application.locations?.length > 0
      ? application.locations
      : [application.location];

  return (
    <div className="min-h-screen bg-brand-background px-5 py-12 md:px-8 md:py-16">
      <div className="max-w-4xl mx-auto">

        {/* Back navigation */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-lime transition mb-8"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Page heading */}
        <div className="mb-10">
          <p className="text-brand-lime text-xs font-bold uppercase tracking-[0.2em] mb-3">
            Trainer Application
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-brand-cream mb-3">
            Application Status
          </h1>

          <p className="text-gray-400">
            Track the progress of your FitX Lanka trainer application.
          </p>
        </div>

        {/* Status card */}
        <div
          className={`rounded-2xl border ${config.border} ${config.background} p-6 md:p-8 mb-8`}
        >
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-14 h-14 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
              <StatusIcon className={`w-7 h-7 ${config.color}`} />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h2 className={`text-xl md:text-2xl font-bold ${config.color}`}>
                  {config.title}
                </h2>

                <span className="text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-black/20 text-brand-cream">
                  {application.status}
                </span>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed">
                {config.description}
              </p>

              <p className="text-gray-500 text-xs mt-4">
                Submitted on{" "}
                {new Date(application.created_at).toLocaleDateString(
                  "en-LK",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Admin feedback */}
        {status === "rejected" && application.admin_notes && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6 mb-8">
            <h3 className="text-red-400 font-semibold mb-2">
              Admin Feedback
            </h3>

            <p className="text-gray-300 text-sm leading-relaxed">
              {application.admin_notes}
            </p>
          </div>
        )}

        {/* Application details */}
        <div className="bg-brand-card border border-white/10 rounded-2xl p-6 md:p-8 mb-8">

          <div className="flex items-center gap-3 mb-7">
            <FileText className="text-brand-lime" size={21} />

            <h2 className="text-lg font-bold text-brand-cream">
              Application Details
            </h2>
          </div>

          {/* Profile image and name */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-8 pb-8 border-b border-white/10">
            <div className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-brand-background flex items-center justify-center">
              {application.profile_image_url ? (
                <img
                  src={application.profile_image_url}
                  alt={`${application.full_name}'s profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserRound
                  size={42}
                  className="text-gray-500"
                />
              )}
            </div>

            <div className="text-center sm:text-left">
              <p className="text-xs text-gray-500 mb-2">
                Applicant
              </p>

              <h3 className="text-xl font-bold text-brand-cream">
                {application.full_name}
              </h3>

              <p className="text-sm text-gray-400 mt-2">
                Trainer applicant
              </p>

              {application.profile_image_url && (
                <p className="text-xs text-brand-lime mt-3">
                  Profile image uploaded
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div>
              <p className="text-xs text-gray-500 mb-2">
                Full Name
              </p>

              <p className="text-brand-cream font-medium">
                {application.full_name}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">
                Experience
              </p>

              <p className="text-brand-cream font-medium">
                {application.experience_years} years
              </p>
            </div>

            {/* Specialties */}
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500 mb-3">
                Specialties
              </p>

              <div className="flex flex-wrap gap-2">
                {specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="px-3 py-2 rounded-lg bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500 mb-3">
                Training Locations
              </p>

              <div className="flex flex-wrap gap-2">
                {locations.map((location) => (
                  <span
                    key={location}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm"
                  >
                    <MapPin size={14} className="text-brand-lime" />
                    {location}
                  </span>
                ))}
              </div>
            </div>

            {/* Price */}
            {application.price_per_session !== null && (
              <div>
                <p className="text-xs text-gray-500 mb-2">
                  Price per Session
                </p>

                <p className="text-brand-cream font-medium">
                  LKR{" "}
                  {Number(
                    application.price_per_session
                  ).toLocaleString("en-LK")}
                </p>
              </div>
            )}

            {/* Application ID */}
            <div>
              <p className="text-xs text-gray-500 mb-2">
                Application ID
              </p>

              <p className="text-gray-400 text-xs break-all">
                {application.id}
              </p>
            </div>
          </div>

          {/* Professional bio */}
          {application.bio && (
            <div className="mt-7 pt-6 border-t border-white/10">
              <p className="text-xs text-gray-500 mb-3">
                Professional Bio
              </p>

              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {application.bio}
              </p>
            </div>
          )}
        </div>

        {/* Qualifications */}
        <div className="bg-brand-card border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-7">
            <Award className="text-brand-lime" size={21} />

            <h2 className="text-lg font-bold text-brand-cream">
              Qualifications
            </h2>
          </div>

          {qualifications.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No qualifications were added to this application.
            </p>
          ) : (
            <div className="space-y-4">
              {qualifications.map((qualification) => (
                <div
                  key={qualification.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <h3 className="text-brand-cream font-semibold">
                    {qualification.qualification_name}
                  </h3>

                  <p className="text-gray-400 text-sm mt-1">
                    {qualification.institution}
                  </p>

                  {qualification.year_obtained && (
                    <p className="text-gray-500 text-xs mt-2">
                      Year obtained: {qualification.year_obtained}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved application */}
        {status === "approved" && (
          <Link
            href="/trainers/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-brand-lime px-7 py-3.5 font-bold text-brand-background hover:bg-white transition"
          >
            Go to Trainer Dashboard
          </Link>
        )}

        {/* Rejected application */}
        {status === "rejected" && (
          <Link
            href="/trainers/apply"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-brand-lime px-7 py-3.5 font-bold text-brand-background hover:bg-white transition"
          >
            Submit a New Application
          </Link>
        )}

      </div>
    </div>
  );
}
