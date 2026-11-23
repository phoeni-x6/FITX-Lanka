
"use client";

import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Dumbbell,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  UserRound,
  X,
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

type GymForm = {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  gymName: string;
  description: string;
  address: string;
  city: string;
  district: string;
  contactPhone: string;
  monthlyPrice: string;
  openingTime: string;
  closingTime: string;
};

type GalleryImage = {
  id: string;
  url: string;
  file?: File;
};

const emptyForm: GymForm = {
  ownerName: "",
  ownerEmail: "",
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
};

export default function GymProfileEditorPage() {
  const supabase = createClient();

  const [userId, setUserId] = useState("");
  const [gymId, setGymId] = useState("");
  const [form, setForm] = useState<GymForm>(emptyForm);

  const [facilities, setFacilities] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);

  const [existingCover, setExistingCover] = useState("");
  const [newCover, setNewCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [removeCover, setRemoveCover] = useState(false);

  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-brand-background px-4 py-3.5 text-sm text-brand-cream outline-none transition placeholder:text-gray-600 focus:border-brand-lime";

  const labelClass = "mb-2 block text-sm text-gray-300";

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage(text);
    setMessageType(type);
  };

  const clearMessage = () => setMessage("");

  const loadGymProfile = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        showMessage("Please log in to edit your gym profile.", "error");
        return;
      }

      setUserId(user.id);

      const { data: gym, error } = await supabase
        .from("gym_profiles")
        .select("*")
        .eq("owner_id", user.id)
        .eq("is_approved", true)
        .maybeSingle();

      if (error) {
        console.error("Gym profile loading error:", error);
        showMessage("Unable to load your gym profile. Please try again.", "error");
        return;
      }

      if (!gym) {
        showMessage(
          "No approved gym profile was found for your account.",
          "error"
        );
        return;
      }

      setGymId(gym.id);

      setForm({
        ownerName: gym.owner_name || "",
        ownerEmail: gym.owner_email || user.email || "",
        ownerPhone: gym.owner_phone || "",
        gymName: gym.gym_name || "",
        description: gym.description || "",
        address: gym.address || "",
        city: gym.city || "",
        district: gym.district || "",
        contactPhone: gym.contact_phone || "",
        monthlyPrice:
          gym.monthly_price !== null && gym.monthly_price !== undefined
            ? String(gym.monthly_price)
            : "",
        openingTime: gym.opening_time?.slice(0, 5) || "",
        closingTime: gym.closing_time?.slice(0, 5) || "",
      });

      setFacilities(gym.facilities || []);
      setServices(gym.services || []);
      setExistingCover(gym.cover_image_url || "");
      setCoverPreview(gym.cover_image_url || "");
      setRemoveCover(false);

      setGallery(
        (gym.gallery_images || []).map((url: string, index: number) => ({
          id: `existing-${index}-${url}`,
          url,
        }))
      );
    } catch (error) {
      console.error("Unexpected profile loading error:", error);
      showMessage("Something went wrong while loading your profile.", "error");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadGymProfile();
  }, [loadGymProfile]);

  // Revoke temporary image previews when the component unmounts.
  useEffect(() => {
    return () => {
      if (coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }

      gallery.forEach((image) => {
        if (image.url.startsWith("blob:")) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [coverPreview, gallery]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearMessage();
  };

  const toggleOption = (
    value: string,
    current: string[],
    setter: (items: string[]) => void
  ) => {
    setter(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
    clearMessage();
  };

  const validateImage = (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Please select a JPG, PNG or WebP image.";
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return "Each image must be smaller than 5 MB.";
    }

    return null;
  };

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImage(file);

    if (error) {
      showMessage(error, "error");
      e.target.value = "";
      return;
    }

    if (coverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }

    const preview = URL.createObjectURL(file);

    setNewCover(file);
    setCoverPreview(preview);
    setRemoveCover(false);
    clearMessage();

    e.target.value = "";
  };

  const removeCoverImage = () => {
    if (coverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }

    setNewCover(null);
    setCoverPreview("");
    setRemoveCover(true);
    clearMessage();
  };

  const handleGalleryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_GALLERY_IMAGES - gallery.length;

    if (remaining <= 0) {
      showMessage("You can upload a maximum of 10 gallery images.", "error");
      e.target.value = "";
      return;
    }

    const selected = files.slice(0, remaining);
    const validImages: GalleryImage[] = [];

    for (const file of selected) {
      const error = validateImage(file);

      if (error) {
        showMessage(error, "error");
        continue;
      }

      validImages.push({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
      });
    }

    setGallery((prev) => [...prev, ...validImages]);

    if (files.length > remaining) {
      showMessage(
        `Only ${remaining} additional gallery image(s) could be added.`,
        "error"
      );
    } else if (validImages.length) {
      clearMessage();
    }

    e.target.value = "";
  };

  const removeGalleryImage = (id: string) => {
    setGallery((prev) => {
      const image = prev.find((item) => item.id === id);

      if (image?.url.startsWith("blob:")) {
        URL.revokeObjectURL(image.url);
      }

      return prev.filter((item) => item.id !== id);
    });

    clearMessage();
  };

  const uploadImage = async (
    file: File,
    folder: "cover" | "gallery"
  ): Promise<string> => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const path =
      folder === "cover"
        ? `${userId}/cover-${crypto.randomUUID()}.${extension}`
        : `${userId}/gallery/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("gym-images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error("Gym image upload error:", error);
      throw new Error("IMAGE_UPLOAD_FAILED");
    }

    const { data } = supabase.storage
      .from("gym-images")
      .getPublicUrl(path);

    return data.publicUrl;
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (saving) return;

    if (!gymId || !userId) {
      showMessage("Your gym profile could not be identified.", "error");
      return;
    }

    if (!form.ownerName.trim() || !form.ownerPhone.trim()) {
      showMessage("Please enter the owner's name and phone number.", "error");
      return;
    }

    if (!form.gymName.trim()) {
      showMessage("Please enter your gym name.", "error");
      return;
    }

    if (!form.description.trim()) {
      showMessage("Please provide a gym description.", "error");
      return;
    }

    if (!form.address.trim() || !form.city.trim() || !form.district.trim()) {
      showMessage("Please complete your address, city and district.", "error");
      return;
    }

    if (!facilities.length) {
      showMessage("Please select at least one gym facility.", "error");
      return;
    }

    if (!services.length) {
      showMessage("Please select at least one gym service.", "error");
      return;
    }

    const price = Number(form.monthlyPrice);

    if (
      form.monthlyPrice.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0 ||
      price > 99999999
    ) {
      showMessage("Please enter a valid monthly membership price.", "error");
      return;
    }

    if (
      form.openingTime &&
      form.closingTime &&
      form.openingTime === form.closingTime
    ) {
      showMessage(
        "Opening and closing times cannot be identical.",
        "error"
      );
      return;
    }

    setSaving(true);
    clearMessage();

    try {
      // Confirm the current session before saving.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user || user.id !== userId) {
        showMessage("Your session has expired. Please log in again.", "error");
        return;
      }

      let coverUrl = removeCover ? null : existingCover;

      if (newCover) {
        coverUrl = await uploadImage(newCover, "cover");
      }

      const newGalleryUrls = await Promise.all(
        gallery
          .filter((image) => image.file)
          .map((image) => uploadImage(image.file!, "gallery"))
      );

      const galleryUrls = [
        ...gallery
          .filter((image) => !image.file)
          .map((image) => image.url),
        ...newGalleryUrls,
      ];

      const { data: updated, error } = await supabase
        .from("gym_profiles")
        .update({
          owner_name: form.ownerName.trim(),
          owner_email: form.ownerEmail.trim(),
          owner_phone: form.ownerPhone.trim(),
          gym_name: form.gymName.trim(),
          description: form.description.trim(),
          location: `${form.city.trim()}, ${form.district.trim()}`,
          address: form.address.trim(),
          city: form.city.trim(),
          district: form.district.trim(),
          contact_phone: form.contactPhone.trim() || null,
          monthly_price: price,
          facilities,
          services,
          opening_time: form.openingTime || null,
          closing_time: form.closingTime || null,
          cover_image_url: coverUrl,
          gallery_images: galleryUrls,
          updated_at: new Date().toISOString(),
        })
        .eq("id", gymId)
        .eq("owner_id", user.id)
        .eq("is_approved", true)
        .select("id")
        .maybeSingle();

      if (error) {
        console.error("Gym profile update error:", error);
        showMessage(
          error.code === "42501"
            ? "You do not have permission to update this gym profile."
            : "We couldn't save your changes. Please try again.",
          "error"
        );
        return;
      }

      if (!updated) {
        showMessage(
          "No gym profile was updated. Please refresh and try again.",
          "error"
        );
        return;
      }

      setExistingCover(coverUrl || "");
      setNewCover(null);
      setRemoveCover(false);
      setGallery(
        galleryUrls.map((url, index) => ({
          id: `saved-${index}-${url}`,
          url,
        }))
      );
      setCoverPreview(coverUrl || "");

      showMessage("Your gym profile has been updated successfully.", "success");
    } catch (error) {
      console.error("Gym profile save error:", error);
      showMessage(
        error instanceof Error && error.message === "IMAGE_UPLOAD_FAILED"
          ? "We couldn't upload one or more images. Please try again."
          : "Something went wrong while saving your profile.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const OptionGrid = ({
    options,
    selected,
    onToggle,
  }: {
    options: string[];
    selected: string[];
    onToggle: (value: string) => void;
  }) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => (
        <label
          key={option}
          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm transition ${
            selected.includes(option)
              ? "border-brand-lime/40 bg-brand-lime/10 text-brand-lime"
              : "border-white/10 bg-brand-background text-gray-400 hover:border-white/20"
          }`}
        >
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={() => onToggle(option)}
            className="h-4 w-4 accent-[#C7F36B]"
          />
          {option}
        </label>
      ))}
    </div>
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-background text-brand-cream">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <Loader2 className="animate-spin text-brand-lime" size={22} />
          Loading gym profile...
        </div>
      </main>
    );
  }

  if (!gymId) {
    return (
      <main className="min-h-screen bg-brand-background px-4 py-12 text-brand-cream">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-brand-card p-8 text-center">
          <Building2 className="mx-auto mb-4 text-brand-lime" size={36} />
          <h1 className="mb-3 text-xl font-bold">Gym profile unavailable</h1>
          <p className="mb-6 text-sm leading-6 text-gray-400">{message}</p>
          <Link
            href="/gym/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-lime px-5 py-3 font-semibold text-brand-background"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-background px-4 py-8 text-brand-cream sm:px-6 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/gym/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-brand-lime"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-lime/10 text-brand-lime">
            <Building2 size={28} />
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-lime">
            Gym management
          </p>

          <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
            Edit gym <span className="text-brand-lime">profile</span>
          </h1>

          <p className="max-w-2xl text-sm leading-7 text-gray-400">
            Keep your gym information, membership details and photos
            up to date so clients can discover what you offer.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="rounded-3xl border border-white/10 bg-brand-card p-5 shadow-2xl sm:p-8 lg:p-10"
        >
          <div className="space-y-10">
            {/* Owner information */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <UserRound className="text-brand-lime" size={20} />
                <h2 className="font-semibold">Owner information</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Owner's full name</label>
                  <input
                    name="ownerName"
                    value={form.ownerName}
                    onChange={handleChange}
                    maxLength={100}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Account email</label>
                  <input
                    type="email"
                    value={form.ownerEmail}
                    readOnly
                    className={`${inputClass} cursor-not-allowed opacity-60`}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Your account email is displayed as read-only.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Owner's phone number</label>
                  <input
                    name="ownerPhone"
                    type="tel"
                    value={form.ownerPhone}
                    onChange={handleChange}
                    maxLength={20}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Gym information */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <Building2 className="text-brand-lime" size={20} />
                <h2 className="font-semibold">Gym information</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Gym name</label>
                  <input
                    name="gymName"
                    value={form.gymName}
                    onChange={handleChange}
                    maxLength={150}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Gym description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                    maxLength={1500}
                    required
                    className={`${inputClass} resize-none`}
                  />
                  <p className="mt-2 text-right text-xs text-gray-500">
                    {form.description.length}/1500 characters
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Street address</label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    maxLength={250}
                    required
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>City / Town</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      maxLength={100}
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>District</label>
                    <input
                      name="district"
                      value={form.district}
                      onChange={handleChange}
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
                <h2 className="font-semibold">Gym facilities</h2>
              </div>

              <p className="mb-5 text-sm text-gray-400">
                Select all facilities available at your gym.
              </p>

              <OptionGrid
                options={facilityOptions}
                selected={facilities}
                onToggle={(value) =>
                  toggleOption(value, facilities, setFacilities)
                }
              />

              <p className="mt-3 text-xs text-gray-500">
                Selected facilities: {facilities.length}
              </p>
            </section>

            {/* Services */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <CheckCircle2 className="text-brand-lime" size={20} />
                <h2 className="font-semibold">Services offered</h2>
              </div>

              <p className="mb-5 text-sm text-gray-400">
                Select the services and programs your gym provides.
              </p>

              <OptionGrid
                options={serviceOptions}
                selected={services}
                onToggle={(value) =>
                  toggleOption(value, services, setServices)
                }
              />

              <p className="mt-3 text-xs text-gray-500">
                Selected services: {services.length}
              </p>
            </section>

            {/* Pricing and hours */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <Clock className="text-brand-lime" size={20} />
                <h2 className="font-semibold">
                  Membership and opening hours
                </h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>
                    Monthly membership price (LKR)
                  </label>
                  <input
                    type="number"
                    name="monthlyPrice"
                    value={form.monthlyPrice}
                    onChange={handleChange}
                    min="0"
                    max="99999999"
                    step="0.01"
                    required
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Opening time</label>
                    <input
                      type="time"
                      name="openingTime"
                      value={form.openingTime}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Closing time</label>
                    <input
                      type="time"
                      name="closingTime"
                      value={form.closingTime}
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
                    value={form.contactPhone}
                    onChange={handleChange}
                    maxLength={20}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Images */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <ImageIcon className="text-brand-lime" size={20} />
                <h2 className="font-semibold">Gym photos</h2>
              </div>

              <p className="mb-5 text-sm leading-6 text-gray-400">
                Replace your cover image or manage your gallery.
                JPG, PNG and WebP images are supported, up to 5 MB each.
              </p>

              <div className="mb-7">
                <label className={labelClass}>Main cover image</label>

                {coverPreview ? (
                  <div className="relative overflow-hidden rounded-2xl border border-white/10">
                    <img
                      src={coverPreview}
                      alt="Gym cover"
                      className="h-64 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={removeCoverImage}
                      className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white transition hover:bg-red-500"
                      aria-label="Remove cover image"
                    >
                      <Trash2 size={17} />
                    </button>

                    {newCover && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3 text-xs text-white">
                        New cover image selected
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-brand-background px-5 py-10 text-center transition hover:border-brand-lime/60">
                    <Upload size={24} className="mb-3 text-brand-lime" />
                    <span className="text-sm font-medium">
                      Upload gym cover image
                    </span>
                    <span className="mt-2 text-xs text-gray-500">
                      JPG, PNG or WebP · Maximum 5 MB
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleCoverChange}
                    />
                  </label>
                )}

                {!coverPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setRemoveCover(false);
                      setCoverPreview(existingCover);
                    }}
                    disabled={!existingCover}
                    className="mt-2 text-xs text-gray-500 hover:text-brand-lime disabled:hidden"
                  >
                    Restore existing cover
                  </button>
                )}
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className={labelClass}>
                    Additional gallery images
                  </label>
                  <span className="text-xs text-gray-500">
                    {gallery.length}/{MAX_GALLERY_IMAGES}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {gallery.map((image, index) => (
                    <div
                      key={image.id}
                      className="group relative overflow-hidden rounded-xl border border-white/10"
                    >
                      <img
                        src={image.url}
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

                      {image.file && (
                        <span className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 text-center text-xs text-brand-lime">
                          New image
                        </span>
                      )}
                    </div>
                  ))}

                  {gallery.length < MAX_GALLERY_IMAGES && (
                    <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-brand-background p-4 text-center transition hover:border-brand-lime/60">
                      <Plus size={24} className="mb-2 text-brand-lime" />
                      <span className="text-xs font-medium text-gray-300">
                        Add gallery images
                      </span>
                      <span className="mt-1 text-xs text-gray-500">
                        {MAX_GALLERY_IMAGES - gallery.length} remaining
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
                  Maximum 10 gallery images. Existing images remain until
                  you remove them.
                </p>
              </div>
            </section>

            {/* Feedback */}
            {message && (
              <div
                className={`rounded-xl border p-4 text-sm leading-6 ${
                  messageType === "success"
                    ? "border-brand-lime/20 bg-brand-lime/5 text-brand-lime"
                    : "border-red-500/20 bg-red-500/5 text-red-400"
                }`}
              >
                {message}
              </div>
            )}

            {/* Save */}
            <div className="border-t border-white/10 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-lime px-6 py-4 font-bold text-brand-background transition hover:bg-[#d5ff82] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Saving changes...
                  </>
                ) : (
                  <>
                    <Save size={19} />
                    Save gym profile
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs text-gray-500">
                Your changes will be reflected on your public gym profile.
              </p>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
