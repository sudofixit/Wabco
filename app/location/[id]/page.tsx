import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/prisma";

interface PageProps {
  params: Promise<{ id: string }>
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locationId = parseInt(resolvedParams.id);

  if (isNaN(locationId)) {
    return {
      title: "Location Not Found | WABCO Mobility",
      description: "The requested location could not be found."
    };
  }

  const location = await prisma.location.findUnique({
    where: { id: locationId }
  });

  if (!location) {
    return {
      title: "Location Not Found | WABCO Mobility",
      description: "The requested location could not be found."
    };
  }

  return {
    title: `${location.name} - Tire Services & Auto Care | WABCO Mobility`,
    description: `Visit WABCO Mobility at ${location.name}, ${location.address}. Professional tire services, wheel alignment, and vehicle inspection. Call ${location.phone} for appointments.`,
    keywords: `WABCO Mobility, ${location.name}, tire services, wheel alignment, vehicle inspection, auto care, ${location.address}`,
    openGraph: {
      title: `${location.name} | WABCO Mobility`,
      description: `Professional tire services at ${location.name}. Located at ${location.address}`,
      type: "website",
      locale: "en_KE",
      siteName: "WABCO Mobility",
      images: location.image ? [
        {
          url: location.image.startsWith('/') ? location.image : `/${location.image}`,
          width: 1200,
          height: 630,
          alt: `${location.name} - WABCO Mobility location`
        }
      ] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${location.name} | WABCO Mobility`,
      description: `Professional tire services at ${location.name}. Located at ${location.address}`,
    },
    alternates: {
      canonical: `/location/${location.id}`
    }
  };
}

export default async function LocationDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const locationId = parseInt(resolvedParams.id);

  if (isNaN(locationId)) {
    notFound();
  }

  const location = await prisma.location.findUnique({
    where: { id: locationId }
  });

  if (!location) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen w-full flex flex-col items-center font-poppins">
      {/* Header */}
      <header className="w-full max-w-[1440px] flex items-center justify-between py-6 px-8 md:px-16">
        <div className="flex items-center gap-4">
          <Image src="/Wabco Logo.jpeg" alt="Wabco Mobility Logo" width={231} height={30} />
        </div>
        <nav className="hidden md:flex gap-10 text-lg font-medium text-[#0a1c58]">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <Link href="/tire" className="hover:text-black transition">Tires</Link>
          <Link href="/service" className="hover:text-black transition">Services</Link>
          <Link href="/location" className="hover:text-black transition">Location</Link>
        </nav>
        <Link href="/contact-us">
          <button className="hidden md:block border-2 border-[#0a1c58] text-[#0a1c58] px-8 py-2 rounded-full font-semibold text-lg hover:bg-[#0a1c58] hover:text-white transition">Contact Us</button>
        </Link>
      </header>

      {/* Breadcrumb */}
      <div className="w-full max-w-[1440px] px-8 md:px-16 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-[#0a1c58]">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <Link href="/location" className="ml-1 text-sm font-medium text-gray-700 hover:text-[#0a1c58] md:ml-2">
                  Locations
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{location.name}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Location Detail Content */}
      <div className="w-full max-w-[1440px] px-8 md:px-16 py-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Location Image */}
          {location.image && (
            <div className="w-full h-64 md:h-80 relative">
              <Image
                src={location.image.startsWith('/') ? location.image : `/${location.image}`}
                alt={location.name}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-t-2xl"
              />
            </div>
          )}

          <div className="p-8">
            {/* Location Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-[#0a1c58] mb-4">{location.name}</h1>
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-lg text-gray-700">{location.address}</span>
              </div>
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-lg text-gray-700">{location.phone}</span>
              </div>
              {location.workingHours && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg text-gray-700">{location.workingHours}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/contact-us"
                className="flex-1 bg-[#0a1c58] text-white text-center px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#132b7c] transition-colors"
              >
                Book Service
              </Link>
              <Link
                href="/contact-us"
                className="flex-1 bg-white text-[#0a1c58] border-2 border-[#0a1c58] text-center px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0a1c58] hover:text-white transition-colors"
              >
                Get Quote
              </Link>
              <Link
                href="/location"
                className="flex-1 bg-gray-100 text-gray-700 text-center px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Back to Locations
              </Link>
            </div>

            {/* Placeholder Content */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-[#0a1c58] mb-6">Services Available</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg text-[#0a1c58] mb-2">Tire Installation</h3>
                  <p className="text-gray-600">Professional tire mounting and balancing services</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg text-[#0a1c58] mb-2">Wheel Alignment</h3>
                  <p className="text-gray-600">Precision wheel alignment for optimal performance</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg text-[#0a1c58] mb-2">Vehicle Inspection</h3>
                  <p className="text-gray-600">Comprehensive vehicle safety inspections</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 