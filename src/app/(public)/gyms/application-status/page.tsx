
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  MapPin,
  ArrowLeft,
  Loader2,
  Dumbbell,
  Building2,
  UserRound,
  Image as ImageIcon,
  Phone,
  Mail,
  Wallet,
  Clock3,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type GymApplication = {
  id: string;
  user_id: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  gym_name: string;
  description: string;
  location: string;
  address: string;
  city: string;
  district: string;
  contact_phone: string | null;
  monthly_price: number;
  facilities: string[] | null;
  services: string[] | null;
  opening_time: string | null;
  closing_time: string | null;
  cover_image_url: string | null;
  gallery_images: string[] | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
};

export default function GymApplicationStatusPage() {
  const supabase = createClient();

  const [application, setApplication] =
    useState<GymApplication | null>(null);

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
          .from("gym_applications")
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

        setApplication(data as GymApplication);
      } catch (err) {
        console.error("Gym application status error:", err);
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
        "Your gym application has been received. Our administration team is reviewing your business information and uploaded photos.",
      icon: Clock,
      color: "text-yellow-400",
      background: "bg-yellow-400/10",
      border: "border-yellow-400/20",
    },
    approved: {
      title: "Application Approved!",
      description:
        "Congratulations! Your gym application has been approved. You can now access your gym dashboard.",
      icon: CheckCircle2,
      color: "text-brand-lime",
      background: "bg-brand-lime/10",
      border: "border-brand-lime/20",
    },
    rejected: {
      title: "Application Not Approved",
      description:
        "Unfortunately, your gym application was not approved at this time. Please review the feedback below.",
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

  const formatTime = (time: string | null) => {
    if (!time) return "Not provided";

    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-LK", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatPrice = (price: number) =>
    Number(price).toLocaleString("en-LK");

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

          <p className="text-gray-400 text-sm mb-6">{error}</p>

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
            <Building2 className="w-8 h-8 text-brand-lime" />
          </div>

          <h1 className="text-3xl font-bold text-brand-cream mb-4">
            No Application Found
          </h1>

          <p className="text-gray-400 mb-8">
            You haven't submitted a gym application yet.
            Complete your application to list your gym on FitX Lanka.
          </p>

          <Link
            href="/gyms/apply"
            className="inline-flex items-center justify-center rounded-xl bg-brand-lime px-7 py-3.5 font-bold text-brand-background hover:bg-white transition"
          >
            Apply to List Your Gym
          </Link>
        </div>
      </div>
    );
  }

  const facilities = application.facilities || [];
  const services = application.services || [];
  const galleryImages = application.gallery_images || [];

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
            Gym Application
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-brand-cream mb-3">
            Application Status
          </h1>

          <p className="text-gray-400">
            Track the progress of your FitX Lanka gym application.
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

            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {application.admin_notes}
            </p>
          </div>
        )}

        {/* Gym details */}
        <div className="bg-brand-card border border-white/10 rounded-2xl p-6 md:p-8 mb-8">

          <div className="flex items-center gap-3 mb-7">
            <FileText className="text-brand-lime" size={21} />

            <h2 className="text-lg font-bold text-brand-cream">
              Gym Information
            </h2>
          </div>

          {/* Cover image and gym name */}
          <div className="mb-8 pb-8 border-b border-white/10">
            <div className="w-full h-56 sm:h-72 rounded-2xl overflow-hidden border border-white/10 bg-brand-background flex items-center justify-center mb-5">
              {application.cover_image_url ? (
                <img
                  src={application.cover_image_url}
                  alt={`${application.gym_name} cover`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Building2 size={48} className="text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No cover image uploaded
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">
                Gym Name
              </p>

              <h3 className="text-2xl font-bold text-brand-cream">
                {application.gym_name}
              </h3>

              <p className="text-sm text-gray-400 mt-2">
                {application.location}
              </p>
            </div>
          </div>

          {/* Gym details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div>
              <p className="text-xs text-gray-500 mb-2">
                Owner Name
              </p>
              <p className="text-brand-cream font-medium">
                {application.owner_name}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">
                Owner Phone
              </p>
              <p className="text-brand-cream font-medium">
                {application.owner_phone}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">
                Email Address
              </p>
              <p className="text-brand-cream font-medium break-all">
                {application.owner_email}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">
                Gym Contact Number
              </p>
              <p className="text-brand-cream font-medium">
                {application.contact_phone || "Not provided"}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500 mb-2">
                Street Address
              </p>
              <p className="text-brand-cream font-medium">
                {application.address}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">
                City
              </p>
              <p className="text-brand-cream font-medium">
                {application.city}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">
                District
              </p>
              <p className="text-brand-cream font-medium">
                {application.district}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">
                Monthly Membership
              </p>
              <p className="text-brand-cream font-medium">
                LKR {formatPrice(application.monthly_price)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">
                Application ID
              </p>
              <p className="text-gray-400 text-xs break-all">
                {application.id}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">
                Opening Time
              </p>
              <p className="text-brand-cream font-medium">
                {formatTime(application.opening_time)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">
                Closing Time
              </p>
              <p className="text-brand-cream font-medium">
                {formatTime(application.closing_time)}
              </p>
            </div>
          </div>

          {/* Description */}
          {application.description && (
            <div className="mt-7 pt-6 border-t border-white/10">
              <p className="text-xs text-gray-500 mb-3">
                Gym Description
              </p>

              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {application.description}
              </p>
            </div>
          )}

          {/* Facilities */}
          <div className="mt-7 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Dumbbell size={19} className="text-brand-lime" />
              <h3 className="text-brand-cream font-semibold">
                Gym Facilities
              </h3>
            </div>

            {facilities.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No facilities listed.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {facilities.map((facility) => (
                  <span
                    key={facility}
                    className="px-3 py-2 rounded-lg bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-sm"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Services */}
          <div className="mt-7 pt-6 border-t border-white/10">
            <h3 className="text-brand-cream font-semibold mb-4">
              Services Offered
            </h3>

            {services.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No services listed.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {services.map((service) => (
                  <span
                    key={service}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gallery images */}
        <div className="bg-brand-card border border-white/10 rounded-2xl p-6 md:p-8 mb-8">

          <div className="flex items-center justify-between gap-3 mb-7">
            <div className="flex items-center gap-3">
              <ImageIcon className="text-brand-lime" size={21} />

              <h2 className="text-lg font-bold text-brand-cream">
                Gym Gallery
              </h2>
            </div>

            <span className="text-xs text-gray-500">
              {galleryImages.length} images
            </span>
          </div>

          {galleryImages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 py-12 text-center">
              <ImageIcon
                size={35}
                className="text-gray-500 mx-auto mb-3"
              />

              <p className="text-sm text-gray-400">
                No additional gallery images uploaded.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {galleryImages.map((imageUrl, index) => (
                <div
                  key={`${imageUrl}-${index}`}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-brand-background"
                >
                  <img
                    src={imageUrl}
                    alt={`${application.gym_name} gallery image ${index + 1}`}
                    loading="lazy"
                    className="w-full h-36 sm:h-44 object-cover transition duration-300 group-hover:scale-105"
                  />

                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2">
                    <p className="text-xs text-white">
                      Gym Image {index + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved application */}
        {status === "approved" && (
          <Link
            href="/gym/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-brand-lime px-7 py-3.5 font-bold text-brand-background hover:bg-white transition"
          >
            Go to Gym Dashboard
          </Link>
        )}

        {/* Rejected application */}
        {status === "rejected" && (
          <Link
            href="/gyms/apply"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-brand-lime px-7 py-3.5 font-bold text-brand-background hover:bg-white transition"
          >
            Submit a New Application
          </Link>
        )}

      </div>
    </div>
  );
}
