// Type for client-side serialized location data
export interface Location {
  id: number;
  name: string;
  address: string;
  phone: string;
  image: string | null;
  subdomain?: string;
  workingHours: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
} 