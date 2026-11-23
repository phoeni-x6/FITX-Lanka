
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  MapPin,
  Clock,
  Phone,
  Mail,
  Dumbbell,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Gym = {
  id: string;
  gym_name: string;
  description: string | null;
  location: string;
  address: string | null;
  contact_phone: string | null;
  owner_email: string | null;
  monthly_price: number | null;
  facilities: string[];
  services: string[];
  cover_image_url: string | null;
  gallery_images: string[];
  opening_time: string | null;
  closing_time: string | null;
  city: string | null;
  district: string | null;
};

const supabase = createClient();

export default function GymProfilePage() {
  const params = useParams();
  const router = useRouter();

  const gymId = params.id as string;

  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGym = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("gym_profiles")
        .select("*")
        .eq("id", gymId)
        .eq("is_approved", true)
        .maybeSingle();

      if (fetchError) {
        console.error(fetchError);
        setError("Unable to load this gym. Please try again.");
        setLoading(false);
        return;
      }

      if (!data) {
        setError("This gym could not be found or is not currently available.");
        setLoading(false);
        return;
      }

      setGym(data as Gym);
      setLoading(false);
    };

    if (gymId) fetchGym();
  }, [gymId]);

  const formatTime = (time: string | null) => {
    if (!time) return "Not specified";

    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes));

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-background">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-brand-lime" size={32} />
          <p className="mt-4 text-sm text-gray-400">Loading gym profile...</p>
        </div>
      </div>
    );
  }

  if (error || !gym) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-background px-5">
        <div className="max-w-md text-center">
          <Dumbbell className="mx-auto text-brand-lime" size={42} />
          <h1 className="mt-5 text-2xl font-bold text-brand-cream">
            Gym unavailable
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            {error || "We couldn't find this gym."}
          </p>
          <Link
            href="/gyms"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand-lime px-5 py-3 text-sm font-bold text-brand-background"
          >
            <ArrowLeft size={16} />
            Back to gyms
          </Link>
        </div>
      </div>
    );
  }

  const images = [
    gym.cover_image_url,
    ...(gym.gallery_images || []),
  ].filter((image): image is string => Boolean(image));

  return (
    <main className="min-h-screen bg-brand-background pb-20">
      {/* Back navigation */}
      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 lg:px-10">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-brand-lime"
        >
          <ArrowLeft size={17} />
          Back
        </button>
      </div>

      {/* Cover image */}
      <section className="mx-auto mt-6 max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/[0.07] sm:h-[380px] lg:h-[480px]">
          {gym.cover_image_url ? (
            <Image
              src={gym.cover_image_url}
              alt={gym.gym_name}
              fill
              unoptimized
              priority
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-brand-card">
              <Dumbbell size={64} className="text-brand-lime/40" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-lime/30 bg-brand-lime/10 px-3 py-1.5 text-xs font-semibold text-brand-lime backdrop-blur">
              <CheckCircle2 size={14} />
              Verified FitX Lanka Gym
            </span>

            <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">
              {gym.gym_name}
            </h1>

            <p className="mt-3 flex items-center gap-2 text-sm text-gray-200">
              <MapPin size={16} className="text-brand-lime" />
              {gym.city || gym.location}
              {gym.district ? `, ${gym.district}` : ""}
            </p>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-8 px-5 sm:px-8 lg:grid-cols-3 lg:px-10">
        <div className="space-y-8 lg:col-span-2">
          {/* About */}
          <div className="rounded-2xl border border-white/[0.07] bg-brand-card p-6 sm:p-8">
            <h2 className="text-xl font-bold text-brand-cream">
              About this gym
            </h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-400">
              {gym.description || "No description has been provided yet."}
            </p>
          </div>

          {/* Gallery */}
          {images.length > 0 && (
            <div className="rounded-2xl border border-white/[0.07] bg-brand-card p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <ImageIcon className="text-brand-lime" size={20} />
                <h2 className="text-xl font-bold text-brand-cream">
                  Gym gallery
                </h2>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className={`relative overflow-hidden rounded-xl ${
                      index === 0 ? "col-span-2 row-span-2 h-64 sm:h-full" : "h-32 sm:h-36"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${gym.gym_name} gallery ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover transition duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Facilities */}
          <div className="rounded-2xl border border-white/[0.07] bg-brand-card p-6 sm:p-8">
            <h2 className="text-xl font-bold text-brand-cream">
              Facilities
            </h2>

            {gym.facilities?.length ? (
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {gym.facilities.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle2 size={17} className="shrink-0 text-brand-lime" />
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500">
                No facilities listed yet.
              </p>
            )}
          </div>

          {/* Services */}
          <div className="rounded-2xl border border-white/[0.07] bg-brand-card p-6 sm:p-8">
            <h2 className="text-xl font-bold text-brand-cream">
              Services
            </h2>

            {gym.services?.length ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {gym.services.map((service) => (
                  <span
                    key={service}
                    className="rounded-xl border border-brand-lime/20 bg-brand-lime/5 px-4 py-2.5 text-sm text-brand-lime"
                  >
                    {service}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500">
                No services listed yet.
              </p>
            )}
          </div>

          {/* Location and hours */}
          <div className="rounded-2xl border border-white/[0.07] bg-brand-card p-6 sm:p-8">
            <h2 className="text-xl font-bold text-brand-cream">
              Location & opening hours
            </h2>

            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 text-brand-lime" size={20} />
                <div>
                  <p className="text-sm font-semibold text-brand-cream">Address</p>
                  <p className="mt-1 text-sm leading-6 text-gray-400">
                    {gym.address || gym.location}
                    {gym.city ? `, ${gym.city}` : ""}
                    {gym.district ? `, ${gym.district}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="mt-1 text-brand-lime" size={20} />
                <div>
                  <p className="text-sm font-semibold text-brand-cream">Opening hours</p>
                  <p className="mt-1 text-sm text-gray-400">
                    {gym.opening_time || gym.closing_time
                      ? `${formatTime(gym.opening_time)} – ${formatTime(gym.closing_time)}`
                      : "Hours not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Membership card */}
        <aside className="lg:col-span-1">
          <div className="sticky top-8 rounded-2xl border border-white/[0.08] bg-brand-card p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Membership pricing
            </p>

            <div className="mt-3">
              {gym.monthly_price !== null ? (
                <>
                  <span className="text-3xl font-black text-brand-lime">
                    LKR {Number(gym.monthly_price).toLocaleString()}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">/ month</span>
                </>
              ) : (
                <span className="text-xl font-bold text-brand-lime">
                  Contact for pricing
                </span>
              )}
            </div>

            <p className="mt-3 text-xs leading-5 text-gray-500">
              Contact the gym to enquire about membership options and availability.
            </p>

            <div className="mt-7 space-y-3">
              <Link
                href={`/bookings?gym=${gym.id}&type=membership`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-lime px-5 py-3.5 text-sm font-bold text-brand-background transition hover:bg-brand-cream"
              >
                Request Membership
                <ArrowUpRight size={17} />
              </Link>

              <Link
                href={`/bookings?gym=${gym.id}&type=visit`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3.5 text-sm font-semibold text-brand-cream transition hover:border-brand-lime/40 hover:text-brand-lime"
              >
                Request Gym Visit
                <ArrowUpRight size={17} />
              </Link>
            </div>

            <div className="mt-7 border-t border-white/[0.07] pt-6">
              <h3 className="text-sm font-bold text-brand-cream">
                Contact information
              </h3>

              {gym.contact_phone && (
                <a
                  href={`tel:${gym.contact_phone}`}
                  className="mt-4 flex items-center gap-3 text-sm text-gray-400 transition hover:text-brand-lime"
                >
                  <Phone size={17} className="text-brand-lime" />
                  {gym.contact_phone}
                </a>
              )}

              {gym.owner_email && (
                <a
                  href={`mailto:${gym.owner_email}`}
                  className="mt-3 flex items-center gap-3 break-all text-sm text-gray-400 transition hover:text-brand-lime"
                >
                  <Mail size={17} className="shrink-0 text-brand-lime" />
                  {gym.owner_email}
                </a>
              )}

              {!gym.contact_phone && !gym.owner_email && (
                <p className="mt-3 text-sm text-gray-500">
                  Contact information unavailable.
                </p>
              )}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
0