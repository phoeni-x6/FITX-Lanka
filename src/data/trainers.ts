
export type Trainer = {
  id: number;
  name: string;
  specialty: string;
  location: string;
  experience: number;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  tags: string[];
};

export const trainers: Trainer[] = [
  {
    id: 1,
    name: "Alex Morgan",
    specialty: "Strength Training",
    location: "Colombo",
    experience: 6,
    price: 3500,
    rating: 4.9,
    reviews: 28,
    image:
      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=700&q=85",
    tags: ["Strength", "Muscle Building"],
  },
  {
    id: 2,
    name: "Sarah Fernando",
    specialty: "Weight Loss",
    location: "Nugegoda",
    experience: 4,
    price: 2500,
    rating: 4.8,
    reviews: 19,
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=700&q=85",
    tags: ["Weight Loss", "Fitness"],
  },
  {
    id: 3,
    name: "Daniel Perera",
    specialty: "Bodybuilding",
    location: "Kandy",
    experience: 8,
    price: 4000,
    rating: 5.0,
    reviews: 35,
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=700&q=85",
    tags: ["Bodybuilding", "Strength"],
  },
  {
    id: 4,
    name: "Michael Silva",
    specialty: "Functional Fitness",
    location: "Colombo",
    experience: 5,
    price: 3000,
    rating: 4.7,
    reviews: 16,
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=85",
    tags: ["Functional", "Fitness"],
  },
  {
    id: 5,
    name: "Emily Jayawardena",
    specialty: "Yoga & Mobility",
    location: "Galle",
    experience: 7,
    price: 2800,
    rating: 4.9,
    reviews: 24,
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=700&q=85",
    tags: ["Yoga", "Mobility"],
  },
  {
    id: 6,
    name: "Ryan Fernando",
    specialty: "Strength Training",
    location: "Negombo",
    experience: 3,
    price: 2200,
    rating: 4.8,
    reviews: 12,
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=700&q=85",
    tags: ["Strength", "Beginner Fitness"],
  },
];

export const specialties = [
  "All",
  "Strength Training",
  "Weight Loss",
  "Bodybuilding",
  "Functional Fitness",
  "Yoga & Mobility",
];

export const locations = [
  "All Locations",
  "Colombo",
  "Nugegoda",
  "Kandy",
  "Galle",
  "Negombo",
];
