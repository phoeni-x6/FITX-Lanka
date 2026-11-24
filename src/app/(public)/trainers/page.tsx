
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import type { Trainer, TrainerQualification } from "@/data/trainers";

import TrainersHero from "@/components/trainers/TrainersHero";
import TrainerFilters from "@/components/trainers/TrainerFilters";
import TrainerGrid from "@/components/trainers/TrainerGrid";
import BecomeTrainerCTA from "@/components/trainers/BecomeTrainerCTA";

type PublicTrainerRow = {
  id: string;
  full_name: string;
  specialty: string;
  location: string;
  experience_years: number;
  price_per_session: number | null;
  profile_image_url: string | null;
  specialties: string[] | null;
  qualifications: TrainerQualification[] | null;
};

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchTrainers() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase.rpc("get_public_trainers");

      if (error) {
        console.error("Error fetching trainers:", error);
        setError("Unable to load trainers. Please try again later.");
        setTrainers([]);
        setLoading(false);
        return;
      }

      const formattedTrainers: Trainer[] = (
        (data ?? []) as PublicTrainerRow[]
      ).map((trainer) => ({
        id: trainer.id,
        name: trainer.full_name,
        specialty: trainer.specialty,
        location: trainer.location,
        experience: trainer.experience_years,
        price:
          trainer.price_per_session === null
            ? null
            : Number(trainer.price_per_session),
        image: trainer.profile_image_url,
        tags: trainer.specialties ?? [],
        qualifications: trainer.qualifications ?? [],
      }));

      setTrainers(formattedTrainers);
      setLoading(false);
    }

    fetchTrainers();
  }, [supabase]);

  const specialties = useMemo(() => {
    const values = trainers
      .map((trainer) => trainer.specialty)
      .filter(Boolean);

    return ["All", ...Array.from(new Set(values)).sort()];
  }, [trainers]);

  const locations = useMemo(() => {
    const values = trainers
      .map((trainer) => trainer.location)
      .filter(Boolean);

    return ["All Locations", ...Array.from(new Set(values)).sort()];
  }, [trainers]);

  const filteredTrainers = useMemo(() => {
    return trainers.filter((trainer) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        trainer.name.toLowerCase().includes(searchValue) ||
        trainer.specialty.toLowerCase().includes(searchValue) ||
        trainer.location.toLowerCase().includes(searchValue) ||
        trainer.qualifications.some((qualification) =>
          qualification.qualification_name
            .toLowerCase()
            .includes(searchValue)
        );

      const matchesSpecialty =
        selectedSpecialty === "All" ||
        trainer.specialty === selectedSpecialty;

      const matchesLocation =
        selectedLocation === "All Locations" ||
        trainer.location === selectedLocation;

      return matchesSearch && matchesSpecialty && matchesLocation;
    });
  }, [
    trainers,
    search,
    selectedSpecialty,
    selectedLocation,
  ]);

  const clearFilters = () => {
    setSearch("");
    setSelectedSpecialty("All");
    setSelectedLocation("All Locations");
  };

  return (
    <main className="min-h-screen bg-brand-charcoal">
      <TrainersHero />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <TrainerFilters
          search={search}
          setSearch={setSearch}
          specialty={selectedSpecialty}
          setSpecialty={setSelectedSpecialty}
          location={selectedLocation}
          setLocation={setSelectedLocation}
          specialties={specialties}
          locations={locations}
          clearFilters={clearFilters}
        />

        {loading ? (
          <div className="py-20 text-center text-white/60">
            Loading trainers...
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-400">
            {error}
          </div>
        ) : (
          <TrainerGrid
            trainers={filteredTrainers}
            clearFilters={clearFilters}
          />
        )}
      </section>

      <BecomeTrainerCTA />
    </main>
  );
}
