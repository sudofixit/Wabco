"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TireCard from "@/components/TireCard";

export interface Tire {
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

interface TireClientPageProps {
  tires: Tire[];
  brands: string[];
}

export default function TireClientPage({ tires, brands }: TireClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Filter state
  const [width, setWidth] = useState(searchParams.get("width") || "");
  const [ratio, setRatio] = useState(searchParams.get("ratio") || "");
  const [rimSize, setRimSize] = useState(searchParams.get("rimSize") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [offer, setOffer] = useState(searchParams.get("offer") || "");
  const [origin, setOrigin] = useState(searchParams.get("origin") || "");
  
  // Pagination state
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Apply button feedback state
  const [isApplying, setIsApplying] = useState(false);

  // Generate filter options
  const getUnique = (arr: any[], key: string) => Array.from(new Set(arr.map(item => item[key]))).filter(Boolean);
  
  const widthOptions = getUnique(tires, "width").sort((a, b) => parseInt(a) - parseInt(b));
  const ratioOptions = getUnique(tires, "profile").sort((a, b) => parseInt(a) - parseInt(b));
  const rimSizeOptions = getUnique(tires, "diameter").sort((a, b) => parseInt(a) - parseInt(b));
  const offerOptions = ["Yes", "No"];
  const originOptions = getUnique(tires, "origin");

  // Filter tires
  const filterTires = () => {
    let filtered = tires;
    if (width) filtered = filtered.filter(t => t.width === width);
    if (ratio) filtered = filtered.filter(t => t.profile === ratio);
    if (rimSize) filtered = filtered.filter(t => t.diameter === rimSize);
    if (brand) filtered = filtered.filter(t => t.brand === brand);
    if (offer) filtered = filtered.filter(t => (offer === "Yes" ? t.offer : !t.offer));
    if (origin) filtered = filtered.filter(t => t.origin === origin);
    return filtered;
  };

  const filteredTires = filterTires();
  const totalPages = Math.ceil(filteredTires.length / ITEMS_PER_PAGE);
  const paginatedTires = filteredTires.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Update URL query params
  const updateQueryParams = (params: Record<string, string>) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    });
    router.replace(url.pathname + url.search, { scroll: false });
  };

  // Handle Apply (for Width, Ratio, Rim Size)
  const handleApply = () => {
    setIsApplying(true);
    updateQueryParams({ width, ratio, rimSize, brand, offer, origin });
    setPage(1); // Reset to first page when filters change
    
    // Reset the applying state after a brief moment
    setTimeout(() => {
      setIsApplying(false);
    }, 800);
  };

  // Handle individual filter changes (Brand, Offer, Origin)
  const handleFilterChange = (filterType: string, value: string) => {
    const newParams = { width, ratio, rimSize, brand, offer, origin };
    newParams[filterType as keyof typeof newParams] = value;
    updateQueryParams(newParams);
    setPage(1); // Reset to first page when filters change
  };

  // Handle Clear All
  const handleClear = () => {
    setWidth(""); setRatio(""); setRimSize(""); setBrand(""); setOffer(""); setOrigin("");
    updateQueryParams({ width: "", ratio: "", rimSize: "", brand: "", offer: "", origin: "" });
    setPage(1);
  };

  return (
    <section className="w-full flex justify-center bg-white py-16 px-4">
      <div className="w-full max-w-[1440px] flex flex-col md:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-[320px] flex-shrink-0 mb-10 md:mb-0">
          <h2 className="text-3xl font-bold text-[#0a1c58] mb-6">Discover Our Premium Tire Selection</h2>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg font-semibold text-[#0a1c58]">Filter</span>
            <button onClick={handleClear} className="text-white bg-[#0a1c58] px-4 py-1 rounded-full text-sm font-medium">Clear All</button>
          </div>
          
          {/* Top 3 filters with Apply */}
          <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6">
            <div className="relative mb-3">
              <select 
                value={width} 
                onChange={e => setWidth(e.target.value)} 
                className="w-full px-4 pr-12 py-3 rounded-lg border border-gray-200 text-[#0a1c58] bg-white focus:outline-none text-base font-medium appearance-none"
              >
                <option value="">Select Width</option>
                {widthOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="#0a1c58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
            <div className="relative mb-3">
              <select 
                value={ratio} 
                onChange={e => setRatio(e.target.value)} 
                className="w-full px-4 pr-12 py-3 rounded-lg border border-gray-200 text-[#0a1c58] bg-white focus:outline-none text-base font-medium appearance-none"
              >
                <option value="">Select Ratio</option>
                {ratioOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="#0a1c58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
            <div className="relative mb-3">
              <select 
                value={rimSize} 
                onChange={e => setRimSize(e.target.value)} 
                className="w-full px-4 pr-12 py-3 rounded-lg border border-gray-200 text-[#0a1c58] bg-white focus:outline-none text-base font-medium appearance-none"
              >
                <option value="">Select Rim Size</option>
                {rimSizeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="#0a1c58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
            <button 
              onClick={handleApply} 
              disabled={isApplying}
              className={`w-full py-2 rounded-lg font-bold mt-2 transition-all duration-300 ${
                isApplying 
                  ? 'bg-green-600 text-white' 
                  : 'bg-[#0a1c58] text-white hover:bg-[#132b7c]'
              }`}
            >
              {isApplying ? '✓ Applied!' : 'Apply'}
            </button>
          </div>

          {/* Individual filters */}
          <div className="relative mb-4">
            <select 
              value={brand} 
              onChange={e => { setBrand(e.target.value); handleFilterChange('brand', e.target.value); }} 
              className="w-full px-4 pr-12 py-3 rounded-lg bg-[#f3f3f3] text-black font-bold focus:outline-none text-base appearance-none"
            >
              <option value="">Brand</option>
              {brands.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
          <div className="relative mb-4">
            <select 
              value={offer} 
              onChange={e => { setOffer(e.target.value); handleFilterChange('offer', e.target.value); }} 
              className="w-full px-4 pr-12 py-3 rounded-lg bg-[#f3f3f3] text-black font-bold focus:outline-none text-base appearance-none"
            >
              <option value="">Offer</option>
              {offerOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
          <div className="relative">
            <select 
              value={origin} 
              onChange={e => { setOrigin(e.target.value); handleFilterChange('origin', e.target.value); }} 
              className="w-full px-4 pr-12 py-3 rounded-lg bg-[#f3f3f3] text-black font-bold focus:outline-none text-base appearance-none"
            >
              <option value="">Origin</option>
              {originOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
        </aside>

        {/* Tire Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedTires.map((tire) => (
              <TireCard key={tire.id} tire={tire} />
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button 
                onClick={() => setPage(page - 1)} 
                disabled={page === 1} 
                className={`px-4 py-2 rounded ${page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#0a1c58] text-white hover:bg-[#132b7c]'}`}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button 
                  key={i + 1} 
                  onClick={() => setPage(i + 1)} 
                  className={`px-4 py-2 rounded ${page === i + 1 ? 'bg-[#0a1c58] text-white' : 'bg-gray-100 text-[#0a1c58] hover:bg-[#e5e7eb]'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setPage(page + 1)} 
                disabled={page === totalPages} 
                className={`px-4 py-2 rounded ${page === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#0a1c58] text-white hover:bg-[#132b7c]'}`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 