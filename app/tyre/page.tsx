import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import TireClientPage from "@/components/TireClientPage";
import prisma from "@/lib/prisma";
import { Suspense } from "react";
import MobileNavigation from "@/components/MobileNavigation";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import CountryDropdown from "@/components/CountryDropdown";
import PromoBannerCarousel from "@/components/AdvertisementCarousel";

// Generate dynamic metadata for SEO
export const metadata: Metadata = {
  title: "Premium Tyres for Every Vehicle | WABCO Mobility",
  description: "Discover top-quality tyres tailored to your vehicle, driving style, and weather conditions. Shop by vehicle, size, or brand with professional installation services in Nairobi, Kenya.",
  keywords: "tyres, car tyres, truck tyres, premium tyres, tyre installation, Nairobi, Kenya, WABCO Mobility, vehicle tyres, tyre brands, tyre sizes",
  openGraph: {
    title: "Premium Tyres for Every Vehicle | WABCO Mobility",
    description: "Discover top-quality tyres tailored to your vehicle. Professional installation services available in Nairobi.",
    type: "website",
    locale: "en_KE",
    siteName: "WABCO Mobility",
    images: [
      {
        url: "/bg tire page.png",
        width: 1200,
        height: 630,
        alt: "WABCO Mobility Premium Tyres"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Tyres for Every Vehicle | WABCO Mobility",
    description: "Discover top-quality tyres with professional installation services in Nairobi.",
  },
  alternates: {
    canonical: "/tire"
  }
};

interface Banner {
  id: number;
  title: string;
  link: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

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

interface PageProps {
  params: Promise<{ [key: string]: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TirePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const ITEMS_PER_PAGE = 9;
  const page = Math.max(1, parseInt(resolvedParams?.page as string || '1', 10));
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Fetch all products for client-side filtering
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      include: { brand: true }
    } as any),
    prisma.product.count(),
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

  const tyreHeroBanner: Banner[] = getHeroBanners('Tyrepage-HeroBanner')
  const tireBanner: Banner[] = banners.filter((banner) => banner.title == 'Tyrepage-Banner1')

  const tires: Tire[] = products.map((p: any) => {
    // Create tire size display: width/profile R diameter loadIndex speedRating
    // Examples: "225/45R17 94V" or "195R15 94V" (without profile)
    const createTireSize = () => {
      const width = p.width || '';
      const profile = p.profile || '';
      const diameter = p.diameter || '';
      const loadIndex = p.loadIndex || '';
      const speedRating = p.speedRating || '';

      if (!width || !diameter) return '';

      if (profile) {
        return `${width}/${profile}R${diameter}${loadIndex ? ' ' + loadIndex : ''}${speedRating || ''}`;
      } else {
        return `${width}R${diameter}${loadIndex ? ' ' + loadIndex : ''}${speedRating || ''}`;
      }
    };

    return {
      id: p.id,
      brandLogo: p.brand?.logo || '/brands/default-logo.png',
      brand: p.brand?.name || 'Unknown Brand',
      pattern: p.pattern,
      tireSize: createTireSize(),
      width: p.width || '',
      profile: p.profile || '',
      diameter: p.diameter || '',
      loadIndex: p.loadIndex || '',
      speedRating: p.speedRating || '',
      warranty: p.warranty,
      availability: p.availability,
      price: Number(p.price),
      year: String(p.year),
      origin: p.origin,
      offer: p.offer,
      offerText: p.offerText || '',
      image: p.image,
      rating: p.rating ?? 4.2,
      reviews: p.reviews ?? 127,
    };
  });

  // Extract unique brands for the Brand dropdown
  const brands = Array.from(new Set(tires.map(t => t.brand))).filter(Boolean);

  return (
    <div className="bg-white min-h-screen w-full flex flex-col items-center">
      {/* Header - Moderate reduction */}
      <header className="w-full max-w-[1320px] flex items-center justify-between py-4 px-6 md:px-12">
        <div className="flex items-center gap-3">
          <Image src="/Wabco Logo.jpeg" alt="Wabco Mobility Logo" width={208} height={27} />
        </div>
        <nav className="hidden md:flex gap-8 text-base font-medium text-[#0a1c58]">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <Link href="/tyre" className="font-bold text-black transition">Tyres</Link>
          <Link href="/service" className="hover:text-black transition">Services</Link>
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

      {/* Hero Section - Moderate reduction */}
      <HeroCarousel
        banners={tyreHeroBanner}
        heading="Find the Perfect Tyres for Every Journey"
        subheading="Discover top-quality tyres tailored to your vehicle, driving style, and weather conditions. Shop by vehicle, size, or brand — and drive with confidence every mile."
      />

      {/* Client Component for Filters and Grid */}
      <TireClientPage tires={tires} brands={brands} />

      {/* Promo Banner - Moderate reduction */}
      <section className="w-full flex justify-center bg-white py-8 px-4">
        {tireBanner[0] && (
          <PromoBannerCarousel
            topBanners={tireBanner}
          />
        )}
      </section>

      {/* Footer Section - Moderate reduction */}
      <footer className="w-full bg-[#f7f7f7] py-10 px-4 flex flex-col items-center font-poppins">
        <div className="w-full max-w-[1320px] flex flex-col gap-10">
          {/* Top Row: Columns + Subscribe */}
          <div className="flex flex-col md:flex-row items-start justify-center gap-40 w-full">
            {/* Columns */}
            <Footer />
          </div>
          {/* Divider */}
          <div className="border-t border-[#e5e7eb] w-full mt-6" />
          {/* Bottom Row: Logo and Socials */}
          <div className="w-full flex flex-col md:flex-row justify-between items-center pt-6 gap-5">
            <div>
              <Image src="/Wabco Logo.jpeg" alt="Wabco Mobility Logo" width={208} height={27} />
            </div>
            <div className="flex gap-5">
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#0a1c58] hover:bg-[#0a1c58] hover:text-white transition">
                {/* LinkedIn SVG */}
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#0a1c58] hover:bg-[#0a1c58] hover:text-white transition">
                {/* Facebook SVG */}
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.495v-9.294H9.692v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#0a1c58] hover:bg-[#0a1c58] hover:text-white transition">
                {/* Twitter SVG */}
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.856 3.17 0 2.188 1.115 4.117 2.823 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A9.936 9.936 0 0 0 24 4.557z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}