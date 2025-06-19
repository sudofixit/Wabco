"use client";
import { useState } from "react";
import Image from "next/image";
import TireSizeModal from "./TireSizeModal";

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

export default function HomeClientPage({ availableSizes, availableBrands }: HomeClientPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full flex justify-center items-end min-h-[780px] bg-black pb-12">
        <Image
          src="/background car - porchse.png"
          alt="Car driving"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="relative z-10 flex flex-col md:flex-row w-full max-w-[1440px] px-8 md:px-16 items-center justify-between gap-16">
          {/* Left: Text */}
          <div className="flex flex-col gap-4 max-w-[651px] min-h-[264px] pt-25 pb-16 md:pt-0 md:pb-0">
            <h1 className="font-poppins text-white text-4xl md:text-[3.1rem] font-bold leading-tight drop-shadow-lg">Drive with Confidence,<br />Powered by Premium Tires</h1>
            <p className="text-white text-lg md:text-[1.15rem] max-w-md drop-shadow">Discover top-quality tyres, expert fitting, and unbeatable prices — all in one place. Your road safety starts here.</p>
            <div className="flex gap-4 mt-2">
              <button className="bg-white text-[#0a1c58] px-8 py-3 rounded-full font-semibold text-lg shadow hover:bg-gray-100 transition">Contact Us</button>
              <button className="border border-white text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white hover:text-[#0a1c58] transition">Explore</button>
            </div>
          </div>
          {/* Right: Tires Card */}
          <div className="hidden md:flex flex-col bg-white w-[570px] h-[341px] ml-8 border border-[#C7C7C7] rounded-none shadow-none justify-start">
            <div className="px-8 pt-6 pb-4 text-center text-[20px] font-bold text-black font-poppins">Tires</div>
            <div className="border-t border-[#C7C7C7] w-full" />
            {/* Option 1 */}
            <div className="flex items-center gap-6 px-6 py-4 bg-[#F7F7F7] mt-4 mx-4" style={{height: '110px'}}>
              <Image src="/car.png" alt="Car icon" width={190} height={81} className="object-contain" />
              <div className="flex flex-col justify-center h-full">
                <div className="font-semibold text-[18px] text-black font-poppins">Shop Tires by Vehicles</div>
                <div className="text-black text-[16px] font-poppins">Enter your make and model to find tires that fit.</div>
              </div>
            </div>
            {/* Option 2 */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-6 px-6 py-4 bg-[#F7F7F7] mt-4 mx-4 hover:bg-[#e5e7eb] transition-colors text-left"
              style={{height: '110px'}}
            >
              <Image src="/tyre.png" alt="Tire icon" width={105} height={96} className="object-contain" />
              <div className="flex flex-col justify-center h-full">
                <div className="font-semibold text-[18px] text-black font-poppins">Enter your tire size</div>
                <div className="text-black text-[16px] font-poppins">to find the best options.</div>
              </div>
            </button>
          </div>
        </div>
        {/* Overlay for darkening the image */}
        <div className="absolute inset-0 bg-black opacity-40 z-0" />
      </section>

      {/* Why Choose Wabco Mobility? */}
      <section className="w-full flex justify-center bg-white py-16 px-4">
        <div className="w-full max-w-[1080px] flex flex-col items-center">
          <h2 className="text-4xl font-bold text-[#0a1c58] mb-4 text-center">Why Choose Wabco Mobility?</h2>
          <p className="text-lg text-[#0a1c58] mb-12 text-center max-w-2xl font-medium">
            We're not just another tire shop. We're your partners in safe, reliable driving with unmatched service and expertise.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 w-full">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl shadow-lg border border-[#e5e7eb] p-8 flex flex-col md:flex-row items-center md:items-start gap-6 w-[526px] h-[262px] md:text-left text-left">
              <div className="bg-[#f3f4f8] rounded-xl p-4 flex items-center justify-center mb-4 md:mb-0">
                <Image src="/1.png" alt="Expert Installation" width={33} height={34} />
              </div>
              <div>
                <div className="font-bold text-lg text-black mb-2">Expert Installation</div>
                <div className="text-gray-700 text-base font-normal">ASE-certified technicians with 15+ years experience<br />ensure perfect installation every time.</div>
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-white rounded-3xl shadow-lg border border-[#e5e7eb] p-8 flex flex-col md:flex-row items-center md:items-start gap-6 w-[526px] h-[262px] md:text-left text-left">
              <div className="bg-[#f3f4f8] rounded-xl p-4 flex items-center justify-center mb-4 md:mb-0">
                <Image src="/2.png" alt="Quality Guarantee" width={33} height={34} />
              </div>
              <div>
                <div className="font-bold text-lg text-black mb-2">Quality Guarantee</div>
                <div className="text-gray-700 text-base font-normal">Premium tire brands with comprehensive warranties.<br />Your satisfaction is our priority.</div>
              </div>
            </div>
            {/* Card 3 */}
            <div className="bg-white rounded-3xl shadow-lg border border-[#e5e7eb] p-8 flex flex-col md:flex-row items-center md:items-start gap-6 w-[526px] h-[262px] md:text-left text-left">
              <div className="bg-[#f3f4f8] rounded-xl p-4 flex items-center justify-center mb-4 md:mb-0">
                <Image src="/3.png" alt="Fast Service" width={33} height={34} />
              </div>
              <div>
                <div className="font-bold text-lg text-black mb-2">Fast Service</div>
                <div className="text-gray-700 text-base font-normal">Most tire installations completed in 45 minutes or less.<br />No appointment needed for basic services.</div>
              </div>
            </div>
            {/* Card 4 */}
            <div className="bg-white rounded-3xl shadow-lg border border-[#e5e7eb] p-8 flex flex-col md:flex-row items-center md:items-start gap-6 w-[526px] h-[262px] md:text-left text-left">
              <div className="bg-[#f3f4f8] rounded-xl p-4 flex items-center justify-center mb-4 md:mb-0">
                <Image src="/4.png" alt="Convenient Locations" width={25} height={10} />
              </div>
              <div>
                <div className="font-bold text-lg text-black mb-2">Convenient Locations</div>
                <div className="text-gray-700 text-base font-normal">12 locations across the city with easy access<br />and ample parking.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions/Offers Section */}
      <section className="w-full flex flex-col items-center bg-white py-16 px-4">
        <div className="w-full max-w-[1440px] flex flex-col gap-8">
          {/* Top Promo Banner */}
          <div className="relative w-[1440px] h-[576px] rounded-2xl overflow-hidden flex items-center">
            <Image src="/5.png" alt="Promo Tire" fill className="object-cover" />
            <div className="absolute inset-0 bg-black opacity-60" />
            <div className="relative z-10 flex flex-col justify-center h-full pl-12 max-w-xl">
              <h3 className="text-white text-6xl font-bold mb-4">New Tires? Get Free Installation This Week Only!</h3>
              <p className="text-white text-lg mb-6">Buy any set of new tires and enjoy complimentary installation by certified technicians.</p>
              <div className="flex items-center gap-4">
                <Image src="/tireicon.png" alt="Save icon" width={32} height={32} />
                <span className="text-white text-xl font-semibold">Save up to KSH 5,000</span>
              </div>
              <span className="text-white text-sm mt-2">Offer valid until Sunday</span>
            </div>
          </div>
          {/* Bottom Row: Tire Rotation Special & Flat Tire Offer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* Tire Rotation Special */}
            <div className="relative bg-white rounded-2xl shadow-md overflow-hidden flex flex-col justify-between p-8 min-h-[510px]">
              <Image src="/6.png" alt="Tire Rotation" fill className="object-cover absolute inset-0 opacity-30" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                {/* Price Badge */}
                <span className="bg-white text-black font-bold text-4xl px-10 py-4 rounded-full shadow-lg rotate-[-15deg] absolute top-8 right-8 border-2 border-white" style={{letterSpacing: '2px'}}>KES 1,999</span>
                {/* Heading */}
                <h4 className="text-4xl font-bold text-black mb-4 mt-100 font-poppins">Tire Rotation Special</h4>
                {/* Description */}
                <p className="text-black text-lg mb-8 font-poppins">Regular tire rotation extends the life of your tires and improves fuel efficiency. Take advantage of our limited-time offer.</p>
                {/* Features */}
                <ul className="text-black text-xl flex flex-col gap-4 font-poppins mt-6">
                  <li className="flex items-center gap-2 font-bold">
                  <Image src="/loc.png" alt="Save icon" width={18} height={26} />
                    <span>Available at all locations</span>
          </li>
                  <li className="flex items-center gap-2 font-bold" >
                  <Image src="/tome.png" alt="Save icon" width={18} height={26} />
                    <span>Quick 20-minute service</span>
          </li>
                </ul>
              </div>
            </div>
            {/* Flat Tire Offer */}
            <div className="relative bg-white rounded-2xl shadow-md overflow-hidden flex flex-col justify-between p-8 min-h-[510px]">
              <Image src="/7.png" alt="Flat Tire" fill className="object-cover absolute inset-0 opacity-30" />
              {/* White overlay for readability */}
              <div className="absolute inset-0 bg-white opacity-40 z-10" />
              <div className="relative z-20 flex flex-col h-full justify-between">
                {/* Heading */}
                <h4 className="text-4xl font-bold text-black mt-120 mb-1 font-poppins">Flat Tire? We've Got You Covered.</h4>
                {/* Description */}
                <p className="text-black text-lg mb-10 font-poppins">Don't let a flat ruin your day. Fast and affordable tire repair services available — no appointment needed.</p>
                {/* Banner */}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="w-full flex flex-col items-center bg-white py-16 px-4">
        <div className="w-full max-w-[1370px] flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a1c58] mb-4 text-center">Brands</h2>
          <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl">
            At Tire Centre, we partner with some of the world's most trusted and high-performing tire brands to ensure your safety, comfort, and performance on the road. Whether you're looking for all-season reliability, winter traction, or ultra-high-performance tires — we've got the right brand for your vehicle and lifestyle.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full justify-items-center">
            {availableBrands.map((brand, index) => (
              <div key={brand.id || index} className="bg-white rounded-2xl shadow-md flex items-center justify-center w-[316px] h-[176px] p-6">
                <Image 
                  src={brand.logo || '/brands/default-logo.png'} 
                  alt={brand.name || 'Brand'} 
                  width={184} 
                  height={44} 
                  className="object-contain max-w-full max-h-full" 
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