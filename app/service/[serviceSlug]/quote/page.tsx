"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import BookingFlow from '../booking/components/BookingFlow';

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

export default function QuotePage() {
  const params = useParams();
  const serviceSlug = params.serviceSlug as string;

  const [service, setService] = useState<Service | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch services and find the matching one
        const servicesResponse = await fetch('/api/services');
        if (!servicesResponse.ok) throw new Error('Failed to fetch services');
        const services = await servicesResponse.json();

        // Convert slug back to title to find the service
        const serviceTitle = serviceSlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        const matchedService = services.find((s: Service) =>
          s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') === serviceSlug
        );

        if (!matchedService) {
          toast.error('Service not found');
          return;
        }

        setService(matchedService);

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
  }, [serviceSlug]);

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

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 font-poppins flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0a1c58] mb-4">Service Not Found</h1>
          <p className="text-gray-600">The requested service could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <BookingFlow
      service={service}
      locations={locations}
      flowType="quotation"
    />
  );
} 