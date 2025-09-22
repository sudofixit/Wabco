"use client";
import React, { useState } from "react";
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

  // Pagination
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  const getUnique = (arr: any[], key: string) =>
    Array.from(new Set(arr.map(item => item[key]))).filter(Boolean);

  const widthOptions = getUnique(tires, "width").sort((a, b) => parseInt(a) - parseInt(b));
  const ratioOptions = getUnique(tires, "profile").sort((a, b) => parseInt(a) - parseInt(b));
  const rimSizeOptions = getUnique(tires, "diameter").sort((a, b) => parseInt(a) - parseInt(b));
  const originOptions = getUnique(tires, "origin");
  const offerOptions = ["Yes", "No"];

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

  const updateQueryParams = (params: Record<string, string>) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    });
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const handleFilterChange = (type: string, value: string) => {
    const newParams = { width, ratio, rimSize, brand, offer, origin };
    newParams[type as keyof typeof newParams] = value;
    updateQueryParams(newParams);
    setPage(1);
  };

  const handleClear = () => {
    setWidth(""); setRatio(""); setRimSize(""); setBrand(""); setOffer(""); setOrigin("");
    updateQueryParams({ width: "", ratio: "", rimSize: "", brand: "", offer: "", origin: "" });
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setTimeout(() => {
      const section = document.getElementById("products-section");
      if (section) {
        const top = section.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 100);
  };

  // Determine if top-3 filters are active
  const topFiltersActive = Boolean(width || ratio || rimSize);

  return (
    <section className="w-full flex justify-center bg-white py-12 px-4">
      <div className="w-full max-w-[1320px] flex flex-col md:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-[280px] flex-shrink-0 mb-8 md:mb-0">
          <h2 className="text-2xl font-bold text-[#0a1c58] mb-5">
            Discover Our Premium Tire Selection
          </h2>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-base font-semibold text-[#0a1c58]">Filter</span>
            <button
              onClick={handleClear}
              className="text-white bg-[#0a1c58] px-3 py-1 rounded-full text-sm font-medium"
            >
              Clear All
            </button>
          </div>

          {/* Top 3 filters with info tab */}
          <div className="bg-white border border-gray-300 rounded-lg p-3 mb-5">
            <div className="relative mb-2.5">
              <select
                value={width}
                onChange={e => setWidth(e.target.value)}
                className="w-full px-3 pr-10 py-2.5 rounded-lg border border-gray-200 text-[#0a1c58] bg-white focus:outline-none text-sm font-medium appearance-none"
              >
                <option value="">Select Width</option>
                {widthOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="relative mb-2.5">
              <select
                value={ratio}
                onChange={e => setRatio(e.target.value)}
                className="w-full px-3 pr-10 py-2.5 rounded-lg border border-gray-200 text-[#0a1c58] bg-white focus:outline-none text-sm font-medium appearance-none"
              >
                <option value="">Select Ratio</option>
                {ratioOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="relative mb-2.5">
              <select
                value={rimSize}
                onChange={e => setRimSize(e.target.value)}
                className="w-full px-3 pr-10 py-2.5 rounded-lg border border-gray-200 text-[#0a1c58] bg-white focus:outline-none text-sm font-medium appearance-none"
              >
                <option value="">Select Rim Size</option>
                {rimSizeOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Informational tab */}
            <div
              className={`mt-3 text-center text-sm font-semibold rounded-lg py-2 ${topFiltersActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
                }`}
            >
              {topFiltersActive ? "Filters applied" : "No filters applied"}
            </div>
          </div>

          {/* Other filters */}
          <div className="relative mb-3">
            <select
              value={brand}
              onChange={e => { setBrand(e.target.value); handleFilterChange("brand", e.target.value); }}
              className="w-full px-3 pr-10 py-2.5 rounded-lg bg-[#f3f3f3] text-black font-bold focus:outline-none text-sm appearance-none"
            >
              <option value="">Brand</option>
              {brands.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="relative mb-3">
            <select
              value={offer}
              onChange={e => { setOffer(e.target.value); handleFilterChange("offer", e.target.value); }}
              className="w-full px-3 pr-10 py-2.5 rounded-lg bg-[#f3f3f3] text-black font-bold focus:outline-none text-sm appearance-none"
            >
              <option value="">Offer</option>
              {offerOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <select
              value={origin}
              onChange={e => { setOrigin(e.target.value); handleFilterChange("origin", e.target.value); }}
              className="w-full px-3 pr-10 py-2.5 rounded-lg bg-[#f3f3f3] text-black font-bold focus:outline-none text-sm appearance-none"
            >
              <option value="">Origin</option>
              {originOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* Tire Grid */}
        <div className="flex-1" id="products-section">
          {filteredTires.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-sm text-gray-500">
                Try adjusting your filters to see more results.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 gap-x-24 
                            justify-items-center md:justify-items-start">
              {paginatedTires.map(tire => (
                <TireCard key={tire.id} tire={tire} />
              ))}
            </div>
          )}

          {totalPages > 1 && filteredTires.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`px-3 py-2 text-sm rounded ${page === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#0a1c58] text-white hover:bg-[#132b7c]"
                  }`}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-2 text-sm rounded ${page === i + 1
                    ? "bg-[#0a1c58] text-white"
                    : "bg-gray-100 text-[#0a1c58] hover:bg-[#e5e7eb]"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`px-3 py-2 text-sm rounded ${page === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#0a1c58] text-white hover:bg-[#132b7c]"
                  }`}
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
