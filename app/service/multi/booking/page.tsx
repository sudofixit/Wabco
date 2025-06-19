import { Suspense } from 'react';
import BookingFlow from '../components/MultiBookingFlow';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface MultiBookingPageProps {
  searchParams: Promise<{ services?: string }>;
}

export default async function MultiBookingPage({ searchParams }: MultiBookingPageProps) {
  const { services: serviceIds } = await searchParams;
  
  if (!serviceIds) {
    notFound();
  }

  try {
    // Parse service IDs from URL parameter
    const ids = serviceIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (ids.length === 0) {
      notFound();
    }

    // Fetch the selected services
    const services = await prisma.service.findMany({
      where: {
        id: { in: ids },
        isActive: true
      },
      orderBy: { title: 'asc' }
    });

    if (services.length === 0) {
      notFound();
    }

    // Convert Decimal to number for client component compatibility
    const serializedServices = services.map((service: any) => ({
      ...service,
      price: service.price ? Number(service.price) : null,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    }));

    // Fetch locations for branch selection
    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' }
    });

    const serializedLocations = locations.map((location: any) => ({
      ...location,
      lat: location.lat ? Number(location.lat) : null,
      lng: location.lng ? Number(location.lng) : null,
      createdAt: location.createdAt.toISOString(),
      updatedAt: location.updatedAt.toISOString(),
    }));

    return (
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          <BookingFlow 
            services={serializedServices} 
            locations={serializedLocations}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Error loading multi-booking page:', error);
    notFound();
  }
} 