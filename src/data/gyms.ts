export type Gym = {
  id: string;
  name: string;
  location: string;
  description: string;
  image: string;
  rating: number | null;
  reviews: number;
  membershipPrice: number | null;
  facilities: string[];
};