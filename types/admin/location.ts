export interface Location {
  id: number;
  name: string;
  address: string;
  phone: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  workingHours: string | null;
} 