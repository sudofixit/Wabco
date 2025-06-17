import type { Brand } from "./brands";

export interface Product {
  id: number;
  pattern: string;
  price: string;
  description: string;
  offer: boolean;
  image: string;
  width: string;
  profile?: string;
  diameter?: string;
  loadIndex?: string;
  speedRating?: string;
  mileage?: string;
  brandId?: number | string | null;
  year?: string;
  origin?: string;
  offerText?: string;
  warranty?: string;
  availability?: string;
  brand?: Brand | null;
}

export interface ProductFormData {
  pattern: string;
  price: string;
  description: string;
  offer: boolean;
  image: string;
  width: string;
  profile?: string;
  diameter?: string;
  loadIndex?: string;
  speedRating?: string;
  mileage?: string;
  brandId?: number | string | null;
  year?: string;
  origin?: string;
  offerText?: string;
  warranty?: string;
  availability?: string;
} 