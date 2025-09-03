"use client"
import { useEffect, useState } from "react";
import Image from "next/image";
import TireSizeModal from "./TireSizeModal";
import { useRouter } from "next/navigation";

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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        const tireBannersResponse = await fetch('/api/banners');
        console.log("BannersData", tireBannersResponse);

        if (!tireBannersResponse.ok) throw new Error('Failed to fetch tire banners');
        const tireBannersData = await tireBannersResponse.json();

        setBanners(tireBannersData);
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  console.log("Banners state:", banners);

  // Filter banners with safe fallbacks
  const tyreHeroBanner: Banner[] = banners.filter((banner) => banner.title === 'Homepage-TyreHeroBanner');
  const tyreBanner1: Banner[] = banners.filter((banner) => banner.title === 'Homepage-TyreBanner1');
  const tyreBanner2: Banner[] = banners.filter((banner) => banner.title === 'Homepage-TyreBanner2');
  const tyreBanner3: Banner[] = banners.filter((banner) => banner.title === 'Homepage-TyreBanner3');

  // Fallback image URLs
  const heroBannerImage = tyreHeroBanner.length > 0 ? tyreHeroBanner[0].image : "/fallback-hero.jpg";
  const banner1Image = tyreBanner1.length > 0 ? tyreBanner1[0].image : "/fallback-banner1.jpg";
  const banner2Image = tyreBanner2.length > 0 ? tyreBanner2[0].image : "/fallback-banner2.jpg";
  const banner3Image = tyreBanner3.length > 0 ? tyreBanner3[0].image : "/fallback-banner3.jpg";

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full flex justify-center items-end min-h-[500px] md:min-h-[680px] lg:min-h-[780px] bg-black pb-8 md:pb-12">
        {!isLoading && (
          <Image
            src={heroBannerImage}
            alt="Car driving"
            fill
            className="object-cover opacity-80 transition-opacity duration-300"
            priority
          />
        )}
        <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-[1440px] px-4 md:px-8 lg:px-16 items-center justify-between gap-8 lg:gap-16">
          {/* Left: Text */}
          <div className="flex flex-col gap-4 w-full lg:max-w-[651px] text-center lg:text-left pt-8 md:pt-16 lg:pt-0 pb-8 lg:pb-0">
            <h1 className="font-poppins text-white text-2xl md:text-4xl lg:text-[3.1rem] font-bold leading-tight drop-shadow-lg">
              Drive with Confidence,<br />Powered by Premium Tires
            </h1>
            <p className="text-white text-base md:text-lg lg:text-[1.15rem] max-w-md mx-auto lg:mx-0 drop-shadow">
              Discover top-quality tyres, expert fitting, and unbeatable prices — all in one place. Your road safety starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2 justify-center lg:justify-start">
              <button className="bg-white text-[#0a1c58] px-6 md:px-8 py-3 rounded-full font-semibold text-base md:text-lg shadow hover:bg-gray-100 transition cursor-pointer" onClick={() => router.push('/contact-us')}>
                Contact Us
              </button>
              <button className="border border-white text-white px-6 md:px-8 py-3 rounded-full font-semibold text-base md:text-lg hover:bg-white hover:text-[#0a1c58] transition cursor-pointer" onClick={() => router.push('/tire')}>
                Explore
              </button>
            </div>
          </div>

          {/* Right: Tires Card - Show on mobile with different layout */}
          <div className="w-full lg:w-[570px] lg:h-[341px] bg-white border border-[#C7C7C7] rounded-lg lg:rounded-none shadow-md lg:shadow-none flex flex-col justify-start">
            <div className="px-4 md:px-8 pt-4 md:pt-6 pb-4 text-center text-lg md:text-[20px] font-bold text-black font-poppins">
              Tires
            </div>
            <div className="border-t border-[#C7C7C7] w-full" />

            {/* Option 1 */}
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 px-4 md:px-6 py-4 bg-[#F7F7F7] mt-4 mx-4 rounded-lg lg:rounded-none min-h-[100px] lg:h-[110px]">
              <Image
                src="/car.png"
                alt="Car icon"
                width={150}
                height={65}
                className="object-contain sm:w-[190px] sm:h-[81px]"
              />
              <div className="flex flex-col justify-center h-full text-center sm:text-left">
                <div className="font-semibold text-base md:text-[18px] text-black font-poppins">
                  Shop Tires by Vehicles
                </div>
                <div className="text-black text-sm md:text-[16px] font-poppins">
                  Enter your make and model to find tires that fit.
                </div>
              </div>
            </div>

            {/* Option 2 */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 px-4 md:px-6 py-4 bg-[#F7F7F7] mt-4 mx-4 mb-4 lg:mb-0 hover:bg-[#e5e7eb] transition-colors text-left rounded-lg lg:rounded-none min-h-[100px] lg:h-[110px]"
            >
              <Image
                src="/tyre.png"
                alt="Tire icon"
                width={85}
                height={78}
                className="object-contain sm:w-[105px] sm:h-[96px]"
              />
              <div className="flex flex-col justify-center h-full text-center sm:text-left">
                <div className="font-semibold text-base md:text-[18px] text-black font-poppins">
                  Enter your tire size
                </div>
                <div className="text-black text-sm md:text-[16px] font-poppins">
                  to find the best options.
                </div>
              </div>
            </button>
          </div>
        </div>
        {/* Overlay for darkening the image */}
        <div className="absolute inset-0 bg-black opacity-40 z-0" />
      </section>

      {/* Why Choose Wabco Mobility? */}
      <section className="w-full flex justify-center bg-white py-12 md:py-16 px-4">
        <div className="w-full max-w-[1080px] flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0a1c58] mb-4 text-center">
            Why Choose Wabco Mobility?
          </h2>
          <p className="text-base md:text-lg text-[#0a1c58] mb-8 md:mb-12 text-center max-w-2xl font-medium px-4">
            We're not just another tire shop. We're your partners in safe, reliable driving with unmatched service and expertise.
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
                  Premium tire brands with comprehensive warranties. Your satisfaction is our priority.
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
                  Most tire installations completed in 45 minutes or less. No appointment needed for basic services.
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
          {!isLoading && tyreBanner1.length > 0 && (
            <div className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-2xl overflow-hidden">
              <Image
                src={banner1Image}
                alt={tyreBanner1[0].title || "Promotion banner"}
                fill
                className="object-cover object-left"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1440px"
                priority
              />
            </div>
          )}

          {/* Bottom Row: Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 w-full">
            {/* Tire Rotation Special */}
            {!isLoading && tyreBanner2.length > 0 && (
              <div className="relative w-full aspect-[4/3] md:aspect-[7/5] rounded-2xl overflow-hidden">
                <Image
                  src={banner2Image}
                  alt={tyreBanner2[0].title || "Tire rotation special"}
                  fill
                  className="object-cover object-left"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 720px"
                />
              </div>
            )}

            {/* Flat Tire Offer */}
            {!isLoading && tyreBanner3.length > 0 && (
              <div className="relative w-full aspect-[4/3] md:aspect-[7/5] rounded-2xl overflow-hidden">
                <Image
                  src={banner3Image}
                  alt={tyreBanner3[0].title || "Flat tire offer"}
                  fill
                  className="object-cover object-left"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 720px"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="w-full flex flex-col items-center bg-white py-12 md:py-16 px-4">
        <div className="w-full max-w-[1370px] flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0a1c58] mb-4 text-center">Brands</h2>
          <p className="text-base md:text-lg text-gray-700 mb-8 md:mb-10 text-center max-w-2xl px-4">
            At Tire Centre, we partner with some of the world's most trusted and high-performing tire brands to ensure your safety, comfort, and performance on the road. Whether you're looking for all-season reliability, winter traction, or ultra-high-performance tires — we've got the right brand for your vehicle and lifestyle.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full justify-items-center">
            {availableBrands.map((brand, index) => (
              <div key={brand.id || index} className="bg-white rounded-2xl shadow-md flex items-center justify-center w-full max-w-[316px] h-[150px] md:h-[176px] p-4 md:p-6">
                <Image
                  src={brand.logo || '/brands/default-logo.png'}
                  alt={brand.name || 'Brand'}
                  width={150}
                  height={36}
                  className="object-contain max-w-full max-h-full md:w-[184px] md:h-[44px]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tire Size Modal */}
      <TireSizeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableSizes={availableSizes}
      />
    </>
  );
}