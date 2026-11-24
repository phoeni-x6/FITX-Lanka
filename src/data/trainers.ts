export type TrainerQualification = {
  qualification_id: string;
  qualification_name: string;
  institution: string;
  year_obtained: number | null;
};

export type Trainer = {
  id: string;
  name: string;
  specialty: string;
  location: string;
  experience: number;
  price: number | null;
  image: string | null;
  tags: string[];
  qualifications: TrainerQualification[];
};