"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function MobileNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1"
        aria-label="Open mobile menu"
      >
        <span className="block w-6 h-0.5 bg-[#0a1c58]"></span>
        <span className="block w-6 h-0.5 bg-[#0a1c58]"></span>
        <span className="block w-6 h-0.5 bg-[#0a1c58]"></span>
      </button>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <Image src="/Wabco Logo.jpeg" alt="Wabco Mobility Logo" width={150} height={20} />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-md hover:bg-gray-100"
                  aria-label="Close mobile menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex flex-col space-y-6">
                <Link
                  href="/"
                  className="text-lg font-medium text-[#0a1c58] hover:text-black transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/tire"
                  className="text-lg font-medium text-[#0a1c58] hover:text-black transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tires
                </Link>
                <Link
                  href="/service"
                  className="text-lg font-medium text-[#0a1c58] hover:text-black transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <Link
                  href="/location"
                  className="text-lg font-medium text-[#0a1c58] hover:text-black transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Location
                </Link>
                <Link href="/contact-us" className="mt-4" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full border-2 border-[#0a1c58] text-[#0a1c58] px-6 py-3 rounded-full font-semibold text-lg hover:bg-[#0a1c58] hover:text-white transition">
                    Contact Us
                  </button>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 