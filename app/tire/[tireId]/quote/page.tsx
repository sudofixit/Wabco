"use client";

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import TireBookingFlow from '../booking/components/TireBookingFlow';

interface Tire {
  id: number;
  brandLogo: string;
  brand: string;
  pattern: string;
  tireSize: string;
  width: string;
  profile: string;
  diameter: string;
  loadIndex: string;
  speedRating: string;
  warranty: string;
  availability: string;
  price: number;
  year: string;
  origin: string;
  offer: boolean;
  offerText: string;
  image: string;
  rating: number;
  reviews: number;
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

export default function TireQuotePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tireId = params.tireId as string;
  const quantity = parseInt(searchParams.get('quantity') || '1');

  const [tire, setTire] = useState<Tire | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tireResponse, locationsResponse] = await Promise.all([
          fetch(`/api/products/${tireId}`),
          fetch('/api/locations')
        ]);

        if (!tireResponse.ok) {
          throw new Error('Failed to fetch tire');
        }

        if (!locationsResponse.ok) {
          throw new Error('Failed to fetch locations');
        }

        const tireData = await tireResponse.json();
        const locationsData = await locationsResponse.json();

        // Transform product data to tire format
        const transformedTire: Tire = {
          id: tireData.id,
          brandLogo: tireData.brand?.logo || '/brands/default-logo.png',
          brand: tireData.brand?.name || 'Unknown Brand',
          pattern: tireData.pattern,
          tireSize: createTireSize(tireData),
          width: tireData.width || '',
          profile: tireData.profile || '',
          diameter: tireData.diameter || '',
          loadIndex: tireData.loadIndex || '',
          speedRating: tireData.speedRating || '',
          warranty: tireData.warranty,
          availability: tireData.availability,
          price: Number(tireData.price),
          year: String(tireData.year),
          origin: tireData.origin,
          offer: tireData.offer,
          offerText: tireData.offerText || '',
          image: tireData.image,
          rating: tireData.rating ?? 4.2,
          reviews: tireData.reviews ?? 127,
        };

        // Transform locations data to match expected interface
        const transformedLocations = locationsData.map((loc: any) => ({
          ...loc,
          createdAt: typeof loc.createdAt === 'string' ? loc.createdAt : loc.createdAt.toISOString(),
          updatedAt: typeof loc.updatedAt === 'string' ? loc.updatedAt : loc.updatedAt.toISOString(),
        }));

        setTire(transformedTire);
        setLocations(transformedLocations);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load tire details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tireId]);

  const createTireSize = (product: any) => {
    const width = product.width || '';
    const profile = product.profile || '';
    const diameter = product.diameter || '';
    const loadIndex = product.loadIndex || '';
    const speedRating = product.speedRating || '';

    if (!width || !diameter) return '';

    if (profile) {
      return `${width}/${profile}R${diameter}${loadIndex ? ' ' + loadIndex : ''}${speedRating || ''}`;
    } else {
      return `${width}R${diameter}${loadIndex ? ' ' + loadIndex : ''}${speedRating || ''}`;
    }
  };

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

  if (!tire) {
    return (
      <div className="min-h-screen bg-gray-50 font-poppins flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0a1c58] mb-4">Tire Not Found</h1>
          <p className="text-gray-600">The requested tire could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <TireBookingFlow
      tire={tire}
      locations={locations}
      quantity={quantity}
      flowType="quotation"
    />
  );
} 