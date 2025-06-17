export interface Booking {
  id: number;
  carYear: string;
  carMake: string;
  carModel: string;
  services: string;
  branchId: number;
  branchName: string;
  bookingDate: Date | null;
  bookingTime: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  requestType: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  branch?: {
    id: number;
    name: string;
    address: string;
    phone: string;
    workingHours?: string;
  };
}

export interface BookingFormData {
  carYear: string;
  carMake: string;
  carModel: string;
  services: string;
  branchId: number;
  branchName: string;
  bookingDate: string | null; // ISO date string for forms, null for quotes
  bookingTime: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  requestType: string;
}

export interface BookingFilters {
  branchId?: number;
  customerName?: string;
  customerEmail?: string;
  bookingDate?: string;
  services?: string;
  requestType?: string;
} 