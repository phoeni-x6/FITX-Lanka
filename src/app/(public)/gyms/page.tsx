
"use client";

import { useMemo, useState } from "react";

import GymsHero from "@/components/gyms/GymsHero";
import GymFilters from "@/components/gyms/GymFilters";
import GymGrid from "@/components/gyms/GymGrid";
import BecomeGymCTA from "@/components/gyms/BecomeGymCTA";

import {
  gyms,
  gymLocations,
  gymFacilities,
} from "@/data/gyms";

export default function GymsPage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [facility, setFacility] = useState("All Facilities");

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

      return (
        matchesSearch &&
        matchesLocation &&
        matchesFacility
      );
    });
  }, [search, location, facility]);

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
          <GymGrid
            gyms={filteredGyms}
            clearFilters={clearFilters}
          />
        </div>
      </section>

      <BecomeGymCTA />
    </>
  );
}
