"use client";

import { useEffect, useMemo, useState } from "react";

import GymsHero from "@/components/gyms/GymsHero";
import GymFilters from "@/components/gyms/GymFilters";
import GymGrid from "@/components/gyms/GymGrid";
import BecomeGymCTA from "@/components/gyms/BecomeGymCTA";

import { createClient } from "@/lib/supabase/client";
import type { Gym } from "@/data/gyms";

const supabase = createClient();

const defaultImage =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=85";

export default function GymsPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [facility, setFacility] = useState("All Facilities");

  useEffect(() => {
    const fetchGyms = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("gym_profiles")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error fetching gyms:", fetchError);
        setError("Unable to load gyms. Please try again later.");
        setGyms([]);
        setLoading(false);
        return;
      }

      const formattedGyms: Gym[] = (data || []).map((gym) => ({
        id: gym.id,
        name: gym.gym_name,
        location: gym.city || gym.location || "Sri Lanka",
        description: gym.description || "Explore this gym on FitX Lanka.",
        image: gym.cover_image_url || defaultImage,
        rating: null,
        reviews: 0,
        membershipPrice:
          gym.monthly_price !== null
            ? Number(gym.monthly_price)
            : null,
        facilities: gym.facilities || [],
      }));

      setGyms(formattedGyms);
      setLoading(false);
    };

    fetchGyms();
  }, []);

  const gymLocations = useMemo(() => {
    const locations = Array.from(
      new Set(gyms.map((gym) => gym.location).filter(Boolean))
    ).sort();

    return ["All Locations", ...locations];
  }, [gyms]);

  const gymFacilities = useMemo(() => {
    const facilities = Array.from(
      new Set(gyms.flatMap((gym) => gym.facilities))
    ).sort();

    return ["All Facilities", ...facilities];
  }, [gyms]);

  const clearFilters = () => {
    setSearch("");
    setLocation("All Locations");
    setFacility("All Facilities");
  };

  const filteredGyms = useMemo(() => {
    return gyms.filter((gym) => {
      const searchTerm = search.toLowerCase().trim();

      const matchesSearch =
        gym.name.toLowerCase().includes(searchTerm) ||
        gym.location.toLowerCase().includes(searchTerm) ||
        gym.description.toLowerCase().includes(searchTerm) ||
        gym.facilities.some((item) =>
          item.toLowerCase().includes(searchTerm)
        );

      const matchesLocation =
        location === "All Locations" ||
        gym.location === location;

      const matchesFacility =
        facility === "All Facilities" ||
        gym.facilities.includes(facility);

      return matchesSearch && matchesLocation && matchesFacility;
    });
  }, [gyms, search, location, facility]);

  return (
    <>
      <GymsHero />

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <GymFilters
          search={search}
          setSearch={setSearch}
          location={location}
          setLocation={setLocation}
          facility={facility}
          setFacility={setFacility}
          locations={gymLocations}
          facilities={gymFacilities}
          clearFilters={clearFilters}
        />

        <div className="mt-10">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-lime border-t-transparent" />
                <p className="mt-4 text-sm text-gray-400">
                  Loading gyms...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-12 text-center">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : (
            <GymGrid
              gyms={filteredGyms}
              clearFilters={clearFilters}
            />
          )}
        </div>
      </section>

      <BecomeGymCTA />
    </>
  );
}