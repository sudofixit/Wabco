"use client";
import React from "react";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

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

export default function TireCard({ tire }: { tire: Tire }) {
  const [quantity, setQuantity] = useState(1);
  const handleDecrement = () => setQuantity(q => Math.max(1, q - 1));
  const handleIncrement = () => setQuantity(q => q + 1);
  const totalPrice = tire.price * quantity;
  const isOffer = tire.offer;

  return (
    <div style={{ width: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', marginBottom: '20px' }}>
      {isOffer && (
        <div className="relative bg-[#0a1c58] py-2 overflow-hidden">
          {/* Subtle diagonal pattern */}
          <div className="absolute inset-0 opacity-5 bg-[length:24px_24px] bg-[linear-gradient(45deg,transparent_48%,white_50%,transparent_52%)]"></div>

          {/* Thin accent lines */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

          {/* Offer text with premium styling */}
          <div className="relative text-center">
            <span className="text-white font-semibold text-[14px] tracking-wide font-poppins uppercase flex items-center justify-center">
              <span className="w-3 h-px bg-white/60 mx-1.5"></span>
              {tire.offerText}
              <span className="w-3 h-px bg-white/60 mx-1.5"></span>
            </span>
          </div>

          {/* Subtle corner accents */}
          <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-white/30"></div>
          <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-white/30"></div>
          <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-white/30"></div>
          <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-white/30"></div>
        </div>
      )}
      <div
        className={`flex flex-col items-center rounded-[18px] transition-all ${isOffer ? 'border-2 border-[#0a1c58]' : 'border border-gray-200 shadow-lg'} bg-white box-border overflow-hidden`}
        style={{
          width: 300,
          minHeight: 580,
          padding: '20px 20px 0 20px',
          borderTopLeftRadius: isOffer ? 0 : 18,
          borderTopRightRadius: isOffer ? 0 : 18,
        }}
      >
        {/* Brand logo */}
        <div className="w-full flex items-center mt-2 mb-2">
          <Image src={tire.brandLogo} alt={tire.brand} width={90} height={25} />
        </div>
        {/* Tire image */}
        <div className="w-full flex justify-center items-center mb-4" style={{ height: 220, minHeight: 220, maxHeight: 220 }}>
          <Image src={tire.image} alt={`${tire.brand} ${tire.pattern} tire`} width={200} height={200} className="object-contain" style={{ maxWidth: '100%', maxHeight: '100%' }} />
        </div>
        <div className="w-full text-left flex-1 flex flex-col justify-between">
          <div>
            <div className="font-bold text-[20px] text-black mb-2 leading-tight font-poppins">{tire.pattern}</div>
            <div className="text-[14px] mb-1.5 font-poppins">
              <span className="text-black font-bold">Tire Size: </span>
              <span className="text-black">{tire.tireSize}</span>
            </div>
            <div className="text-[14px] mb-1.5 font-poppins">
              <span className="text-black font-bold">Thread Warranty: </span>
              <span className="text-black">{tire.warranty}</span>
            </div>
            <div className="text-[14px] mb-2.5 font-poppins">
              <span className="text-black font-bold">Availability: </span>
              <span className={`font-bold ${tire.availability === 'In Stock' || tire.availability === 'IN_STOCK'
                ? 'text-green-700'
                : tire.availability === 'Contact Us' || tire.availability === 'CONTACT_US'
                  ? 'text-red-600'
                  : 'text-red-600' // For Low Stock, Out of Stock, etc.
                }`}>
                {tire.availability === 'IN_STOCK' ? 'In Stock' :
                  tire.availability === 'LOW_STOCK' ? 'Low Stock' :
                    tire.availability === 'OUT_OF_STOCK' ? 'No Stock' :
                      tire.availability === 'CONTACT_US' ? 'Contact Us' :
                        tire.availability}
              </span>
            </div>
            <div className="font-bold text-[22px] text-[#0a1c58] mb-3 font-poppins">KES {totalPrice.toLocaleString()}</div>
            <div className="flex gap-2 mb-0">
              <div className="bg-[#f3f3f3] rounded-lg px-2 py-1 text-center font-poppins whitespace-nowrap flex-1">
                <div className="text-[12px] text-[#7d7d7d] font-medium">Year</div>
                <div className="text-[13px] text-black font-semibold">{tire.year}</div>
              </div>
              <div className="bg-[#f3f3f3] rounded-lg px-2 py-1 text-center font-poppins whitespace-nowrap flex-1">
                <div className="text-[12px] text-[#7d7d7d] font-medium">Origin</div>
                <div className="text-[13px] text-black font-semibold">{tire.origin}</div>
              </div>
            </div>
          </div>
          {/* Divider */}
          <div className="w-full border-t border-gray-200 my-4" />

          {/* Top Button Row - Half-width for Get Quotation and Quantity Controls */}
          <div className="flex w-full gap-2.5 pb-3 flex-nowrap">
            {/* Get Quotation Button - Half width */}
            <Link
              href={`/tire/${tire.id}/quote?quantity=${quantity}`}
              className="shared-btn flex-1 border-2 border-[#0a1c58] text-[#0a1c58] h-[38px] rounded-full font-bold text-[12px] flex items-center justify-center font-poppins whitespace-nowrap bg-white px-3 min-w-0 hover:bg-[#0a1c58] hover:text-white transition no-underline"
              style={{ lineHeight: '1.2' }}
            >
              Get Quotation
            </Link>

            {/* Quantity Controls - Half width */}
            <div className="flex-1 h-[38px] flex items-center justify-center bg-[#f5f3fa] rounded-lg border border-[#e5e7eb]">
              <div className="flex items-center justify-between w-full h-full px-2">
                <button
                  onClick={handleDecrement}
                  disabled={quantity === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-[#232f53] hover:bg-gray-100 border border-[#e5e7eb] transition-colors"
                  aria-label="Decrease quantity"
                >
                  <span className="text-lg font-bold">-</span>
                </button>

                <div className="text-lg font-medium text-[#232f53] select-none mx-2 min-w-[24px] text-center">
                  {quantity}
                </div>

                <button
                  onClick={handleIncrement}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-[#232f53] hover:bg-gray-100 border border-[#e5e7eb] transition-colors"
                  aria-label="Increase quantity"
                >
                  <span className="text-lg font-bold">+</span>
                </button>
              </div>
            </div>
          </div>

          {/* Book Now Button - Full width */}
          <div className="w-full pb-4">
            <Link
              href={`/tire/${tire.id}/booking?quantity=${quantity}`}
              className="w-full h-[38px] rounded-full bg-[#0a1c58] text-white font-bold text-[13px] flex items-center justify-center font-poppins whitespace-nowrap px-3 hover:bg-[#132b7c] transition no-underline"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}