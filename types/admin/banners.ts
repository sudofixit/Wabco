export interface Banner {
  id: number;
  title: string;
  link: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerFormData {
  title: string;
  link: string;
  image: string;
} 