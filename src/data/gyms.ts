
export type Gym = {
  id: number;
  name: string;
  location: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  membershipPrice: number | null;
  facilities: string[];
};

export const gyms: Gym[] = [
  {
    id: 1,
    name: "Iron Nation Fitness",
    location: "Colombo",
    description:
      "A modern training space equipped for strength training, bodybuilding, and general fitness.",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=85",
    rating: 4.9,
    reviews: 42,
    membershipPrice: 8500,
    facilities: ["Weight Training", "Cardio", "Personal Training"],
  },
  {
    id: 2,
    name: "The Fitness Lab",
    location: "Nugegoda",
    description:
      "A welcoming fitness environment with equipment and training options for different fitness levels.",
    image:
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=900&q=85",
    rating: 4.8,
    reviews: 31,
    membershipPrice: 6500,
    facilities: ["Weight Training", "Group Classes", "Cardio"],
  },
  {
    id: 3,
    name: "Powerhouse Gym",
    location: "Kandy",
    description:
      "A strength-focused gym for members looking to build muscle and improve performance.",
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&q=85",
    rating: 4.7,
    reviews: 26,
    membershipPrice: 5500,
    facilities: ["Weight Training", "Bodybuilding", "Personal Training"],
  },
  {
    id: 4,
    name: "Elevate Fitness Studio",
    location: "Galle",
    description:
      "A fitness studio offering a balanced approach to movement, conditioning, and strength.",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=85",
    rating: 4.9,
    reviews: 18,
    membershipPrice: 7500,
    facilities: ["Yoga", "Group Classes", "Functional Training"],
  },
  {
    id: 5,
    name: "Apex Fitness Club",
    location: "Negombo",
    description:
      "A versatile training facility for beginners and experienced gym members.",
    image:
      "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=900&q=85",
    rating: 4.8,
    reviews: 22,
    membershipPrice: 6000,
    facilities: ["Weight Training", "Cardio", "Functional Training"],
  },
  {
    id: 6,
    name: "Core Strength Studio",
    location: "Colombo",
    description:
      "A focused training space offering strength, mobility, and personal coaching.",
    image:
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=900&q=85",
    rating: 4.6,
    reviews: 15,
    membershipPrice: null,
    facilities: ["Personal Training", "Functional Training", "Yoga"],
  },
];

export const gymLocations = [
  "All Locations",
  "Colombo",
  "Nugegoda",
  "Kandy",
  "Galle",
  "Negombo",
];

export const gymFacilities = [
  "All Facilities",
  "Weight Training",
  "Cardio",
  "Personal Training",
  "Group Classes",
  "Functional Training",
  "Yoga",
  "Bodybuilding",
];
