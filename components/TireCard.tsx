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
    <div style={{ width: 330, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
      {isOffer && (
        <div
          className="flex items-center justify-center"
          style={{
            height: 40,
            background: '#0a1c58',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <span className="text-white font-bold text-[16px] leading-none font-poppins">
            {tire.offerText}
          </span>
        </div>
      )}
      <div
        className={`flex flex-col items-center rounded-[20px] transition-all ${isOffer ? 'border-2 border-[#0a1c58]' : 'border border-gray-200 shadow-md'} bg-white box-border overflow-hidden`}
        style={{
          width: 330,
          minHeight: 670,
          padding: '20px 20px 0 20px',
          borderTopLeftRadius: isOffer ? 0 : 20,
          borderTopRightRadius: isOffer ? 0 : 20,
        }}
      >
        {/* Brand logo */}
        <div className="w-full flex items-center mt-2 mb-2">
          <Image src={tire.brandLogo} alt={tire.brand} width={90} height={25} />
        </div>
        {/* Tire image */}
        <div className="w-full flex justify-center items-center mb-4" style={{ height: 260, minHeight: 260, maxHeight: 260 }}>
          <Image src={tire.image} alt={`${tire.brand} ${tire.pattern} tire`} width={240} height={240} className="object-contain" style={{ maxWidth: '100%', maxHeight: '100%' }} />
        </div>
        <div className="w-full text-left flex-1 flex flex-col justify-between">
          <div>
            <div className="font-bold text-[22px] text-black mb-2 leading-tight font-poppins">{tire.pattern}</div>
            <div className="text-[16px] mb-1 font-poppins">
              <span className="text-black font-bold">Tire Size: </span>
              <span className="text-black">{tire.tireSize}</span>
            </div>
            <div className="text-[16px] mb-1 font-poppins">
              <span className="text-black font-bold">Thread Warranty: </span>
              <span className="text-black">{tire.warranty}</span>
            </div>
            <div className="text-[16px] mb-3 font-poppins">
              <span className="text-black font-bold">Availability: </span>
              <span className={`font-bold ${
                tire.availability === 'In Stock' || tire.availability === 'IN_STOCK'
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
            <div className="font-bold text-[26px] text-[#0a1c58] mb-3 font-poppins">KES {totalPrice.toLocaleString()}</div>
            <div className="flex gap-2 mb-0">
              <div className="bg-[#f3f3f3] rounded-lg px-1 py-0.5 text-center font-poppins whitespace-nowrap flex-1">
                <div className="text-[13px] text-[#7d7d7d] font-medium">Year</div>
                <div className="text-[14px] text-black font-semibold">{tire.year}</div>
              </div>
              <div className="bg-[#f3f3f3] rounded-lg px-1 py-0.5 text-center font-poppins whitespace-nowrap flex-1">
                <div className="text-[13px] text-[#7d7d7d] font-medium">Origin</div>
                <div className="text-[14px] text-black font-semibold">{tire.origin}</div>
              </div>
            </div>
          </div>
          {/* Divider */}
          <div className="w-full border-t border-gray-200 my-0" />
          {/* Button Row */}
          <div className="flex w-full gap-2 pb-4 flex-nowrap overflow-hidden">
            <Link 
              href={`/tire/${tire.id}/quote?quantity=${quantity}`}
              className="shared-btn flex-[1.5] border-2 border-[#0a1c58] text-[#0a1c58] h-[44px] rounded-full font-bold text-[12px] flex items-center justify-center font-poppins whitespace-nowrap bg-white px-3 min-w-0 hover:bg-[#0a1c58] hover:text-white transition no-underline" 
              style={{lineHeight: '1.2'}}
            >
              Get Quotation
            </Link>
            <Link 
              href={`/tire/${tire.id}/booking?quantity=${quantity}`}
              className="flex-[1.2] h-[44px] rounded-full bg-[#0a1c58] text-white font-bold text-[12px] flex items-center justify-center font-poppins whitespace-nowrap px-3 min-w-0 hover:bg-[#132b7c] transition no-underline"
            >
              Book Now
            </Link>
            <div className="flex-[0.6] h-[44px] flex items-center justify-center bg-[#f5f3fa] rounded-xl border border-[#f5f3fa] min-w-[70px] max-w-[90px]">
              <div className="flex items-center w-full h-full">
                <div className="flex items-center justify-center bg-white rounded-lg h-9 w-12 text-xl font-medium text-[#232f53] select-none border border-[#f5f3fa]">{quantity}</div>
                <div className="flex flex-col ml-2 h-9 justify-center">
                  <button
                    onClick={handleIncrement}
                    className="w-6 h-4 flex items-center justify-center text-[#232f53] hover:bg-gray-200 rounded-t"
                    aria-label="Increase quantity"
                    style={{lineHeight: 1, fontSize: '16px'}}
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M5 12l5-5 5 5" stroke="#232f53" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button
                    onClick={handleDecrement}
                    disabled={quantity === 1}
                    className="w-6 h-4 flex items-center justify-center text-[#232f53] hover:bg-gray-200 rounded-b disabled:opacity-40"
                    aria-label="Decrease quantity"
                    style={{lineHeight: 1, fontSize: '16px'}}
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M5 8l5 5 5-5" stroke="#232f53" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 