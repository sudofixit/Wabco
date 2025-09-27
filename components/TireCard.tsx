"use client";
import React, { useState } from "react";
import Image from "next/image";
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
  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncrement = () => setQuantity((q) => q + 1);
  const totalPrice = tire.price * quantity;
  const isOffer = tire.offer;

  return (
    <div className="w-full flex flex-col">
      {/* ----- Offer Banner ----- */}
      {isOffer && (
        <div className="relative bg-[#0a1c58] py-2 overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[length:24px_24px] bg-[linear-gradient(45deg,transparent_48%,white_50%,transparent_52%)]"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="relative text-center">
            <span className="text-white font-semibold text-[14px] tracking-wide font-poppins uppercase flex items-center justify-center">
              <span className="w-3 h-px bg-white/60 mx-1.5"></span>
              {tire.offerText}
              <span className="w-3 h-px bg-white/60 mx-1.5"></span>
            </span>
          </div>
          <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-white/30"></div>
          <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-white/30"></div>
          <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-white/30"></div>
          <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-white/30"></div>
        </div>
      )}

      {/* ----- Card Body ----- */}
      <div
        className={`flex flex-col items-center rounded-[18px] transition-all w-full ${isOffer
          ? "border-2 border-[#0a1c58] rounded-tl-none rounded-tr-none"
          : "border border-gray-200 shadow-lg"
          } bg-white overflow-hidden flex-1 min-h-[580px] p-5 pt-5 pb-0`}
      >
        {/* Brand Logo */}
        <div className="w-full flex items-center mt-2 mb-2">
          <Image src={tire.brandLogo} alt={tire.brand} width={90} height={25} />
        </div>

        {/* Tire Image */}
        <div
          className="w-full flex justify-center items-center mb-4"
          style={{ height: 220 }}
        >
          <Image
            src={tire.image}
            alt={`${tire.brand} ${tire.pattern} tire`}
            width={200}
            height={200}
            className="object-contain"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        </div>

        {/* Details */}
        <div className="w-full text-left flex-1 flex flex-col justify-between">
          <div>
            <div className="font-bold text-[20px] text-black mb-2 leading-tight font-poppins">
              {tire.pattern}
            </div>
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
              <span
                className={`font-bold ${tire.availability === "In Stock" ||
                  tire.availability === "IN_STOCK"
                  ? "text-green-700"
                  : "text-red-600"
                  }`}
              >
                {tire.availability === "IN_STOCK"
                  ? "In Stock"
                  : tire.availability === "LOW_STOCK"
                    ? "Low Stock"
                    : tire.availability === "OUT_OF_STOCK"
                      ? "No Stock"
                      : tire.availability === "CONTACT_US"
                        ? "Contact Us"
                        : tire.availability}
              </span>
            </div>
            <div className="font-bold text-[22px] text-[#0a1c58] mb-3 font-poppins">
              KES {totalPrice.toLocaleString()}
            </div>

            {/* Year & Origin */}
            <div className="flex gap-2 mb-0">
              <div className="bg-[#f3f3f3] rounded-lg px-2 py-1 text-center font-poppins flex-1">
                <div className="text-[12px] text-[#7d7d7d] font-medium">Year</div>
                <div className="text-[13px] text-black font-semibold">
                  {tire.year}
                </div>
              </div>
              <div className="bg-[#f3f3f3] rounded-lg px-2 py-1 text-center font-poppins flex-1">
                <div className="text-[12px] text-[#7d7d7d] font-medium">
                  Origin
                </div>
                <div className="text-[13px] text-black font-semibold">
                  {tire.origin}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full border-t border-gray-200 my-4" />

          {/* ---- Bottom Controls ---- */}
          <div className="flex flex-col w-full gap-3 pb-4">
            {/* Quantity Controls */}
            <div className="w-full flex items-center justify-center">
              <div className="flex items-center bg-gradient-to-r from-[#f8f9ff] to-[#f0f2ff] rounded-xl border-2 border-[#e8ecff] shadow-sm px-1 py-1">
                <button
                  onClick={handleDecrement}
                  disabled={quantity === 1}
                  className="
                    w-10 h-10 flex items-center justify-center
                    rounded-lg bg-white text-[#0a1c58] shadow-sm
                    hover:bg-[#0a1c58] hover:text-white hover:shadow-md
                    transition-all duration-200 flex-shrink-0
                    disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-[#0a1c58]
                    border border-[#e8ecff]
                  "
                >
                  <span className="text-lg font-bold leading-none">−</span>
                </button>

                <div className="flex-1 min-w-[60px] text-lg font-bold text-[#0a1c58] select-none text-center px-4">
                  {quantity}
                </div>

                <button
                  onClick={handleIncrement}
                  className="
                    w-10 h-10 flex items-center justify-center
                    rounded-lg bg-white text-[#0a1c58] shadow-sm
                    hover:bg-[#0a1c58] hover:text-white hover:shadow-md
                    transition-all duration-200 flex-shrink-0
                    border border-[#e8ecff]
                  "
                >
                  <span className="text-lg font-bold leading-none">+</span>
                </button>
              </div>
            </div>

            {/* Get Quotation */}
            <Link
              href={`/tire/${tire.id}/quote?quantity=${quantity}`}
              className="
                w-full h-[48px] rounded-xl font-bold text-[13px]
                flex items-center justify-center font-poppins
                bg-gradient-to-r from-white to-[#f8f9ff]
                border-2 border-[#0a1c58] text-[#0a1c58]
                hover:from-[#0a1c58] hover:to-[#132b7c] hover:text-white
                transition-all duration-300 no-underline
                shadow-sm hover:shadow-lg transform hover:scale-[1.02]
              "
            >
              Get Quotation
            </Link>
          </div>

          {/* Book Now */}
          <div className="w-full pb-4">
            <Link
              href={`/tire/${tire.id}/booking?quantity=${quantity}`}
              className="
                w-full h-[38px] rounded-full bg-[#0a1c58]
                text-white font-bold text-[13px]
                flex items-center justify-center font-poppins
                hover:bg-[#132b7c] transition no-underline
              "
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}