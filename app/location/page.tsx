import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import BranchFinder from "./components/BranchFinder";
import LocationCard from "@/components/LocationCard";
import type { Location } from "@/types/location";
import MobileNavigation from "@/components/MobileNavigation";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";

interface PageProps {
  params: Promise<{ [key: string]: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

interface Banner {
  id: number;
  title: string;
  link: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export default async function LocationPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const ITEMS_PER_PAGE = 12;
  const page = Math.max(1, parseInt(resolvedParams?.page as string || '1', 10));
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Get all locations for the branch finder
  const [allLocations, paginatedLocations, totalCount] = await Promise.all([
    prisma.location.findMany({
      orderBy: { name: 'asc' }
    }),
    prisma.location.findMany({
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.location.count(),
  ]);

  const rawBanners = await prisma.banner.findMany();
  const banners: Banner[] = rawBanners
    .filter((b) => b.title && b.link) // filter out nulls
    .map((b) => ({
      ...b,
      title: b.title as string,
      link: b.link as string,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }));

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

  const locationHeroBanner: Banner[] = getHeroBanners('Location-HeroBanner')

  // Serialize data for client components
  const serializedAllLocations: Location[] = allLocations.map((location: any) => ({
    id: location.id,
    name: location.name,
    address: location.address,
    phone: location.phone,
    image: location.image,
    subdomain: location.subdomain,
    workingHours: location.workingHours,
    lat: location.lat ? parseFloat(location.lat.toString()) : null,
    lng: location.lng ? parseFloat(location.lng.toString()) : null,
    createdAt: location.createdAt.toISOString(),
    updatedAt: location.updatedAt.toISOString(),
  }));

  const serializedPaginatedLocations: Location[] = paginatedLocations.map((location: any) => ({
    id: location.id,
    name: location.name,
    address: location.address,
    phone: location.phone,
    image: location.image,
    workingHours: location.workingHours,
    lat: location.lat ? parseFloat(location.lat.toString()) : null,
    lng: location.lng ? parseFloat(location.lng.toString()) : null,
    createdAt: location.createdAt.toISOString(),
    updatedAt: location.updatedAt.toISOString(),
  }));

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <>
      {/* DNS prefetch and preconnect for Google Maps - FASTEST LOADING */}
      <link rel="dns-prefetch" href="//maps.googleapis.com" />
      <link rel="dns-prefetch" href="//maps.google.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="preconnect" href="https://maps.googleapis.com" crossOrigin="" />
      <link rel="preconnect" href="https://maps.google.com" crossOrigin="" />

      <div className="bg-white min-h-screen w-full flex flex-col items-center font-poppins">
        {/* Header */}
        <header className="w-full max-w-[1320px] flex items-center justify-between py-4 px-6 md:px-12">
          <div className="flex items-center gap-3">
            <Image src="/Wabco Logo.jpeg" alt="Wabco Mobility Logo" width={208} height={27} />
          </div>
          <nav className="hidden md:flex gap-8 text-base font-medium text-[#0a1c58]">
            <Link href="/" className="hover:text-black transition">Home</Link>
            <Link href="/tyre" className="hover:text-black transition">Tyres</Link>
            <Link href="/service" className="hover:text-black transition">Services</Link>
            <Link href="/location" className="font-bold text-black transition">Location</Link>
          </nav>
          <Link href="/contact-us">
            <button className="hidden md:block border-2 border-[#0a1c58] text-[#0a1c58] px-6 py-1.5 rounded-full font-semibold text-base hover:bg-[#0a1c58] hover:text-white transition">Contact Us</button>
          </Link>

          {/* Mobile Navigation */}
          <MobileNavigation />
        </header>

        {/* Hero Section */}
        <HeroCarousel
          banners={locationHeroBanner}
          heading="Find a Tyre Centre Near You"
          subheading="Easily locate your nearest store for expert tyre services, fast installations, and trusted support — wherever the road takes you."

        />

        {/* Branch Finder Section */}
        <section className="w-full bg-white">
          <BranchFinder locations={serializedAllLocations} />
        </section>

        {/* Location Cards Grid Section */}
        <section className="w-full flex flex-col items-center bg-white py-16 px-4">
          <div className="w-full max-w-[1440px] mb-12">
            <h2 className="text-3xl font-bold text-[#0a1c58] text-center mb-4">All Our Locations</h2>
            <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto">
              Browse through all our tyre service centers and find the one that's most convenient for you.
            </p>
          </div>

          <div className="w-full max-w-[1440px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {serializedPaginatedLocations.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <Link
                href={`?page=${page - 1}`}
                className={`px-4 py-2 rounded ${page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#0a1c58] text-white hover:bg-[#132b7c]'}`}
                aria-disabled={page === 1}
                tabIndex={page === 1 ? -1 : 0}
              >
                Prev
              </Link>
              {Array.from({ length: totalPages }, (_, i) => (
                <Link
                  key={i + 1}
                  href={`?page=${i + 1}`}
                  className={`px-4 py-2 rounded ${page === i + 1 ? 'bg-[#0a1c58] text-white' : 'bg-gray-100 text-[#0a1c58] hover:bg-[#e5e7eb]'}`}
                >
                  {i + 1}
                </Link>
              ))}
              <Link
                href={`?page=${page + 1}`}
                className={`px-4 py-2 rounded ${page === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#0a1c58] text-white hover:bg-[#132b7c]'}`}
                aria-disabled={page === totalPages}
                tabIndex={page === totalPages ? -1 : 0}
              >
                Next
              </Link>
            </div>
          )}
        </section>

        {/* Footer Section */}
        <footer className="w-full bg-[#f7f7f7] py-12 px-4 flex flex-col items-center font-poppins">
          <div className="w-full max-w-[1440px] flex flex-col gap-12">
            {/* Top Row: Columns + Subscribe */}
            <div className="flex flex-col md:flex-row items-start justify-center gap-50 w-full">
              {/* Columns */}
              <Footer />
              {/* Subscribe Box */}
              {/* <div className="bg-[#f2f3f7] rounded-xl p-0 w-[338px] h-[258px] self-start flex flex-col justify-start items-start">
                <div className="font-semibold text-xl text-[#0a1c58] mb-3 mt-1 ml-6">Subscribe</div>
                <form className="flex mb-3 ml-6" style={{ width: '248px', height: '50px' }}>
                  <input
                    type="email"
                    placeholder="Email address"
                    className="flex-1 px-4 py-3 rounded-l-md border border-gray-300 focus:outline-none text-[#7d7d7d] bg-white placeholder-[#7d7d7d] text-base h-full"
                    style={{ fontFamily: 'Poppins', fontSize: '16px', borderRight: 'none' }}
                  />
                  <button
                    type="submit"
                    className="bg-[#0a1c58] text-white px-4 rounded-r-md flex items-center justify-center hover:bg-[#132b7c] transition h-full"
                    style={{ width: '50px' }}
                  >
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </form>
                <p className="ml-6 mt-2" style={{ fontFamily: 'Poppins', fontSize: '12px', color: 'rgba(10,28,88,0.6)', lineHeight: '20.4px', maxWidth: '254px', fontWeight: 400 }}>
                  Hello, we are Lift Media. Our goal is to translate the positive effects from revolutionizing how companies engage with their clients & their team.
                </p>
              </div> */}
            </div>
            {/* Divider */}
            <div className="border-t border-[#e5e7eb] w-[1440px] mt-7" />
            {/* Bottom Row: Logo and Socials */}
            <div className="w-full flex flex-col md:flex-row justify-between items-center pt-8 gap-6">
              <div>
                <Image src="/Wabco Logo.jpeg" alt="Wabco Mobility Logo" width={231} height={30} />
              </div>
              <div className="flex gap-6">
                <a href="#" className="w-12 h-12 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#0a1c58] hover:bg-[#0a1c58] hover:text-white transition">
                  {/* LinkedIn SVG */}
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z" /></svg>
                </a>
                <a href="#" className="w-12 h-12 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#0a1c58] hover:bg-[#0a1c58] hover:text-white transition">
                  {/* Facebook SVG */}
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.495v-9.294H9.692v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0z" /></svg>
                </a>
                <a href="#" className="w-12 h-12 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#0a1c58] hover:bg-[#0a1c58] hover:text-white transition">
                  {/* Twitter SVG */}
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.856 3.17 0 2.188 1.115 4.117 2.823 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A9.936 9.936 0 0 0 24 4.557z" /></svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 