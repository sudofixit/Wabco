"use client";

import Image from "next/image";
import { Location } from "@/types/location";

interface LocationCardProps {
  location: Location;
}

export default function LocationCard({ location }: LocationCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 flex flex-col shadow-sm overflow-hidden p-6">
      <div className="w-full rounded-xl overflow-hidden mb-4" style={{ height: 180, minHeight: 180, maxHeight: 180 }}>
        <Image 
          src={location.image || "/branch.png"} 
          alt={location.name} 
          width={400} 
          height={180} 
          className="object-cover w-full h-full" 
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>
      <div className="font-bold text-2xl mb-2 text-[#0a1c58]">{location.name}</div>
      <div className="flex items-center gap-2 text-[#7d7d7d] mb-1">
        <Image src="/loc.png" alt="Location" width={18} height={18} />
        <span>{location.address}</span>
      </div>
      <div className="flex items-center gap-2 text-[#7d7d7d] mb-1">
        <Image src="/phone.png" alt="Phone" width={18} height={18} />
        <span>{location.phone}</span>
      </div>
      {location.workingHours && (
        <div className="flex items-center gap-2 text-[#7d7d7d] mb-2">
          <Image src="/tome.png" alt="Hours" width={18} height={18} />
          <span>{location.workingHours}</span>
        </div>
      )}
      {/* Buttons */}
      <div className="flex flex-col gap-2 mt-auto">
        <button 
          className="w-full border-2 border-[#0a1c58] text-[#0a1c58] py-2 rounded-lg font-semibold text-base bg-white hover:bg-[#0a1c58] hover:text-white transition"
          onClick={() => window.location.href = '/contact-us'}
        >
          Get a Service Quote
        </button>
        <button 
          className="w-full bg-[#0a1c58] text-white py-2 rounded-lg font-semibold text-base hover:bg-[#132b7c] transition"
          onClick={() => window.location.href = '/contact-us'}
        >
          Book a Service
        </button>
      </div>
    </div>
  );
} 