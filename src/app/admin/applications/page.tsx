
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Dumbbell,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ApplicationStatus = "pending" | "approved" | "rejected";

type TrainerApplication = {
  id: string;
  user_id: string;
  full_name: string;
  specialty: string;
  specialties: string[] | null;
  location: string;
  locations: string[] | null;
  experience_years: number;
  profile_image_url: string | null;
  status: string;
  created_at: string;
};

type GymApplication = {
  id: string;
  user_id: string;
  gym_name: string;
  owner_name: string;
  city: string;
  district: string;
  cover_image_url: string | null;
  status: string;
  created_at: string;
};

type ApplicationType = "trainers" | "gyms";
type StatusFilter = "all" | ApplicationStatus;

export default function AdminApplicationsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [activeTab, setActiveTab] =
    useState<ApplicationType>("trainers");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [search, setSearch] = useState("");

  const [trainers, setTrainers] = useState<TrainerApplication[]>([]);
  const [gyms, setGyms] = useState<GymApplication[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        { data: trainerData, error: trainerError },
        { data: gymData, error: gymError },
      ] = await Promise.all([
        supabase
          .from("trainer_applications")
          .select(
            "id, user_id, full_name, specialty, specialties, location, locations, experience_years, profile_image_url, status, created_at"
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("gym_applications")
          .select(
            "id, user_id, gym_name, owner_name, city, district, cover_image_url, status, created_at"
          )
          .order("created_at", { ascending: false }),
      ]);

      if (trainerError) throw trainerError;
      if (gymError) throw gymError;

      setTrainers((trainerData || []) as TrainerApplication[]);
      setGyms((gymData || []) as GymApplication[]);
    } catch (err) {
      console.error("Admin applications error:", err);
      setError(
        "Unable to load applications. Please check your admin access and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const counts = useMemo(() => {
    const all = [...trainers, ...gyms];

    return {
      total: all.length,
      pending: all.filter(
        (application) => application.status === "pending"
      ).length,
      approved: all.filter(
        (application) => application.status === "approved"
      ).length,
      rejected: all.filter(
        (application) => application.status === "rejected"
      ).length,
    };
  }, [trainers, gyms]);

  const filteredTrainers = useMemo(() => {
    return trainers.filter((application) => {
      const matchesStatus =
        statusFilter === "all" ||
        application.status === statusFilter;

      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        application.full_name?.toLowerCase().includes(searchValue) ||
        application.specialty?.toLowerCase().includes(searchValue) ||
        application.locations?.some((location) =>
          location.toLowerCase().includes(searchValue)
        ) ||
        application.location?.toLowerCase().includes(searchValue);

      return matchesStatus && matchesSearch;
    });
  }, [trainers, statusFilter, search]);

  const filteredGyms = useMemo(() => {
    return gyms.filter((application) => {
      const matchesStatus =
        statusFilter === "all" ||
        application.status === statusFilter;

      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        application.gym_name?.toLowerCase().includes(searchValue) ||
        application.owner_name?.toLowerCase().includes(searchValue) ||
        application.city?.toLowerCase().includes(searchValue) ||
        application.district?.toLowerCase().includes(searchValue);

      return matchesStatus && matchesSearch;
    });
  }, [gyms, statusFilter, search]);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-brand-lime/10 text-brand-lime border-brand-lime/20";
      case "rejected":
        return "bg-red-400/10 text-red-400 border-red-400/20";
      default:
        return "bg-yellow-400/10 text-yellow-400 border-yellow-400/20";
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-LK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const currentApplications =
    activeTab === "trainers" ? filteredTrainers : filteredGyms;

  return (
    <div className="min-h-screen bg-brand-background px-5 py-10 md:px-8 md:py-14">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-10">
          <div>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-lime transition mb-5"
            >
              <ArrowLeft size={16} />
              Back to Admin Dashboard
            </Link>

            <p className="text-brand-lime text-xs font-bold uppercase tracking-[0.2em] mb-3">
              Administration
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-brand-cream">
              Applications
            </h1>

            <p className="text-gray-400 mt-2">
              Review and manage trainer and gym applications.
            </p>
          </div>

          <button
            onClick={loadApplications}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-brand-card px-5 py-3 text-sm font-semibold text-brand-cream hover:border-brand-lime/40 transition disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Applications",
              value: counts.total,
              icon: FileText,
              color: "text-brand-cream",
            },
            {
              label: "Pending",
              value: counts.pending,
              icon: Clock,
              color: "text-yellow-400",
            },
            {
              label: "Approved",
              value: counts.approved,
              icon: CheckCircle2,
              color: "text-brand-lime",
            },
            {
              label: "Rejected",
              value: counts.rejected,
              icon: XCircle,
              color: "text-red-400",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="bg-brand-card border border-white/10 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs sm:text-sm text-gray-400">
                    {item.label}
                  </p>
                  <Icon size={19} className={item.color} />
                </div>

                <p className={`text-2xl md:text-3xl font-bold ${item.color}`}>
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Application tabs */}
        <div className="bg-brand-card border border-white/10 rounded-2xl p-2 flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("trainers")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === "trainers"
                ? "bg-brand-lime text-brand-background"
                : "text-gray-400 hover:text-brand-cream"
            }`}
          >
            <Dumbbell size={17} />
            Trainers
            <span className="text-xs opacity-70">
              ({trainers.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab("gyms")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === "gyms"
                ? "bg-brand-lime text-brand-background"
                : "text-gray-400 hover:text-brand-cream"
            }`}
          >
            <Building2 size={17} />
            Gyms
            <span className="text-xs opacity-70">
              ({gyms.length})
            </span>
          </button>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                activeTab === "trainers"
                  ? "Search trainers, specialties or locations..."
                  : "Search gyms, owners or locations..."
              }
              className="w-full bg-brand-card border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-brand-cream placeholder:text-gray-500 outline-none focus:border-brand-lime/50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            className="bg-brand-card border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream outline-none focus:border-brand-lime/50"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-400/5 border border-red-400/20 rounded-xl p-5 mb-6">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={loadApplications}
              className="text-sm text-brand-cream underline mt-3"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-brand-card border border-white/10 rounded-2xl py-20 text-center">
            <Loader2 className="w-9 h-9 text-brand-lime animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-400">
              Loading applications...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-cream">
                {activeTab === "trainers"
                  ? "Trainer Applications"
                  : "Gym Applications"}
              </h2>

              <span className="text-xs text-gray-500">
                {currentApplications.length} results
              </span>
            </div>

            {currentApplications.length === 0 ? (
              <div className="bg-brand-card border border-white/10 rounded-2xl py-16 px-6 text-center">
                <Users
                  size={36}
                  className="text-gray-500 mx-auto mb-4"
                />

                <h3 className="text-brand-cream font-semibold mb-2">
                  No applications found
                </h3>

                <p className="text-sm text-gray-500">
                  Try changing your search or status filter.
                </p>
              </div>
            ) : (
              currentApplications.map((application) => {
                const isTrainer = activeTab === "trainers";

                const name = isTrainer
                  ? (application as TrainerApplication).full_name
                  : (application as GymApplication).gym_name;

                const image = isTrainer
                  ? (application as TrainerApplication).profile_image_url
                  : (application as GymApplication).cover_image_url;

                const location = isTrainer
                  ? (
                      (application as TrainerApplication).locations?.join(", ") ||
                      (application as TrainerApplication).location
                    )
                  : [
                      (application as GymApplication).city,
                      (application as GymApplication).district,
                    ]
                        .filter(Boolean)
                        .join(", ");

                const subtitle = isTrainer
                  ? (
                      (application as TrainerApplication).specialties?.join(", ") ||
                      (application as TrainerApplication).specialty
                    )
                  : `Owner: ${(application as GymApplication).owner_name}`;

                const status = application.status || "pending";

                return (
                  <div
                    key={application.id}
                    className="bg-brand-card border border-white/10 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-5"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-brand-background border border-white/10 shrink-0 flex items-center justify-center">
                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        isTrainer ? (
                          <Dumbbell className="text-gray-500" size={25} />
                        ) : (
                          <Building2 className="text-gray-500" size={25} />
                        )
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-brand-cream font-bold text-lg truncate">
                          {name}
                        </h3>

                        <span
                          className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border ${getStatusStyle(status)}`}
                        >
                          {status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-400 mb-2">
                        {subtitle}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Eye size={13} />
                          {location || "Location not provided"}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Clock size={13} />
                          {formatDate(application.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
  <Link
    href={`/admin/applications/${isTrainer ? "trainer" : "gym"}/${application.id}`}
    className="inline-flex items-center gap-2 rounded-xl bg-brand-lime px-5 py-3 text-sm font-semibold text-brand-background transition hover:bg-[#d7ff85]"
  >
    <Eye size={16} />
    Review Application
  </Link>
</div>  
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
