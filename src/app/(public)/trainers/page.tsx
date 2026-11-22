
"use client";

import { useMemo, useState } from "react";
import TrainersHero from "@/components/trainers/TrainersHero";
import TrainerFilters from "@/components/trainers/TrainerFilters";
import TrainerGrid from "@/components/trainers/TrainerGrid";
import BecomeTrainerCTA from "@/components/trainers/BecomeTrainerCTA";
import { trainers, specialties, locations } from "@/data/trainers";

export default function TrainersPage() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [location, setLocation] = useState("All Locations");

  const filteredTrainers = useMemo(() => {
    return trainers.filter((trainer) => {
      const matchesSearch =
        trainer.name.toLowerCase().includes(search.toLowerCase()) ||
        trainer.specialty.toLowerCase().includes(search.toLowerCase()) ||
        trainer.tags.some((tag) =>
          tag.toLowerCase().includes(search.toLowerCase())
        );

      const matchesSpecialty =
        specialty === "All" || trainer.specialty === specialty;

      const matchesLocation =
        location === "All Locations" || trainer.location === location;

      return matchesSearch && matchesSpecialty && matchesLocation;
    });
  }, [search, specialty, location]);

  const clearFilters = () => {
    setSearch("");
    setSpecialty("All");
    setLocation("All Locations");
  };

  return (
    <div className="min-h-screen bg-brand-background text-brand-cream">
      <TrainersHero />

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
        <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">
              Find your match
            </p>

            <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">
              Explore Personal Trainers
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Browse trainers and find the right fit for your goals.
            </p>
          </div>

          <p className="text-sm text-gray-400">
            <span className="font-bold text-brand-cream">
              {filteredTrainers.length}
            </span>{" "}
            trainers found
          </p>
        </div>

        <TrainerFilters
          search={search}
          setSearch={setSearch}
          specialty={specialty}
          setSpecialty={setSpecialty}
          location={location}
          setLocation={setLocation}
          specialties={specialties}
          locations={locations}
          clearFilters={clearFilters}
        />

        <TrainerGrid
          trainers={filteredTrainers}
          clearFilters={clearFilters}
        />
      </section>

      <BecomeTrainerCTA />
    </div>
  );
}
