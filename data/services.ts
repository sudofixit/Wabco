import { Service } from "@/types/admin/services";

export const services: Service[] = [
  {
    id: 1,
    title: "Truck Maintenance",
    description: "Comprehensive maintenance service for all truck types",
    image: "/images/services/maintenance.jpg",
    price: 299.99,
    isActive: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01"
  },
  {
    id: 2,
    title: "Brake System Repair",
    description: "Professional brake system inspection and repair",
    image: "/images/services/brake-repair.jpg",
    price: 199.99,
    isActive: true,
    createdAt: "2024-01-02",
    updatedAt: "2024-01-02"
  },
  {
    id: 3,
    title: "Engine Diagnostics",
    description: "Advanced engine diagnostic services",
    image: "/images/services/diagnostics.jpg",
    price: 149.99,
    isActive: true,
    createdAt: "2024-01-03",
    updatedAt: "2024-01-03"
  }
]; 