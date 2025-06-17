export interface Service {
  id: number;
  title: string;
  description: string;
  image: string;
  price?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceFormData {
  title: string;
  description: string;
  image: string;
  price?: number;
  isActive: boolean;
} 