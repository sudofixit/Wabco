"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

const countries = [
    {
        code: "ETH",
        name: "Ethiopia",
        flag: "/flags/et.png",
        href: "https://wabco-ethiopia.vercel.app/",
    },
    {
        code: "SOM",
        name: "Somalia",
        flag: "/flags/so.png",
        href: "https://www.wabcomobility.com/",
    },
    // {
    //     code: "KEN",
    //     name: "Kenya",
    //     flag: "/flags/ke.png",
    //     href: "https://test.wabcomobility.com/",
    // },
];

export default function CountryDropdown() {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative hidden md:block">
            {/* Selected country */}
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 border border-[#0a1c58] px-3 py-1.5 rounded-full
                   text-[#0a1c58] font-semibold cursor-pointer
                   hover:bg-[#0a1c58] hover:text-white transition"
            >
                <Image src="/flags/ke.png" alt="Kenya" width={20} height={14} />
                <span>KEN</span>
                {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg z-50">
                    {countries.map((country) => (
                        <Link
                            key={country.code}
                            href={country.href}
                            target="_self"
                            className="flex items-center gap-3 px-4 py-2
                         text-[#0a1c58] font-medium
                         hover:bg-gray-200 cursor-pointer transition"
                            onClick={() => setOpen(false)}
                        >
                            <Image
                                src={country.flag}
                                alt={country.name}
                                width={20}
                                height={14}
                            />
                            <span>{country.code}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
