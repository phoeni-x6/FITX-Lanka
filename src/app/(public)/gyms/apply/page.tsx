
"use client";

import { useEffect, useState } from "react";
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
  Building2,
  Plus,
  X,
  Clock,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 10;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const facilityOptions = [
  "Free Weights",
  "Weight Machines",
  "Cardio Equipment",
  "Personal Training Area",
  "Functional Training Area",
  "Swimming Pool",
  "Sauna",
  "Steam Room",
  "Changing Rooms",
  "Showers",
  "Lockers",
  "Parking",
  "Air Conditioning",
  "Group Exercise Studio",
  "Yoga Studio",
  "CrossFit Area",
];

const serviceOptions = [
  "Personal Training",
  "Group Classes",
  "Weight Loss Programs",
  "Strength Training",
  "Bodybuilding",
  "Yoga Classes",
  "Nutrition Guidance",
  "Fitness Assessments",
  "Online Coaching",
  "Sports Conditioning",
];

type ImageFile = {
  id: string;
  file: File;
  preview: string;
};

export default function GymApplicationPage() {
  const supabase = createClient();

  const [formMessage, setFormMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  const [formData, setFormData] = useState({
    ownerName: "",
    ownerPhone: "",
    gymName: "",
    description: "",
    address: "",
    city: "",
    district: "",
    contactPhone: "",
    monthlyPrice: "",
    openingTime: "",
    closingTime: "",
  });

  const [facilities, setFacilities] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);

  const [coverImage, setCoverImage] = useState<ImageFile | null>(null);
  const [galleryImages, setGalleryImages] = useState<ImageFile[]>([]);

  // Load authenticated user information
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setFormMessage("Please log in before submitting a gym application.");
        setMessageType("error");
        setAuthLoading(false);
        return;
      }

      setOwnerEmail(user.email || "");
      setAuthLoading(false);
    };

    loadUser();
  }, [supabase]);

  // Clean up image preview URLs
  useEffect(() => {
    return () => {
      if (coverImage?.preview) {
        URL.revokeObjectURL(coverImage.preview);
      }

      galleryImages.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, [coverImage, galleryImages]);

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-brand-background px-4 py-3.5 text-sm text-brand-cream outline-none transition placeholder:text-gray-600 focus:border-brand-lime";

  const labelClass = "mb-2 block text-sm text-gray-300";

  const showMessage = (
    message: string,
    type: "success" | "error"
  ) => {
    setFormMessage(message);
    setMessageType(type);
  };

  const clearMessage = () => {
    setFormMessage("");
    setMessageType("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearMessage();
  };

  // Toggle facilities
  const toggleFacility = (facility: string) => {
    setFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((item) => item !== facility)
        : [...prev, facility]
    );

    clearMessage();
  };

  // Toggle services
  const toggleService = (service: string) => {
    setServices((prev) =>
      prev.includes(service)
        ? prev.filter((item) => item !== service)
        : [...prev, service]
    );

    clearMessage();
  };

  // Validate an image
  const validateImage = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Please select a JPG, PNG or WebP image.";
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return "Each image must be smaller than 5 MB.";
    }

    return null;
  };

  // Select cover image
  const handleCoverImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const validationError = validateImage(file);

    if (validationError) {
      showMessage(validationError, "error");
      e.target.value = "";
      return;
    }

    const newImage: ImageFile = {
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    };

    setCoverImage(newImage);
    clearMessage();
    e.target.value = "";
  };

  // Select multiple gallery images
  const handleGalleryChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const remainingSlots =
      MAX_GALLERY_IMAGES - galleryImages.length;

    if (remainingSlots <= 0) {
      showMessage(
        "You can upload a maximum of 10 gallery images.",
        "error"
      );
      e.target.value = "";
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      showMessage(
        `Only ${remainingSlots} more gallery image(s) can be added.`,
        "error"
      );
    } else {
      clearMessage();
    }

    const validImages: ImageFile[] = [];

    for (const file of selectedFiles) {
      const validationError = validateImage(file);

      if (validationError) {
        showMessage(validationError, "error");
        continue;
      }

      validImages.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setGalleryImages((prev) => [...prev, ...validImages]);

    e.target.value = "";
  };

  // Remove cover image
  const removeCoverImage = () => {
    if (coverImage) {
      URL.revokeObjectURL(coverImage.preview);
    }

    setCoverImage(null);
    clearMessage();
  };

  // Remove gallery image
  const removeGalleryImage = (id: string) => {
    setGalleryImages((prev) => {
      const image = prev.find((item) => item.id === id);

      if (image) {
        URL.revokeObjectURL(image.preview);
      }

      return prev.filter((item) => item.id !== id);
    });

    clearMessage();
  };

  // Upload one image to Supabase Storage
  const uploadImage = async (
    userId: string,
    file: File,
    folder: "cover" | "gallery"
  ): Promise<string> => {
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath =
      folder === "cover"
        ? `${userId}/cover-${crypto.randomUUID()}.${extension}`
        : `${userId}/gallery/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("gym-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Gym image upload error:", uploadError);
      throw new Error("IMAGE_UPLOAD_FAILED");
    }

    const { data } = supabase.storage
      .from("gym-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Upload all selected images
  const uploadAllImages = async (
    userId: string
  ): Promise<{
    coverUrl: string | null;
    galleryUrls: string[];
  }> => {
    let coverUrl: string | null = null;

    if (coverImage) {
      coverUrl = await uploadImage(
        userId,
        coverImage.file,
        "cover"
      );
    }

    const galleryUrls = await Promise.all(
      galleryImages.map((image) =>
        uploadImage(userId, image.file, "gallery")
      )
    );

    return {
      coverUrl,
      galleryUrls,
    };
  };

  // Submit application
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (authLoading) {
      showMessage("Please wait while we verify your account.", "error");
      return;
    }

    if (!formData.ownerName.trim()) {
      showMessage("Please enter the owner's full name.", "error");
      return;
    }

    if (!formData.ownerPhone.trim()) {
      showMessage("Please enter the owner's phone number.", "error");
      return;
    }

    if (!ownerEmail) {
      showMessage("Your account email could not be found.", "error");
      return;
    }

    if (!formData.gymName.trim()) {
      showMessage("Please enter your gym name.", "error");
      return;
    }

    if (!formData.description.trim()) {
      showMessage("Please provide a description of your gym.", "error");
      return;
    }

    if (!formData.address.trim()) {
      showMessage("Please enter your gym address.", "error");
      return;
    }

    if (!formData.city.trim() || !formData.district.trim()) {
      showMessage("Please enter your city and district.", "error");
      return;
    }

    if (facilities.length === 0) {
      showMessage("Please select at least one gym facility.", "error");
      return;
    }

    if (services.length === 0) {
      showMessage("Please select at least one gym service.", "error");
      return;
    }

    const monthlyPrice = Number(formData.monthlyPrice);

    if (
      !Number.isFinite(monthlyPrice) ||
      monthlyPrice < 0 ||
      monthlyPrice > 99999999
    ) {
      showMessage("Please enter a valid monthly membership price.", "error");
      return;
    }

    if (
      formData.openingTime &&
      formData.closingTime &&
      formData.openingTime === formData.closingTime
    ) {
      showMessage(
        "Opening and closing times cannot be identical.",
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    clearMessage();

    try {
      // Verify authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        showMessage(
          "Your session has expired. Please log in again.",
          "error"
        );
        return;
      }

      // Check for existing pending application
      const {
        data: existingApplication,
        error: existingError,
      } = await supabase
        .from("gym_applications")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .maybeSingle();

      if (existingError) {
        console.error("Gym application check error:", existingError);

        showMessage(
          "Unable to check your application status. Please try again.",
          "error"
        );
        return;
      }

      if (existingApplication) {
        showMessage(
          "You already have a gym application awaiting review. Please check your application status.",
          "error"
        );
        return;
      }

      // Upload selected images
      let uploadedImages: {
        coverUrl: string | null;
        galleryUrls: string[];
      };

      try {
        uploadedImages = await uploadAllImages(user.id);
      } catch (uploadError) {
        console.error(uploadError);

        showMessage(
          "We couldn't upload your gym images. Please check your images and try again.",
          "error"
        );
        return;
      }

      // Save application
      const { data: application, error: submitError } = await supabase
        .from("gym_applications")
        .insert({
          user_id: user.id,

          owner_name: formData.ownerName.trim(),
          owner_email: user.email,
          owner_phone: formData.ownerPhone.trim(),

          gym_name: formData.gymName.trim(),
          description: formData.description.trim(),

          location: `${formData.city.trim()}, ${formData.district.trim()}`,
          address: formData.address.trim(),
          city: formData.city.trim(),
          district: formData.district.trim(),

          contact_phone: formData.contactPhone.trim() || null,
          monthly_price: monthlyPrice,

          facilities,
          services,

          opening_time: formData.openingTime || null,
          closing_time: formData.closingTime || null,

          cover_image_url: uploadedImages.coverUrl,
          gallery_images: uploadedImages.galleryUrls,
        })
        .select("id")
        .single();

      if (submitError) {
        console.error(
          "Gym application submission error:",
          submitError
        );

        showMessage(
          submitError.code === "42501"
            ? "Your account does not have permission to submit a gym application. Please contact support."
            : "We couldn't submit your application. Please try again.",
          "error"
        );
        return;
      }

      if (!application) {
        showMessage(
          "We couldn't confirm your application submission. Please try again.",
          "error"
        );
        return;
      }

      // Successful submission
      showMessage(
        "Your gym application has been submitted successfully. Our team will review it and update your application status.",
        "success"
      );

      setFormData({
        ownerName: "",
        ownerPhone: "",
        gymName: "",
        description: "",
        address: "",
        city: "",
        district: "",
        contactPhone: "",
        monthlyPrice: "",
        openingTime: "",
        closingTime: "",
      });

      setFacilities([]);
      setServices([]);
      setCoverImage(null);
      setGalleryImages([]);
    } catch (error) {
      console.error("Unexpected gym application error:", error);

      showMessage(
        "Something went wrong while submitting your application. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-background px-4 py-12 text-brand-cream sm:px-6 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/gyms"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-brand-lime"
        >
          <ArrowLeft size={16} />
          Back to gyms
        </Link>

        {/* Heading */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-lime/10 text-brand-lime">
            <Building2 size={32} />
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-brand-lime">
            Join FitX Lanka
          </p>

          <h1 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
            List your <span className="text-brand-lime">Gym</span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
            Connect with fitness enthusiasts, showcase your facilities
            and help more people discover your gym through FitX Lanka.
          </p>
        </div>

        {/* Application steps */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              number: "01",
              title: "Apply",
              description: "Share your gym information and photos.",
            },
            {
              number: "02",
              title: "Get reviewed",
              description: "Our administration team reviews your details.",
            },
            {
              number: "03",
              title: "Get listed",
              description: "Your gym becomes visible after approval.",
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
              Gym application
            </h2>

            <p className="text-sm text-gray-400">
              Provide accurate information about your business,
              facilities and membership options.
            </p>
          </div>

          <div className="space-y-10">
            {/* Owner details */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <UserRound className="text-brand-lime" size={20} />
                <h3 className="font-semibold">Owner information</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Owner's full name</label>

                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="Enter the owner's full name"
                    maxLength={100}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Account email</label>

                  <input
                    type="email"
                    value={ownerEmail}
                    readOnly
                    placeholder={
                      authLoading ? "Loading account email..." : "Email"
                    }
                    className={`${inputClass} cursor-not-allowed opacity-60`}
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    This is the email address associated with your
                    FitX Lanka account.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Owner's phone number</label>

                  <input
                    type="tel"
                    name="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={handleChange}
                    placeholder="e.g. 0771234567"
                    maxLength={20}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Gym details */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <Building2 className="text-brand-lime" size={20} />
                <h3 className="font-semibold">Gym information</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Gym name</label>

                  <input
                    type="text"
                    name="gymName"
                    value={formData.gymName}
                    onChange={handleChange}
                    placeholder="Enter your gym name"
                    maxLength={150}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Gym description</label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your gym, training environment, equipment and what makes it special..."
                    rows={5}
                    maxLength={1500}
                    required
                    className={`${inputClass} resize-none`}
                  />

                  <p className="mt-2 text-right text-xs text-gray-500">
                    {formData.description.length}/1500 characters
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Street address</label>

                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your gym's full address"
                    maxLength={250}
                    required
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>City / Town</label>

                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Colombo"
                      maxLength={100}
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>District</label>

                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="e.g. Colombo"
                      maxLength={100}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Facilities */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <Dumbbell className="text-brand-lime" size={20} />
                <h3 className="font-semibold">Gym facilities</h3>
              </div>

              <p className="mb-5 text-sm leading-6 text-gray-400">
                Select all facilities available at your gym.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {facilityOptions.map((facility) => (
                  <label
                    key={facility}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm transition ${
                      facilities.includes(facility)
                        ? "border-brand-lime/40 bg-brand-lime/10 text-brand-lime"
                        : "border-white/10 bg-brand-background text-gray-400 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={facilities.includes(facility)}
                      onChange={() => toggleFacility(facility)}
                      className="h-4 w-4 accent-[#C7F36B]"
                    />

                    {facility}
                  </label>
                ))}
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Selected facilities: {facilities.length}
              </p>
            </section>

            {/* Services */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <CheckCircle2 className="text-brand-lime" size={20} />
                <h3 className="font-semibold">Services offered</h3>
              </div>

              <p className="mb-5 text-sm leading-6 text-gray-400">
                Select the services and programs your gym provides.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {serviceOptions.map((service) => (
                  <label
                    key={service}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm transition ${
                      services.includes(service)
                        ? "border-brand-lime/40 bg-brand-lime/10 text-brand-lime"
                        : "border-white/10 bg-brand-background text-gray-400 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={services.includes(service)}
                      onChange={() => toggleService(service)}
                      className="h-4 w-4 accent-[#C7F36B]"
                    />

                    {service}
                  </label>
                ))}
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Selected services: {services.length}
              </p>
            </section>

            {/* Pricing and opening hours */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <Clock className="text-brand-lime" size={20} />
                <h3 className="font-semibold">
                  Membership and opening hours
                </h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>
                    Monthly membership price (LKR)
                  </label>

                  <input
                    type="number"
                    name="monthlyPrice"
                    value={formData.monthlyPrice}
                    onChange={handleChange}
                    placeholder="e.g. 5000"
                    min="0"
                    step="0.01"
                    required
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    Enter your standard monthly membership price.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Opening time</label>

                    <input
                      type="time"
                      name="openingTime"
                      value={formData.openingTime}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Closing time</label>

                    <input
                      type="time"
                      name="closingTime"
                      value={formData.closingTime}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Gym contact phone number
                  </label>

                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="Enter the public gym contact number"
                    maxLength={20}
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    This can be different from the owner's personal number.
                  </p>
                </div>
              </div>
            </section>

            {/* Cover image */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <ImageIcon className="text-brand-lime" size={20} />
                <h3 className="font-semibold">Gym photos</h3>
              </div>

              <p className="mb-5 text-sm leading-6 text-gray-400">
                Upload a main cover image and additional photos of your
                gym. These images will help clients understand your
                facilities before visiting.
              </p>

              {/* Cover image */}
              <div className="mb-7">
                <label className={labelClass}>
                  Main cover image
                </label>

                {!coverImage ? (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-brand-background px-5 py-10 text-center transition hover:border-brand-lime/60">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-lime/10 text-brand-lime">
                      <Upload size={22} />
                    </div>

                    <span className="mb-2 text-sm font-medium">
                      Upload your gym cover image
                    </span>

                    <span className="text-xs text-gray-500">
                      JPG, PNG or WebP · Maximum 5 MB
                    </span>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleCoverImageChange}
                    />
                  </label>
                ) : (
                  <div className="relative overflow-hidden rounded-2xl border border-white/10">
                    <img
                      src={coverImage.preview}
                      alt="Gym cover preview"
                      className="h-64 w-full object-cover"
                    />

                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3">
                      <p className="truncate text-sm text-white">
                        {coverImage.file.name}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={removeCoverImage}
                      aria-label="Remove cover image"
                      className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white transition hover:bg-red-500"
                    >
                      <X size={17} />
                    </button>
                  </div>
                )}
              </div>

              {/* Gallery images */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className={labelClass}>
                    Additional gallery images
                  </label>

                  <span className="text-xs text-gray-500">
                    {galleryImages.length}/{MAX_GALLERY_IMAGES}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {galleryImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="group relative overflow-hidden rounded-xl border border-white/10"
                    >
                      <img
                        src={image.preview}
                        alt={`Gym gallery image ${index + 1}`}
                        className="h-36 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeGalleryImage(image.id)}
                        aria-label={`Remove gallery image ${index + 1}`}
                        className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white transition hover:bg-red-500"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}

                  {galleryImages.length < MAX_GALLERY_IMAGES && (
                    <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-brand-background p-4 text-center transition hover:border-brand-lime/60">
                      <Plus
                        size={24}
                        className="mb-2 text-brand-lime"
                      />

                      <span className="text-xs font-medium text-gray-300">
                        Add gallery images
                      </span>

                      <span className="mt-1 text-xs text-gray-500">
                        {MAX_GALLERY_IMAGES - galleryImages.length} remaining
                      </span>

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        multiple
                        className="hidden"
                        onChange={handleGalleryChange}
                      />
                    </label>
                  )}
                </div>

                <p className="mt-3 text-xs leading-5 text-gray-500">
                  You can upload up to 10 additional images. Each image
                  must be JPG, PNG or WebP and smaller than 5 MB.
                </p>
              </div>
            </section>

            {/* Approval notice */}
            <div className="flex gap-3 rounded-xl border border-brand-lime/20 bg-brand-lime/5 p-4">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-brand-lime"
              />

              <p className="text-sm leading-6 text-gray-400">
                Your gym application will be reviewed by the FitX Lanka
                administration team. Your gym will only become publicly
                visible after approval.
              </p>
            </div>

            {/* Message */}
            {formMessage && (
              <div
                className={`rounded-xl border p-4 text-sm leading-6 ${
                  messageType === "success"
                    ? "border-brand-lime/20 bg-brand-lime/5 text-brand-lime"
                    : "border-red-500/20 bg-red-500/5 text-red-400"
                }`}
              >
                {formMessage}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-lime px-6 py-4 font-bold text-brand-background transition hover:bg-[#d5ff82] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Uploading images & submitting...
                </>
              ) : authLoading ? (
                "Checking your account..."
              ) : (
                <>
                  Submit gym application
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-500">
              By submitting, you confirm that the information provided
              about your gym is accurate.
            </p>
          </div>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/gyms"
            className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-brand-lime"
          >
            <ArrowLeft size={15} />
            Explore gyms
          </Link>
        </div>
      </div>
    </main>
  );
}
