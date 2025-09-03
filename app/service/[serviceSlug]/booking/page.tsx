import { Suspense } from 'react';
import { Metadata } from 'next';
import BookingFlow from './components/BookingFlow';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface BookingPageProps {
  params: Promise<{ serviceSlug: string }>;
}

// Function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Function to find service by slug
async function findServiceBySlug(slug: string) {
  const services = await prisma.service.findMany({
    where: { isActive: true }
  });

  return services.find((service: any) => generateSlug(service.title) === slug);
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: BookingPageProps): Promise<Metadata> {
  const { serviceSlug } = await params;

  try {
    const service = await findServiceBySlug(serviceSlug);

    if (!service) {
      return {
        title: "Service Not Found | WABCO Mobility",
        description: "The requested service could not be found."
      };
    }

    const serviceTitle = service.title;
    const servicePrice = service.price ? `KES ${Number(service.price).toLocaleString()}` : 'Contact for pricing';

    return {
      title: `Book ${serviceTitle} - Professional Auto Service | WABCO Mobility`,
      description: `Book professional ${serviceTitle.toLowerCase()} service at WABCO Mobility. Expert technicians, quality service, competitive pricing starting at ${servicePrice}. Book your appointment today.`,
      keywords: `WABCO Mobility, ${serviceTitle}, auto service, car service, professional mechanics, booking, appointment, Nairobi`,
      openGraph: {
        title: `Book ${serviceTitle} | WABCO Mobility`,
        description: `Professional ${serviceTitle.toLowerCase()} service at WABCO Mobility. Book your appointment online.`,
        type: "website",
        locale: "en_KE",
        siteName: "WABCO Mobility",
        images: service.image ? [
          {
            url: service.image.startsWith('/') ? service.image : `/${service.image}`,
            width: 1200,
            height: 630,
            alt: `${serviceTitle} - WABCO Mobility Service`
          }
        ] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `Book ${serviceTitle} | WABCO Mobility`,
        description: `Professional ${serviceTitle.toLowerCase()} service. Book online today.`,
      },
      alternates: {
        canonical: `/service/${serviceSlug}/booking`
      }
    };
  } catch (error) {
    return {
      title: "Service Booking | WABCO Mobility",
      description: "Book professional auto services at WABCO Mobility."
    };
  }
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { serviceSlug } = await params;

  try {
    // Find the service by slug
    const service = await findServiceBySlug(serviceSlug);

    if (!service) {
      notFound();
    }

    // Convert Decimal to number for client component compatibility
    const serializedService = {
      ...service,
      price: service.price ? Number(service.price) : null,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    };

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
            service={serializedService}
            locations={serializedLocations}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Error loading booking page:', error);
    notFound();
  }
} 