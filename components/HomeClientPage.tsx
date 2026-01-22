"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import TireSizeModal from "./TireSizeModal";
import { useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import PromoBannerCarousel from "./AdvertisementCarousel";

interface Brand {
  id: number;
  name: string;
  logo: string;
}

interface HomeClientPageProps {
  availableSizes: {
    widths: string[];
    profiles: string[];
    diameters: string[];
  };
  availableBrands: Brand[];
}

interface Banner {
  id: number;
  title: string;
  link: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export default function HomeClientPage({ availableSizes, availableBrands }: HomeClientPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const router = useRouter();

  // Hero carousel setup
  const [heroEmblaRef, heroEmblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ]);
  const [heroSelectedIndex, setHeroSelectedIndex] = useState(0);

  useEffect(() => {
    const fetchCarBrands = async () => {
      try {
        const tireBannersResponse = await fetch('/api/banners');
        if (!tireBannersResponse.ok) throw new Error('Failed to fetch tyre banners');
        const tireBannersData = await tireBannersResponse.json();
        setBanners(tireBannersData);
      } catch (error) {
        console.error('Error fetching tire brands:', error);
      }
    };

    fetchCarBrands();
  }, []);

  // Hero carousel effect
  const onHeroSelect = useCallback(() => {
    if (!heroEmblaApi) return;
    setHeroSelectedIndex(heroEmblaApi.selectedScrollSnap());
  }, [heroEmblaApi]);

  // Brands carousel setup
  const [brandsEmblaRef, brandsEmblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    dragFree: false,
  }, [Autoplay({ delay: 3000, stopOnInteraction: false })]);

  useEffect(() => {
    if (!heroEmblaApi) return;
    onHeroSelect();
    heroEmblaApi.on("select", onHeroSelect);
    return () => {
      heroEmblaApi.off("select", onHeroSelect);
    };
  }, [heroEmblaApi, onHeroSelect]);

  const scrollToHero = useCallback((index: number) => {
    if (heroEmblaApi) heroEmblaApi.scrollTo(index);
  }, [heroEmblaApi]);

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

  const tyreHeroBanners = getHeroBanners('Homepage-TyreHeroBanner');
  const tyreBanner: Banner[] = banners.filter((banner) => banner.title === 'Homepage-TyreBanner');

  return (
    <>
      {/* Hero Section with Carousel */}
      <section className="relative w-full flex flex-col items-center bg-black">
        {/* Image Carousel - Desktop with Text Overlay, Mobile without */}
        <div className="relative w-full">
          <div className="relative w-full min-h-[300px] md:min-h-[500px] lg:min-h-[650px]">
            {/* Carousel */}
            <div className="overflow-hidden h-full" ref={heroEmblaRef}>
              <div className="flex h-full">
                {tyreHeroBanners.length > 0 ? (
                  tyreHeroBanners.map((banner, index) => (
                    <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative h-full">
                      <div className="relative w-full h-[300px] md:h-[500px] lg:h-[650px]">
                        <Image
                          src={banner.image}
                          alt={banner.title}
                          fill
                          className="object-cover"
                          priority={index === 0}
                          sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex-[0_0_100%] min-w-0 relative">
                    <div className="relative w-full h-[300px] md:h-[500px] lg:h-[780px] bg-gray-800" />
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Text Overlay - Hidden on Mobile */}
            <div className="hidden md:block absolute inset-0 z-10">
              <div className="h-full flex items-end pb-12 lg:pb-20">
                <div className="w-full max-w-[1440px] mx-auto px-8 lg:px-16">
                  <div className="flex flex-row items-end justify-between gap-8 lg:gap-16">
                    {/* Left: Text */}
                    <div className="flex flex-col gap-4 w-full lg:max-w-[651px]">
                      <h1 className="font-poppins text-white text-3xl md:text-4xl lg:text-[3.1rem] font-bold leading-tight drop-shadow-2xl">
                        Drive with Confidence,<br />Powered by Premium Tyres
                      </h1>
                      <p className="text-white text-base md:text-lg lg:text-[1.15rem] max-w-md drop-shadow-lg">
                        Discover top-quality tyres, expert fitting, and unbeatable prices — all in one place. Your road safety starts here.
                      </p>
                      <div className="flex flex-row gap-4 mt-2">
                        <button
                          className="bg-white text-[#0a1c58] px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:bg-gray-100 transition-all hover:scale-105"
                          onClick={() => router.push('/contact-us')}
                        >
                          Contact Us
                        </button>
                        <button
                          className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white hover:text-[#0a1c58] transition-all hover:scale-105"
                          onClick={() => router.push('/tire')}
                        >
                          Explore
                        </button>
                      </div>
                    </div>

                    {/* Right: Desktop Card */}
                    <div className="w-full lg:w-[570px] pb-6 bg-white border border-[#C7C7C7] rounded-lg lg:rounded-none shadow-md lg:shadow-none flex flex-col justify-start">
                      {/* Tab */}
                      <div className="flex">
                        <div className="flex-1 py-4 font-semibold text-center transition-all duration-300 text-[#0a1c58]">
                          Tyres
                        </div>
                      </div>
                      <div className="border-b-2 border-[#0a1c58] transition-all duration-300" />

                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 px-4 md:px-6 py-4 bg-zinc-200 mt-4 mx-4 mb-4 lg:mb-0 hover:bg-zinc-300 transition-colors text-left rounded-lg lg:rounded-none min-h-[100px] lg:h-[110px] cursor-pointer"
                      >
                        <Image
                          src="/tyre.png"
                          alt="Tyre icon"
                          width={85}
                          height={78}
                          className="object-contain sm:w-[105px] sm:h-[96px]"
                        />
                        <div className="flex flex-col justify-center h-full text-center sm:text-left">
                          <div className="font-semibold text-base md:text-[18px] text-black font-poppins">
                            Enter your tyre size
                          </div>
                          <div className="text-black text-sm md:text-[16px] font-poppins">
                            to find the best options.
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel Dots */}
            {tyreHeroBanners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                {tyreHeroBanners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToHero(index)}
                    className={`transition-all duration-300 rounded-full ${index === heroSelectedIndex
                      ? 'bg-white w-4 md:w-6 h-1.5 md:h-2'
                      : 'bg-white/50 w-1.5 md:w-2 h-1.5 md:h-2 hover:bg-white/75'
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Card Below Image */}
        <div className="md:hidden w-full px-4 py-8 bg-white relative z-10">
          <div className="w-full bg-white border border-[#C7C7C7] rounded-lg shadow-md flex flex-col">
            {/* Tab */}
            <div className="flex">
              <div className="flex-1 py-4 font-semibold text-center transition-all duration-300 text-[#0a1c58]">
                Tyres
              </div>
            </div>
            <div className="border-b-2 border-[#0a1c58] transition-all duration-300" />

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex flex-col sm:flex-row items-center gap-4 px-4 py-4 bg-zinc-200 m-4 hover:bg-zinc-300 transition-colors text-left rounded-lg cursor-pointer min-h-[100px]"
            >
              <Image
                src="/tyre.png"
                alt="Tyre icon"
                width={85}
                height={78}
                className="object-contain w-20 h-20 sm:w-[105px] sm:h-[96px]"
              />
              <div className="flex flex-col justify-center text-center sm:text-left">
                <div className="font-semibold text-base text-black font-poppins">
                  Enter your tyre size
                </div>
                <div className="text-black text-sm font-poppins">
                  to find the best options.
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Wabco Mobility? */}
      <section className="w-full flex justify-center bg-white py-12 md:py-16 px-4">
        <div className="w-full max-w-[1080px] flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0a1c58] mb-4 text-center">
            Why Choose Wabco Mobility?
          </h2>
          <p className="text-base md:text-lg text-[#0a1c58] mb-8 md:mb-12 text-center max-w-2xl font-medium px-4">
            We're not just another tyre shop. We're your partners in safe, reliable driving with unmatched service and expertise.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-x-8 lg:gap-y-12 w-full">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl shadow-lg border border-[#e5e7eb] p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 w-full max-w-[526px] mx-auto h-auto md:h-[262px] text-center md:text-left">
              <div className="bg-[#f3f4f8] rounded-xl p-4 flex items-center justify-center mb-2 md:mb-0 flex-shrink-0">
                <Image src="/1.png" alt="Expert Installation" width={33} height={34} />
              </div>
              <div>
                <div className="font-bold text-lg text-black mb-2">Expert Installation</div>
                <div className="text-gray-700 text-base font-normal">
                  ASE-certified technicians with 15+ years experience ensure perfect installation every time.
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl shadow-lg border border-[#e5e7eb] p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 w-full max-w-[526px] mx-auto h-auto md:h-[262px] text-center md:text-left">
              <div className="bg-[#f3f4f8] rounded-xl p-4 flex items-center justify-center mb-2 md:mb-0 flex-shrink-0">
                <Image src="/2.png" alt="Quality Guarantee" width={33} height={34} />
              </div>
              <div>
                <div className="font-bold text-lg text-black mb-2">Quality Guarantee</div>
                <div className="text-gray-700 text-base font-normal">
                  Premium tyre brands with comprehensive warranties. Your satisfaction is our priority.
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl shadow-lg border border-[#e5e7eb] p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 w-full max-w-[526px] mx-auto h-auto md:h-[262px] text-center md:text-left">
              <div className="bg-[#f3f4f8] rounded-xl p-4 flex items-center justify-center mb-2 md:mb-0 flex-shrink-0">
                <Image src="/3.png" alt="Fast Service" width={33} height={34} />
              </div>
              <div>
                <div className="font-bold text-lg text-black mb-2">Fast Service</div>
                <div className="text-gray-700 text-base font-normal">
                  Most tyre installations completed in 45 minutes or less. No appointment needed for basic services.
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-3xl shadow-lg border border-[#e5e7eb] p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 w-full max-w-[526px] mx-auto h-auto md:h-[262px] text-center md:text-left">
              <div className="bg-[#f3f4f8] rounded-xl p-4 flex items-center justify-center mb-2 md:mb-0 flex-shrink-0">
                <Image src="/4.png" alt="Convenient Locations" width={25} height={10} />
              </div>
              <div>
                <div className="font-bold text-lg text-black mb-2">Convenient Locations</div>
                <div className="text-gray-700 text-base font-normal">
                  12 locations across the city with easy access and ample parking.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions/Offers Section */}
      <section className="w-full flex flex-col items-center bg-white py-12 md:py-16 px-4">
        <div className="w-full max-w-[1440px] flex flex-col gap-6 md:gap-8">
          {/* Top Promo Banner - Full width */}
          {tyreBanner && (
            <PromoBannerCarousel
              topBanners={tyreBanner}
            />
          )}

        </div>
      </section>

      {/* Brands Section */}
      <section className="w-full flex flex-col items-center bg-white py-16 md:py-20 px-4">
        <div className="w-full max-w-342.5 flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0a1c58] mb-4 text-center">
            Premium Tire Brands
          </h2>
          <p className="text-base md:text-lg text-gray-700 mb-6 md:mb-8 text-center max-w-2xl px-4">
            At Tire Centre, we partner with some of the world's most trusted and high-performing tire brands.
          </p>

          {/* Desktop 360 Carousel */}
          <div className="w-full overflow-hidden py-4" ref={brandsEmblaRef}>
            <div className="flex">
              {availableBrands.map((brand, index) => (
                <div key={brand.id || index} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4">
                  <div className="bg-white rounded-2xl shadow-md flex items-center justify-center h-44 p-6 transition-transform hover:scale-105 mr-4">
                    <Image
                      src={brand.logo}
                      alt={brand.name || 'Brand'}
                      width={150}
                      height={36}
                      className="object-contain max-w-full max-h-full w-46 h-11"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Tyre Size Modal */}
      <TireSizeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableSizes={availableSizes}
      />
    </>
  );
}