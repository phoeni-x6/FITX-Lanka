
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  Upload,
  UserRound,
  MapPin,
  BriefcaseBusiness,
  Plus,
  X,
  GraduationCap,
  Award,
} from "lucide-react";

type Qualification = {
  id: number;
  title: string;
  institution: string;
  year: string;
};

const specialtyOptions = [
  "Weight Training",
  "Personal Fitness",
  "Bodybuilding",
  "Weight Loss",
  "Strength and Conditioning",
  "Yoga",
  "CrossFit",
  "Sports Fitness",
  "Functional Training",
  "Nutrition Coaching",
  "Rehabilitation Fitness",
  "Other",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function TrainerApplicationPage() {
  const supabase = createClient();

  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    specialties: [] as string[],
    bio: "",
    locations: [] as string[],
    experience: "",
    price: "",
    image: null as File | null,
  });

  const [specialtyInput, setSpecialtyInput] = useState("");
  const [locationInput, setLocationInput] = useState("");

  const [qualificationInput, setQualificationInput] = useState({
    title: "",
    institution: "",
    year: "",
  });

  const [qualifications, setQualifications] = useState<Qualification[]>([]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add a specialty
  const addSpecialty = () => {
    const specialty = specialtyInput.trim();

    if (!specialty) return;

    if (
      formData.specialties.some(
        (item) => item.toLowerCase() === specialty.toLowerCase()
      )
    ) {
      setSpecialtyInput("");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      specialties: [...prev.specialties, specialty],
    }));

    setSpecialtyInput("");
    setFormMessage("");
  };

  // Remove a specialty
  const removeSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((item) => item !== specialty),
    }));
  };

  // Add a location
  const addLocation = () => {
    const location = locationInput.trim();

    if (!location) return;

    if (
      formData.locations.some(
        (item) => item.toLowerCase() === location.toLowerCase()
      )
    ) {
      setLocationInput("");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      locations: [...prev.locations, location],
    }));

    setLocationInput("");
    setFormMessage("");
  };

  // Remove a location
  const removeLocation = (location: string) => {
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.filter((item) => item !== location),
    }));
  };

  // Add a qualification
  const addQualification = () => {
    const title = qualificationInput.title.trim();
    const institution = qualificationInput.institution.trim();

    if (!title || !institution) {
      setFormMessage(
        "Please enter both the qualification name and issuing institution."
      );
      return;
    }

    setQualifications((prev) => [
      ...prev,
      {
        id: Date.now(),
        title,
        institution,
        year: qualificationInput.year,
      },
    ]);

    setQualificationInput({
      title: "",
      institution: "",
      year: "",
    });

    setFormMessage("");
  };

  // Remove a qualification
  const removeQualification = (id: number) => {
    setQualifications((prev) =>
      prev.filter((qualification) => qualification.id !== id)
    );
  };

  // Validate and select profile image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFormMessage("Please select a JPG, PNG or WebP image.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setFormMessage("Your profile image must be smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    setFormMessage("");
  };

  // Upload profile image to Supabase Storage
  const uploadProfileImage = async (
    userId: string,
    file: File
  ): Promise<string> => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("trainer-profiles")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Profile image upload error:", uploadError);
      throw new Error("PROFILE_IMAGE_UPLOAD_FAILED");
    }

    const { data } = supabase.storage
      .from("trainer-profiles")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Submit trainer application
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (formData.specialties.length === 0) {
      setFormMessage("Please add at least one training specialty.");
      return;
    }

    if (formData.locations.length === 0) {
      setFormMessage("Please add at least one training location.");
      return;
    }

    const experienceYears = Number(formData.experience);
    const pricePerSession = Number(formData.price);

    if (
      !Number.isInteger(experienceYears) ||
      experienceYears < 0 ||
      experienceYears > 60
    ) {
      setFormMessage("Please enter a valid number of experience years.");
      return;
    }

    if (!Number.isFinite(pricePerSession) || pricePerSession < 0) {
      setFormMessage("Please enter a valid session price.");
      return;
    }

    if (
      qualifications.some((item) => {
        if (!item.year.trim()) return false;

        const year = Number(item.year);

        return (
          !Number.isInteger(year) ||
          year < 1950 ||
          year > new Date().getFullYear()
        );
      })
    ) {
      setFormMessage("Please check the year entered for each qualification.");
      return;
    }

    setIsSubmitting(true);
    setFormMessage("");

    try {
      // Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setFormMessage(
          "Please log in to submit your trainer application. Your form details are still on this page."
        );
        return;
      }

      // Prevent duplicate pending applications
      const { data: existingApplication, error: existingError } =
        await supabase
          .from("trainer_applications")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "pending")
          .maybeSingle();

      if (existingError) {
        console.error("Application check error:", existingError);

        setFormMessage(
          "Unable to check your application status. Please try again."
        );
        return;
      }

      if (existingApplication) {
        setFormMessage(
          "You already have a trainer application awaiting review. You can check its status from your dashboard."
        );
        return;
      }

      // Upload profile image if selected
      let profileImageUrl: string | null = null;

      if (formData.image) {
        try {
          profileImageUrl = await uploadProfileImage(
            user.id,
            formData.image
          );
        } catch (uploadError) {
          console.error(uploadError);

          setFormMessage(
            "We couldn't upload your profile image. Please try again."
          );
          return;
        }
      }

      // Submit application and image URL
      const { data: applicationId, error: submitError } =
        await supabase.rpc("submit_trainer_application", {
          p_full_name: formData.fullName.trim(),
          p_specialties: formData.specialties,
          p_bio: formData.bio.trim(),
          p_locations: formData.locations,
          p_experience_years: experienceYears,
          p_price_per_session: pricePerSession,
          p_profile_image_url: profileImageUrl,
          p_qualifications: qualifications.map((qualification) => ({
            qualification_name: qualification.title.trim(),
            institution: qualification.institution.trim(),
            year_obtained: qualification.year
              ? Number(qualification.year)
              : null,
          })),
        });

      if (submitError) {
        console.error(
          "Trainer application submission error:",
          submitError
        );

        setFormMessage(
          submitError.message.includes("row-level security")
            ? "Your account does not have permission to submit a trainer application. Please contact support."
            : "We couldn't submit your application. Please try again."
        );
        return;
      }

      if (!applicationId) {
        setFormMessage(
          "The application could not be confirmed. Please try again."
        );
        return;
      }

      // Success
      setFormMessage(
        "Your trainer application has been submitted successfully. Our team will review it and update your application status."
      );

      setFormData({
        fullName: "",
        specialties: [],
        bio: "",
        locations: [],
        experience: "",
        price: "",
        image: null,
      });

      setQualifications([]);
      setSpecialtyInput("");
      setLocationInput("");

      setQualificationInput({
        title: "",
        institution: "",
        year: "",
      });
    } catch (error) {
      console.error("Unexpected trainer application error:", error);

      setFormMessage(
        "Something went wrong while submitting. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-brand-background px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-600 focus:border-brand-lime";

  const labelClass = "mb-2 block text-sm text-gray-300";

  return (
    <main className="min-h-screen bg-brand-background px-4 py-12 text-brand-cream sm:px-6 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/trainers"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-brand-lime"
        >
          <ArrowLeft size={16} />
          Back to trainers
        </Link>

        {/* Heading */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-lime/10 text-brand-lime">
            <Dumbbell size={32} />
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-brand-lime">
            Join FitX Lanka
          </p>

          <h1 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Become a <span className="text-brand-lime">Trainer</span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
            Share your expertise, connect with clients, and grow your
            personal training career through FitX Lanka.
          </p>
        </div>

        {/* Application steps */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              number: "01",
              title: "Apply",
              description: "Complete your trainer profile.",
            },
            {
              number: "02",
              title: "Get reviewed",
              description: "Our admin team reviews your application.",
            },
            {
              number: "03",
              title: "Start growing",
              description: "Get listed after approval.",
            },
          ].map((item) => (
            <div
              key={item.number}
              className="rounded-2xl border border-white/10 bg-brand-card p-5"
            >
              <span className="mb-3 block text-sm font-bold text-brand-lime">
                {item.number}
              </span>

              <h3 className="mb-1 font-semibold">{item.title}</h3>

              <p className="text-sm text-gray-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Application form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-brand-card p-5 shadow-2xl sm:p-8 lg:p-10"
        >
          <div className="mb-8 border-b border-white/10 pb-6">
            <h2 className="mb-2 text-xl font-bold sm:text-2xl">
              Trainer information
            </h2>

            <p className="text-sm text-gray-400">
              Provide accurate information about your training experience,
              qualifications and services.
            </p>
          </div>

          <div className="space-y-9">
            {/* Personal details */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <UserRound className="text-brand-lime" size={20} />
                <h3 className="font-semibold">Personal details</h3>
              </div>

              <label className={labelClass}>Full name</label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                maxLength={100}
                className={inputClass}
              />
            </section>

            {/* Specialties */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <BriefcaseBusiness
                  className="text-brand-lime"
                  size={20}
                />

                <h3 className="font-semibold">Training specialties</h3>
              </div>

              <p className="mb-4 text-sm text-gray-400">
                Select all the areas you specialise in. You can add multiple
                specialties to your profile.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  className={`${inputClass} flex-1 text-gray-300`}
                >
                  <option value="">Select a specialty</option>

                  {specialtyOptions.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={addSpecialty}
                  disabled={!specialtyInput}
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand-lime px-5 py-3.5 text-sm font-bold text-brand-background transition hover:bg-[#d5ff82] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={17} />
                  Add specialty
                </button>
              </div>

              {formData.specialties.length > 0 && (
                <div className="mt-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Selected specialties ({formData.specialties.length})
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {formData.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex items-center gap-2 rounded-full border border-brand-lime/20 bg-brand-lime/10 px-3 py-2 text-sm text-brand-lime"
                      >
                        {specialty}

                        <button
                          type="button"
                          onClick={() => removeSpecialty(specialty)}
                          aria-label={`Remove ${specialty}`}
                          className="transition hover:text-white"
                        >
                          <X size={15} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Qualifications */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <GraduationCap
                  className="text-brand-lime"
                  size={21}
                />

                <h3 className="font-semibold">
                  Qualifications and certifications
                </h3>
              </div>

              <p className="mb-5 text-sm leading-6 text-gray-400">
                Add your educational qualifications, fitness certifications
                and other relevant professional credentials one by one.
              </p>

              <div className="space-y-4 rounded-2xl border border-white/10 bg-brand-background p-4 sm:p-5">
                <div>
                  <label className={labelClass}>
                    Qualification / Certification name
                  </label>

                  <input
                    type="text"
                    value={qualificationInput.title}
                    onChange={(e) =>
                      setQualificationInput((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="e.g. Certified Personal Trainer"
                    maxLength={150}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Institution / Issuing organisation
                  </label>

                  <input
                    type="text"
                    value={qualificationInput.institution}
                    onChange={(e) =>
                      setQualificationInput((prev) => ({
                        ...prev,
                        institution: e.target.value,
                      }))
                    }
                    placeholder="e.g. National Institute of Sports"
                    maxLength={150}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Year obtained (optional)
                  </label>

                  <input
                    type="number"
                    value={qualificationInput.year}
                    onChange={(e) =>
                      setQualificationInput((prev) => ({
                        ...prev,
                        year: e.target.value,
                      }))
                    }
                    placeholder="e.g. 2023"
                    min="1950"
                    max={new Date().getFullYear()}
                    className={inputClass}
                  />
                </div>

                <button
                  type="button"
                  onClick={addQualification}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-lime/30 bg-brand-lime/10 px-5 py-3.5 text-sm font-semibold text-brand-lime transition hover:bg-brand-lime/20"
                >
                  <Plus size={17} />
                  Add qualification
                </button>
              </div>

              {qualifications.length > 0 && (
                <div className="mt-5 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Added qualifications ({qualifications.length})
                  </p>

                  {qualifications.map((qualification, index) => (
                    <div
                      key={qualification.id}
                      className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-brand-background p-4"
                    >
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-lime/10 text-brand-lime">
                          <Award size={19} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            {index + 1}. {qualification.title}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {qualification.institution}
                          </p>

                          {qualification.year && (
                            <p className="mt-1 text-xs text-gray-500">
                              Obtained in {qualification.year}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeQualification(qualification.id)
                        }
                        aria-label="Remove qualification"
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-3 text-xs text-gray-500">
                You can add multiple qualifications. Only include credentials
                you have actually earned.
              </p>
            </section>

            {/* Professional bio and experience */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <GraduationCap
                  className="text-brand-lime"
                  size={20}
                />

                <h3 className="font-semibold">Professional experience</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Professional bio</label>

                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell potential clients about your experience, training approach and coaching style..."
                    rows={5}
                    maxLength={1000}
                    required
                    className={`${inputClass} resize-none`}
                  />

                  <p className="mt-2 text-right text-xs text-gray-500">
                    {formData.bio.length}/1000 characters
                  </p>
                </div>

                <div>
                  <label className={labelClass}>
                    Years of experience
                  </label>

                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g. 3"
                    min="0"
                    max="60"
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Multiple locations and pricing */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <MapPin className="text-brand-lime" size={20} />
                <h3 className="font-semibold">
                  Training locations and pricing
                </h3>
              </div>

              <p className="mb-4 text-sm text-gray-400">
                Add every city or area where you are available to train
                clients.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addLocation();
                    }
                  }}
                  placeholder="e.g. Colombo"
                  maxLength={100}
                  className={`${inputClass} flex-1`}
                />

                <button
                  type="button"
                  onClick={addLocation}
                  disabled={!locationInput.trim()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand-lime px-5 py-3.5 text-sm font-bold text-brand-background transition hover:bg-[#d5ff82] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={17} />
                  Add location
                </button>
              </div>

              {formData.locations.length > 0 && (
                <div className="mt-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Available locations ({formData.locations.length})
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {formData.locations.map((location) => (
                      <span
                        key={location}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300"
                      >
                        <MapPin
                          size={14}
                          className="text-brand-lime"
                        />

                        {location}

                        <button
                          type="button"
                          onClick={() => removeLocation(location)}
                          aria-label={`Remove ${location}`}
                          className="transition hover:text-red-400"
                        >
                          <X size={15} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <label className={labelClass}>
                  Price per session (LKR)
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 2500"
                  min="0"
                  required
                  className={inputClass}
                />

                <p className="mt-2 text-xs text-gray-500">
                  Enter your standard price per training session.
                </p>
              </div>
            </section>

            {/* Profile image */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <Upload className="text-brand-lime" size={20} />
                <h3 className="font-semibold">Profile image</h3>
              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-brand-background px-5 py-9 text-center transition hover:border-brand-lime/60">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-lime/10 text-brand-lime">
                  <Upload size={22} />
                </div>

                <span className="mb-2 text-sm font-medium">
                  {formData.image
                    ? formData.image.name
                    : "Upload your profile photo"}
                </span>

                <span className="text-xs text-gray-500">
                  JPG, PNG or WebP
                </span>

                <span className="mt-2 text-xs text-gray-500">
                  Maximum file size: 5 MB
                </span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>

              {formData.image && (
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      image: null,
                    }))
                  }
                  className="mt-3 text-sm text-red-400 transition hover:text-red-300"
                >
                  Remove selected image
                </button>
              )}
            </section>

            {/* Approval notice */}
            <div className="flex gap-3 rounded-xl border border-brand-lime/20 bg-brand-lime/5 p-4">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-brand-lime"
              />

              <p className="text-sm leading-6 text-gray-400">
                Your application will be reviewed by the FitX Lanka
                administration team. Your trainer profile will only become
                publicly visible after approval.
              </p>
            </div>

            {/* Form message */}
            {formMessage && (
              <p className="rounded-xl border border-brand-lime/20 bg-brand-lime/5 p-4 text-sm text-brand-lime">
                {formMessage}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-lime px-6 py-4 font-bold text-brand-background transition hover:bg-[#d5ff82] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? formData.image
                  ? "Uploading image & submitting..."
                  : "Submitting application..."
                : "Submit application"}

              {!isSubmitting && <ArrowRight size={18} />}
            </button>

            <p className="text-center text-xs text-gray-500">
              By submitting, you agree to provide accurate information
              about your professional background.
            </p>
          </div>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/trainers"
            className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-brand-lime"
          >
            <ArrowLeft size={15} />
            Explore trainers
          </Link>
        </div>
      </div>
    </main>
  );
}
