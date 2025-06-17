import { Decimal } from "@prisma/client/runtime/library";

export interface Service {
  id: number;
  title: string;
  description: string | null;
  image: string;
  price: Decimal | number | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
} 