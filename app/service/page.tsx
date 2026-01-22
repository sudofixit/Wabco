"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import ServiceCard from "@/components/ServiceCard";
import { Service } from "@/types/service";
import MobileNavigation from "@/components/MobileNavigation";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import CountryDropdown from "@/components/CountryDropdown";


interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface Banner {
  id: number;
  title: string;
  link: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export default function ServicePage({ searchParams }: PageProps) {
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [paginatedServices, setPaginatedServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banners, setBanners] = useState<Banner[]>([])

  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  const ITEMS_PER_PAGE = 6;
  const currentPage = resolvedSearchParams?.page ? Math.max(1, parseInt(resolvedSearchParams.page as string, 10)) : 1;

  // Fetch all services for the sidebar
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Add timeout to prevent infinite loading
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch('/api/services', {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch services: ${response.status} ${errorText}`);
        }
        const services = await response.json();

        // Filter only active services and serialize
        const activeServices = services
          .filter((service: any) => service.isActive)
          .map((service: any) => ({
            ...service,
            price: service.price ? Number(service.price) : null,
            createdAt: service.createdAt,
            updatedAt: service.updatedAt,
          }));

        setAllServices(activeServices);

        const serviceBannersResponse = await fetch('/api/banners');
        if (!serviceBannersResponse.ok) throw new Error('Failed to fetch tyre banners');
        const serviceBannersData = await serviceBannersResponse.json();
        setBanners(serviceBannersData);
      } catch (error) {
        console.error('Error fetching services:', error);
        if (error instanceof Error && error.name === 'AbortError') {
          setError('Request timed out. Please check your connection and try again.');
        } else {
          setError(error instanceof Error ? error.message : 'Failed to load services');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Handle pagination
  useEffect(() => {
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = allServices.slice(skip, skip + ITEMS_PER_PAGE);
    setPaginatedServices(paginatedData);
  }, [allServices, currentPage]);

  const totalPages = Math.ceil(allServices.length / ITEMS_PER_PAGE);

  const handleServiceSelection = (serviceId: number) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleBookSelectedServices = () => {
    if (selectedServices.length === 0) return;

    // Navigate to multi-booking page with selected service IDs
    const serviceIds = selectedServices.join(',');
    window.location.href = `/service/multi/booking?services=${serviceIds}`;
  };

  const handleGetQuoteForSelectedServices = () => {
    if (selectedServices.length === 0) return;

    // Navigate to multi-quote page with selected service IDs
    const serviceIds = selectedServices.join(',');
    window.location.href = `/service/multi/quote?services=${serviceIds}`;
  };

  // Filter banners by pattern
  const getHeroBanners = (prefix: string) => {
    return banners
      .filter((banner) => banner.title.startsWith(prefix))
      .sort((a, b) => {
        const getNumber = (title: string) => {
          const match = title.match(/\d+$/);
          return match ? parseInt(match[0]) : 0;
        };
        return getNumber(a.title) - getNumber(b.title);
      });
  };

  const serviceHeroBanner: Banner[] = getHeroBanners('Services-HeroBanner')
  const serviceBanner1: Banner[] = getHeroBanners('Servicepage-Banner1')
  const serviceBanner2: Banner[] = getHeroBanners('Servicepage-Banner2')
  // if (isLoading) {
  //   return (
  //     <div className="bg-white min-h-screen w-full flex flex-col items-center font-poppins">
  //       <div className="flex justify-center items-center h-64">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //         <span className="ml-4 text-gray-600">Loading services...</span>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="bg-white min-h-screen w-full flex flex-col items-center font-poppins">
        <div className="flex flex-col justify-center items-center h-64 text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">Error Loading Services</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#0a1c58] text-white px-6 py-2 rounded-lg hover:bg-[#132b7c] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen w-full flex flex-col items-center font-poppins">
      {/* Header */}
      <header className="w-full max-w-[1320px] flex items-center justify-between py-4 px-6 md:px-12">
        <div className="flex items-center gap-3">
          <Image src="/Wabco Logo.jpeg" alt="Wabco Mobility Logo" width={208} height={27} />
        </div>
        <nav className="hidden md:flex gap-8 text-base font-medium text-[#0a1c58]">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <Link href="/tyre" className="hover:text-black transition">Tyres</Link>
          <Link href="/service" className="font-bold text-black transition">Services</Link>
          <Link href="/location" className="hover:text-black transition">Location</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/contact-us">
            <button className="hidden md:block border-2 border-[#0a1c58] text-[#0a1c58] px-6 py-1.5 rounded-full font-semibold text-base hover:bg-[#0a1c58] hover:text-white transition">
              Contact Us
            </button>
          </Link>

          {/* Country Dropdown */}
          <CountryDropdown />
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation />
      </header>

      {/* Hero Section */}
      <HeroCarousel
        banners={serviceHeroBanner}
        heading="Professional Services for Your Vehicle"
        subheading="Experience top-quality service from our certified technicians. From routine maintenance to complex repairs, we've got you covered."
      />

      {/* Main Content with Sidebar */}
      <section className="w-full flex justify-center bg-white py-16 px-4">
        <div className="w-full max-w-[1440px]">
          <h2 className="text-3xl font-bold text-[#0a1c58] mb-8 text-center">
            Exceptional Services for Your Vehicle
          </h2>

          {/* Mobile Filter Button */}
          <div className="md:hidden mb-6">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="w-full bg-[#0a1c58] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#132b7c] transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
              Filter Services ({selectedServices.length} selected)
            </button>
          </div>

          {/* Desktop Layout: Sidebar + Main Content */}
          <div className="flex gap-8">
            {/* Left Sidebar - Desktop */}
            <div className="hidden md:block w-80 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm sticky top-4">
                {/* Filter Header */}
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-[#0a1c58] mb-2">Select Services</h3>
                  <p className="text-sm text-gray-600">Choose one or more services to book together</p>
                </div>

                {/* Service List */}
                <div className="p-4 max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {allServices.map((service) => (
                      <label
                        key={service.id}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedServices.includes(service.id)
                          ? 'border-[#0a1c58] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.id)}
                          onChange={() => handleServiceSelection(service.id)}
                          className="w-4 h-4 text-[#0a1c58] bg-gray-100 border-gray-300 rounded focus:ring-[#0a1c58] focus:ring-2"
                        />
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-gray-900 text-sm">{service.title}</div>
                          {service.price && (
                            <div className="text-sm text-[#0a1c58] font-semibold">
                              KES {service.price.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sticky Action Buttons */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg space-y-3">
                  <button
                    onClick={() => {
                      if (selectedServices.length === 0) return;

                      if (selectedServices.length === 1) {
                        // Single service - go to individual service quote
                        const serviceId = selectedServices[0];
                        const selectedService = allServices.find(s => s.id === serviceId);
                        if (selectedService) {
                          // Use  id
                          const serviceSlug = selectedService.id;
                          window.location.href = `/service/${serviceSlug}/quote`;
                        }
                      } else {
                        // Multiple services - go to multi quote
                        const serviceIds = selectedServices.join(',');
                        window.location.href = `/service/multi/quote?services=${serviceIds}`;
                      }
                    }}
                    disabled={selectedServices.length === 0}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition ${selectedServices.length > 0
                      ? 'border-2 border-[#0a1c58] text-[#0a1c58] bg-white hover:bg-[#0a1c58] hover:text-white'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-200'
                      }`}
                  >
                    Get Quote for Selected ({selectedServices.length})
                  </button>
                  <button
                    onClick={handleBookSelectedServices}
                    disabled={selectedServices.length === 0}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition ${selectedServices.length > 0
                      ? 'bg-[#0a1c58] text-white hover:bg-[#132b7c]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    Book Selected Services ({selectedServices.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Right Main Content */}
            <div className="flex-1">
              {/* Service Cards Grid - 3 per row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <Link
                    href={`?page=${currentPage - 1}`}
                    className={`px-4 py-2 rounded ${currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#0a1c58] text-white hover:bg-[#132b7c]'
                      }`}
                    aria-disabled={currentPage === 1}
                    tabIndex={currentPage === 1 ? -1 : 0}
                  >
                    Prev
                  </Link>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Link
                      key={i + 1}
                      href={`?page=${i + 1}`}
                      className={`px-4 py-2 rounded ${currentPage === i + 1
                        ? 'bg-[#0a1c58] text-white'
                        : 'bg-gray-100 text-[#0a1c58] hover:bg-[#e5e7eb]'
                        }`}
                    >
                      {i + 1}
                    </Link>
                  ))}
                  <Link
                    href={`?page=${currentPage + 1}`}
                    className={`px-4 py-2 rounded ${currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#0a1c58] text-white hover:bg-[#132b7c]'
                      }`}
                    aria-disabled={currentPage === totalPages}
                    tabIndex={currentPage === totalPages ? -1 : 0}
                  >
                    Next
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#0a1c58]">Select Services</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Service List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {allServices.map((service) => (
                  <label
                    key={service.id}
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${selectedServices.includes(service.id)
                      ? 'border-[#0a1c58] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleServiceSelection(service.id)}
                      className="w-5 h-5 text-[#0a1c58] bg-gray-100 border-gray-300 rounded focus:ring-[#0a1c58] focus:ring-2"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">{service.title}</div>
                      {service.price && (
                        <div className="text-sm text-[#0a1c58] font-semibold">
                          KES {service.price.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
              <button
                onClick={() => {
                  if (selectedServices.length === 0) return;
                  const serviceIds = selectedServices.join(',');
                  window.location.href = `/service/multi/quote?services=${serviceIds}`;
                }}
                disabled={selectedServices.length === 0}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition ${selectedServices.length > 0
                  ? 'border-2 border-[#0a1c58] text-[#0a1c58] bg-white hover:bg-[#0a1c58] hover:text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-200'
                  }`}
              >
                Get Quote for Selected ({selectedServices.length})
              </button>
              <button
                onClick={() => {
                  handleBookSelectedServices();
                  setIsMobileFilterOpen(false);
                }}
                disabled={selectedServices.length === 0}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition ${selectedServices.length > 0
                  ? 'bg-[#0a1c58] text-white hover:bg-[#132b7c]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Book Selected Services ({selectedServices.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promo Offers Section */}
      <section className="w-full flex flex-col items-center bg-white py-16 px-4">
        <div className="w-full max-w-[1440px] grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tire Rotation Special */}
          <div className="relative bg-white rounded-2xl shadow-md overflow-hidden flex flex-col justify-between p-8 min-h-[510px]">
            {serviceBanner1?.[0] && (
              <Image src={serviceBanner1[0].image} alt="Tyre Rotation" fill className="object-cover absolute inset-0" />

            )}
          </div>

          {/* Flat Tire Offer */}
          <div className="relative bg-white rounded-2xl shadow-md overflow-hidden flex flex-col justify-between p-8 min-h-[510px]">
            {serviceBanner2?.[0] && (
              <Image src={serviceBanner2[0].image} alt="Flat Tyre" fill className="object-cover absolute inset-0" />

            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#f7f7f7] py-12 px-4 flex flex-col items-center font-poppins">
        <div className="w-full max-w-[1440px] flex flex-col gap-12">
          <div className="flex flex-col md:flex-row items-start justify-center gap-50 w-full">
            <Footer />
            {/* <div className="flex flex-col">
              <div className="font-semibold text-xl text-[#0a1c58] mb-4">Subscribe</div>
              <p className="text-[#7d7d7d] text-lg mb-4">Get the latest updates and offers</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent"
                />
                <button className="bg-[#0a1c58] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#132b7c] transition">
                  Subscribe
                </button>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Image src="/Wabco Logo.jpeg" alt="Wabco Mobility Logo" width={231} height={30} />
                <p className="ml-6 mt-2" style={{ fontFamily: 'Poppins', fontSize: '12px', color: 'rgba(10,28,88,0.6)', lineHeight: '20.4px', maxWidth: '254px', fontWeight: 400 }}>
                  Hello, we are Lift Media. Our goal is to translate the positive effects from revolutionizing how companies engage with their clients & their team.
                </p>
              </div>
            </div> */}
          </div>
          <div className="border-t border-[#e5e7eb] w-full mt-7" />
          <div className="w-full flex flex-col md:flex-row justify-between items-center pt-4 md:pt-8 gap-6">
            <div>
              <Image
                src="/Wabco Logo.jpeg"
                alt="Wabco Mobility Logo"
                width={180}
                height={24}
                className="md:w-[231px] md:h-[30px]"
              />
            </div>
            <div className="flex gap-4 md:gap-6">
              <a href="#" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#0a1c58] hover:bg-[#0a1c58] hover:text-white transition">
                {/* LinkedIn SVG */}
                <svg width="16" height="16" className="md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#0a1c58] hover:bg-[#0a1c58] hover:text-white transition">
                {/* Facebook SVG */}
                <svg width="16" height="16" className="md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.495v-9.294H9.692v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#0a1c58] hover:bg-[#0a1c58] hover:text-white transition">
                {/* Twitter SVG */}
                <svg width="16" height="16" className="md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.856 3.17 0 2.188 1.115 4.117 2.823 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A9.936 9.936 0 0 0 24 4.557z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 