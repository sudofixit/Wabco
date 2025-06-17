export interface Product {
  id: number;
  pattern: string;
  description: string;
  price: number;
  image: string;
  brand: string;
  width: string;
  warranty: string;
  availability: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "CONTACT_US";
  year: number;
  origin: string;
  offer: boolean;
  offerText: string;
  rating: number;
  reviews: number;
  brandLogo: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  pattern: string;
  description: string;
  price: number;
  image: string;
  brand: string;
  width: string;
  warranty: string;
  availability: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "CONTACT_US";
  year: number;
  origin: string;
  offer: boolean;
  offerText: string;
} 