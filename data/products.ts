import { Product } from "@/types/admin/products";

export const products: Product[] = [
  {
    id: 1,
    pattern: "Air Disc Brake",
    description: "High-performance air disc brake system",
    price: "1299.99",
    offer: false,
    image: "/products/air-disc-brake.jpg",
    brandId: 1,
    brand: {
      id: 1,
      name: "WABCO",
      logo: "/brands/wabco-logo.png",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
    },
    availability: "In Stock",
    width: "22.5",
    mileage: "500,000",
    year: "2024",
    origin: "Germany",
    warranty: "2 years"
  },
  {
    id: 2,
    pattern: "Electronic Stability Control",
    description: "Advanced vehicle stability system",
    price: "2499.99",
    offer: true,
    image: "/products/esc.jpg",
    brandId: 1,
    brand: {
      id: 1,
      name: "WABCO",
      logo: "/brands/wabco-logo.png",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
    },
    availability: "Low Stock",
    width: "22.5",
    mileage: "300,000",
    year: "2024",
    origin: "USA",
    warranty: "3 years",
    offerText: "Special Launch Offer"
  },
  {
    id: 3,
    pattern: "Trailer ABS",
    description: "Anti-lock braking system for trailers",
    price: "899.99",
    offer: false,
    image: "/products/trailer-abs.jpg",
    brandId: 1,
    brand: {
      id: 1,
      name: "WABCO",
      logo: "/brands/wabco-logo.png",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
    },
    availability: "Contact Us",
    width: "19.5",
    mileage: "400,000",
    year: "2024",
    origin: "France",
    warranty: "2 years"
  }
]; 