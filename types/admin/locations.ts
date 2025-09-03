export interface Location {
  id: number;
  name: string;
  address: string;
  phone: string;
  image: string;
  subdomain?: string;
  workingHours?: string;
  lat?: number | null;
  lng?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationFormData {
  name: string;
  address: string;
  phone: string;
  image: string;
  subdomain?: string;
  workingHours?: string;
  lat?: string;
  lng?: string;
} 