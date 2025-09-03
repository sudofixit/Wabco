"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import MultiBookingFlow from '../components/MultiBookingFlow';

interface Service {
  id: number;
  title: string;
  description: string | null;
  image: string;
  price: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Location {
  id: number;
  name: string;
  address: string;
  phone: string;
  image: string;
  workingHours: string | null;
  createdAt: string;
  updatedAt: string;
}

function MultiQuotePageContent() {
  const searchParams = useSearchParams();
  const serviceIds = searchParams.get('services')?.split(',').map(id => parseInt(id)) || [];

  const [services, setServices] = useState<Service[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all services
        const servicesResponse = await fetch('/api/services');
        if (!servicesResponse.ok) throw new Error('Failed to fetch services');
        const allServices = await servicesResponse.json();

        // Filter to get only selected services
        const selectedServices = allServices.filter((service: Service) =>
          serviceIds.includes(service.id)
        );

        if (selectedServices.length === 0) {
          toast.error('No services selected');
          return;
        }

        setServices(selectedServices);

        // Fetch locations
        const locationsResponse = await fetch('/api/locations');
        if (!locationsResponse.ok) throw new Error('Failed to fetch locations');
        const locationsData = await locationsResponse.json();
        setLocations(locationsData);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load quote page');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [serviceIds]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 font-poppins flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a1c58] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quote form...</p>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 font-poppins flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0a1c58] mb-4">No Services Selected</h1>
          <p className="text-gray-600">Please select services to get a quote.</p>
        </div>
      </div>
    );
  }

  return (
    <MultiBookingFlow
      services={services}
      locations={locations}
      flowType="quotation"
    />
  );
}

export default function MultiQuotePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 font-poppins flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a1c58] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quote form...</p>
        </div>
      </div>
    }>
      <MultiQuotePageContent />
    </Suspense>
  );
} 