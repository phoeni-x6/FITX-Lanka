
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  UserRound,
  Image as ImageIcon,
  Award,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type Application = Record<string, any>;

type Qualification = {
  id: string;
  qualification_name: string;
  institution: string;
  year_obtained: number | null;
};

export default function ApplicationDetailsPage() {
  const params = useParams<{ type: string; id: string }>();
  const type = params.type;
  const id = params.id;

  const supabase = useMemo(() => createClient(), []);

  const [application, setApplication] = useState<Application | null>(null);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Admin review states
  const [adminNotes, setAdminNotes] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  const isTrainer = type === "trainer";

  useEffect(() => {
    let active = true;

    async function loadApplication() {
      setLoading(true);
      setError("");

      if (type !== "trainer" && type !== "gym") {
        setError("Invalid application type.");
        setLoading(false);
        return;
      }

      const table =
        type === "trainer" ? "trainer_applications" : "gym_applications";

      const { data, error: fetchError } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!active) return;

      if (fetchError || !data) {
        setError(fetchError?.message || "Application not found.");
        setLoading(false);
        return;
      }

      setApplication(data);
      setAdminNotes(data.admin_notes || "");

      if (type === "trainer") {
        const { data: qualificationData, error: qualificationError } =
          await supabase
            .from("trainer_application_qualifications")
            .select("*")
            .eq("application_id", id)
            .order("created_at", { ascending: true });

        if (!active) return;

        if (qualificationError) {
          setError(
            "Application loaded, but qualifications could not be loaded."
          );
        } else {
          setQualifications(qualificationData || []);
        }
      }

      setLoading(false);
    }

    loadApplication();

    return () => {
      active = false;
    };
  }, [supabase, type, id]);

  // Admin approval / rejection
  const handleReview = async (decision: "approved" | "rejected") => {
    if (!application || reviewing || application.status !== "pending") {
      return;
    }

    const action = decision === "approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this ${
        isTrainer ? "trainer" : "gym"
      } application?`
    );

    if (!confirmed) return;

    setReviewing(true);
    setReviewError("");
    setReviewMessage("");

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "review_provider_application",
        {
          p_application_type: type,
          p_application_id: id,
          p_status: decision,
          p_admin_notes: adminNotes.trim() || null,
        }
      );

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      if (!data?.success) {
        throw new Error("The application review could not be completed.");
      }

      setApplication((previous) =>
        previous
          ? {
              ...previous,
              status: decision,
              admin_notes: adminNotes.trim() || null,
            }
          : previous
      );

      setReviewMessage(
        decision === "approved"
          ? `${isTrainer ? "Trainer" : "Gym"} application approved successfully.`
          : "Application rejected successfully."
      );
    } catch (err) {
      setReviewError(
        err instanceof Error
          ? err.message
          : "Something went wrong while reviewing the application."
      );
    } finally {
      setReviewing(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "Not provided";

    return new Date(value).toLocaleString("en-LK", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  const formatPrice = (value: number | string | null) => {
    if (value === null || value === undefined || value === "") {
      return "Not provided";
    }

    return `LKR ${Number(value).toLocaleString("en-LK")}`;
  };

  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-400/10 text-yellow-300 border-yellow-400/20",
    approved: "bg-green-400/10 text-green-300 border-green-400/20",
    rejected: "bg-red-400/10 text-red-300 border-red-400/20",
  };

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <section className="rounded-2xl border border-white/10 bg-[#222723] p-5 sm:p-6">
      <h2 className="mb-5 text-lg font-semibold text-[#EFEFE5]">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );

  const Detail = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div>
      <p className="mb-1 text-xs uppercase tracking-wider text-white/40">
        {label}
      </p>
      <div className="break-words text-sm text-[#EFEFE5]">
        {value || "Not provided"}
      </div>
    </div>
  );

  const TagList = ({ items }: { items?: string[] }) => (
    <div className="flex flex-wrap gap-2">
      {items?.length ? (
        items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="rounded-full border border-[#C7F36B]/20 bg-[#C7F36B]/10 px-3 py-1.5 text-xs text-[#C7F36B]"
          >
            {item}
          </span>
        ))
      ) : (
        <span className="text-sm text-white/40">None provided</span>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#171A18]">
        <Loader2 className="h-8 w-8 animate-spin text-[#C7F36B]" />
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="min-h-screen bg-[#171A18] px-5 py-16 text-center">
        <p className="mb-4 text-red-400">{error}</p>
        <Link
          href="/admin/applications"
          className="text-sm text-[#C7F36B] hover:underline"
        >
          Back to applications
        </Link>
      </div>
    );
  }

  if (!application) return null;

  const title = isTrainer ? application.full_name : application.gym_name;
  const status = application.status || "pending";

  const galleryImages: string[] = Array.isArray(application.gallery_images)
    ? application.gallery_images
    : [];

  return (
    <main className="min-h-screen bg-[#171A18] px-4 py-8 text-[#EFEFE5] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin/applications"
          className="mb-7 inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-[#C7F36B]"
        >
          <ArrowLeft size={17} />
          Back to applications
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#C7F36B]">
              {isTrainer ? "Trainer application" : "Gym application"}
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>

            <p className="mt-2 text-sm text-white/40">
              Submitted {formatDate(application.created_at)}
            </p>
          </div>

          <span
            className={`w-fit rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
              statusStyles[status] || statusStyles.pending
            }`}
          >
            {status}
          </span>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-300">
            {error}
          </div>
        )}

        {/* Main image */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#222723] p-6 sm:p-8">
          {isTrainer ? (
            <div className="flex flex-col items-center text-center">
              {application.profile_image_url ? (
                <img
                  src={application.profile_image_url}
                  alt={application.full_name}
                  className="h-36 w-36 rounded-full border-4 border-[#C7F36B]/30 object-cover shadow-xl sm:h-44 sm:w-44"
                />
              ) : (
                <div className="flex h-36 w-36 items-center justify-center rounded-full border border-white/10 bg-[#171A18] sm:h-44 sm:w-44">
                  <UserRound size={55} className="text-white/30" />
                </div>
              )}

              <h2 className="mt-5 text-xl font-bold text-[#EFEFE5]">
                {application.full_name}
              </h2>

              <p className="mt-1 text-sm text-white/50">
                Trainer Profile Photo
              </p>
            </div>
          ) : (
            <div>
              {application.cover_image_url ? (
                <img
                  src={application.cover_image_url}
                  alt={application.gym_name}
                  className="h-64 w-full rounded-xl object-cover sm:h-80"
                />
              ) : (
                <div className="flex h-64 items-center justify-center rounded-xl bg-[#171A18] text-white/20">
                  <ImageIcon size={48} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Applicant / Owner */}
          <Section
            title={
              isTrainer ? "Applicant information" : "Gym owner information"
            }
          >
            <Detail
              label="Full name"
              value={
                isTrainer ? application.full_name : application.owner_name
              }
            />

            <Detail
              label="Email"
              value={
                isTrainer
                  ? "See applicant's account email"
                  : application.owner_email
              }
            />

            <Detail
              label="Phone"
              value={
                isTrainer
                  ? "See applicant's account phone"
                  : application.owner_phone
              }
            />

            {!isTrainer && (
              <>
                <Detail
                  label="Gym contact number"
                  value={application.contact_phone}
                />
                <Detail label="Address" value={application.address} />
              </>
            )}
          </Section>

          {/* Application details */}
          <Section title={isTrainer ? "Professional details" : "Gym details"}>
            {isTrainer ? (
              <>
                <Detail
                  label="Primary specialty"
                  value={application.specialty}
                />

                <Detail
                  label="Experience"
                  value={`${application.experience_years ?? 0} years`}
                />

                <Detail
                  label="Price per session"
                  value={formatPrice(application.price_per_session)}
                />

                <Detail label="Bio" value={application.bio} />
              </>
            ) : (
              <>
                <Detail label="Gym name" value={application.gym_name} />
                <Detail
                  label="Description"
                  value={application.description}
                />

                <Detail
                  label="Monthly membership price"
                  value={formatPrice(application.monthly_price)}
                />

                <Detail
                  label="Opening time"
                  value={application.opening_time || "Not provided"}
                />

                <Detail
                  label="Closing time"
                  value={application.closing_time || "Not provided"}
                />
              </>
            )}
          </Section>

          {/* Location */}
          <Section title="Location">
            <div className="flex items-start gap-3">
              <MapPin
                className="mt-1 shrink-0 text-[#C7F36B]"
                size={18}
              />

              <div>
                <p className="text-sm text-[#EFEFE5]">
                  {isTrainer
                    ? application.location
                    : `${application.city || ""}, ${application.district || ""}`}
                </p>

                {!isTrainer && (
                  <p className="mt-1 text-sm text-white/50">
                    {application.address}
                  </p>
                )}
              </div>
            </div>

            {isTrainer && (
              <>
                <Detail
                  label="Primary location"
                  value={application.location}
                />

                <div>
                  <p className="mb-2 text-xs uppercase tracking-wider text-white/40">
                    All locations
                  </p>
                  <TagList items={application.locations} />
                </div>
              </>
            )}
          </Section>

          {/* Specialties / facilities */}
          <Section title={isTrainer ? "Specialties" : "Facilities"}>
            <TagList
              items={
                isTrainer
                  ? application.specialties
                  : application.facilities
              }
            />
          </Section>

          {!isTrainer && (
            <Section title="Services">
              <TagList items={application.services} />
            </Section>
          )}

          {isTrainer && (
            <Section title="Qualifications">
              {qualifications.length ? (
                qualifications.map((qualification) => (
                  <div
                    key={qualification.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Award
                        className="mt-1 shrink-0 text-[#C7F36B]"
                        size={19}
                      />

                      <div>
                        <p className="font-medium">
                          {qualification.qualification_name}
                        </p>

                        <p className="mt-1 text-sm text-white/50">
                          {qualification.institution}
                        </p>

                        {qualification.year_obtained && (
                          <p className="mt-1 text-xs text-white/40">
                            Year: {qualification.year_obtained}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/40">
                  No qualifications provided.
                </p>
              )}
            </Section>
          )}
        </div>

        {/* Gym gallery */}
        {!isTrainer && galleryImages.length > 0 && (
          <div className="mt-6">
            <Section title={`Gym gallery (${galleryImages.length} images)`}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {galleryImages.map((image, index) => (
                  <a
                    key={`${image}-${index}`}
                    href={image}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-xl border border-white/10"
                  >
                    <img
                      src={image}
                      alt={`Gym gallery ${index + 1}`}
                      className="h-40 w-full object-cover transition duration-300 hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* Review information */}
        <div className="mt-6">
          <Section title="Review information">
            <Detail
              label="Application ID"
              value={
                <span className="break-all font-mono text-xs">
                  {application.id}
                </span>
              }
            />

            <Detail label="Current status" value={status.toUpperCase()} />

            <Detail
              label="Submitted on"
              value={formatDate(application.created_at)}
            />

            <Detail
              label="Admin notes"
              value={application.admin_notes || "No admin notes yet."}
            />

            {application.reviewed_at && (
              <Detail
                label="Reviewed on"
                value={formatDate(application.reviewed_at)}
              />
            )}
          </Section>
        </div>

        {/* Admin Review Panel */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-[#222723] p-5 sm:p-7">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C7F36B]">
              Admin controls
            </p>

            <h2 className="mt-2 text-xl font-bold text-[#EFEFE5]">
              Review application
            </h2>

            <p className="mt-2 text-sm text-white/50">
              Review the submitted information before making your decision.
            </p>
          </div>

          {status === "pending" ? (
            <>
              <div className="mb-6">
                <label
                  htmlFor="adminNotes"
                  className="mb-2 block text-sm font-medium text-[#EFEFE5]"
                >
                  Admin notes
                  <span className="ml-2 text-xs font-normal text-white/40">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Add feedback or explain your decision..."
                  disabled={reviewing}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#171A18] px-4 py-3 text-sm text-[#EFEFE5] outline-none transition placeholder:text-white/25 focus:border-[#C7F36B]/50 disabled:opacity-50"
                />

                <p className="mt-2 text-right text-xs text-white/30">
                  {adminNotes.length}/2000 characters
                </p>
              </div>

              {reviewError && (
                <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                  {reviewError}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => handleReview("approved")}
                  disabled={reviewing}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#C7F36B] px-5 py-3.5 text-sm font-bold text-[#171A18] transition hover:bg-[#d7ff85] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {reviewing ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}

                  {reviewing ? "Processing..." : "Approve Application"}
                </button>

                <button
                  type="button"
                  onClick={() => handleReview("rejected")}
                  disabled={reviewing}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {reviewing ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <XCircle size={17} />
                  )}

                  {reviewing ? "Processing..." : "Reject Application"}
                </button>
              </div>
            </>
          ) : (
            <div
              className={`rounded-xl border p-4 ${
                status === "approved"
                  ? "border-green-500/20 bg-green-500/10"
                  : "border-red-500/20 bg-red-500/10"
              }`}
            >
              <div className="flex items-center gap-3">
                {status === "approved" ? (
                  <CheckCircle2 className="text-green-400" size={22} />
                ) : (
                  <XCircle className="text-red-400" size={22} />
                )}

                <div>
                  <p className="font-semibold text-[#EFEFE5]">
                    Application {status}
                  </p>

                  <p className="mt-1 text-sm text-white/50">
                    This application has already been reviewed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {reviewMessage && (
            <div className="mt-5 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
              {reviewMessage}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
