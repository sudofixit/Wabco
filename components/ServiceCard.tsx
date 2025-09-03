"use client";

import Image from "next/image";
import Link from "next/link";
import { Service } from "@/types/service";

interface ServiceCardProps {
  service: Service;
}

// Function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const serviceSlug = generateSlug(service.title);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 flex flex-col shadow-sm overflow-hidden">
      <div className="w-full rounded-t-2xl overflow-hidden" style={{ height: 180, minHeight: 180, maxHeight: 180 }}>
        <Image
          src={service.image || "/service card picture.png"}
          alt={service.title}
          width={500}
          height={180}
          className="object-cover w-full h-full"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="font-bold text-2xl mb-2 text-[#0a1c58]">{service.title}</div>
        <div className="text-gray-700 mb-4 flex-1">{service.description}</div>
        <div className="mt-auto">
          <div className="font-bold text-lg text-[#232f53] mb-4">
            Starting from KES {typeof service.price === 'number' ? service.price.toLocaleString() : service.price?.toString()}
          </div>
          <div className="flex flex-col gap-3">
            <Link href={`/service/${serviceSlug}/quote`}>
              <button
                className="w-full border-2 border-[#232f53] text-[#232f53] py-2 rounded-lg font-semibold text-base bg-white hover:bg-[#232f53] hover:text-white transition"
              >
                Get a Service Quote
              </button>
            </Link>
            <Link href={`/service/${serviceSlug}/booking`}>
              <button
                className="w-full bg-[#232f53] text-white py-2 rounded-lg font-semibold text-base hover:bg-[#1a2542] transition"
              >
                Book a Service
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 