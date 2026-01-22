'use client'
import CountryDropdown from '@/components/CountryDropdown';
import Footer from '@/components/Footer';
import MobileNavigation from '@/components/MobileNavigation';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function FAQPage() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqs = [
        {
            question: "What types of tyres do you sell?",
            answer: "We offer a wide selection of passenger car tyres, SUV tyres, truck tyres, and performance tyres. We carry trusted brands to ensure quality and durability for all road conditions."
        },
        {
            question: "Do you provide car repair and servicing?",
            answer: "Yes, we provide professional car servicing including tyre fitting, balancing, oil changes, and brake checks."
        },
        {
            question: "Can I find spare parts for my car at your shop?",
            answer: "Absolutely! We import genuine and high-quality aftermarket spare parts for various car brands."
        },
        {
            question: "Do you offer car maintenance and repair services?",
            answer: "Yes, we provide full car service solutions including oil changes, diagnostics, brake service, and electrical system checks."
        },
        {
            question: "How can I order tyres or spare parts?",
            answer: "You can easily place your order directly through our website. Simply browse our products and services, select what you need, and complete your order online."
        },
        {
            question: "Do you provide warranties on your products?",
            answer: "Yes, our products come with manufacturer warranties. Terms vary by brand and product type."
        },
        {
            question: "What payment options do you accept?",
            answer: "We accept cash, bank transfer, and mobile money payments."
        },
        {
            question: "Can you help me choose the right tyre or part for my car?",
            answer: "Of course! Our team is happy to recommend the best option based on your car type, driving conditions, and budget."
        },
        {
            question: "Do you provide delivery services?",
            answer: "Yes, we offer delivery within the city and can arrange nationwide shipping upon request."
        },
        {
            question: "Why should I buy from you instead of others?",
            answer: "We are a trusted importer with years of experience. We guarantee quality products, fair prices, and reliable services all in one place."
        }
    ];

    return (
        <div className="bg-white min-h-screen w-full flex flex-col items-center font-sans">
            <Head>
                <title>FAQ - WABCO Mobility</title>
                <meta name="description" content="Frequently asked questions about WABCO Mobility tyres, car services, and spare parts in Kenya." />
                <meta name="keywords" content="tyre FAQ, car service questions, auto parts Kenya, WABCO Mobility support" />
            </Head>

            {/* Header */}
            <header className="w-full max-w-[1320px] flex items-center justify-between py-4 px-6 md:px-12">
                <div className="flex items-center gap-3">
                    <Image src="/Wabco Logo.jpeg" alt="Wabco Mobility Logo" width={208} height={27} />
                </div>
                <nav className="hidden md:flex gap-8 text-base font-medium text-[#0a1c58]">
                    <Link href="/" className="hover:text-black transition">Home</Link>
                    <Link href="/tyre" className="hover:text-black transition">Tyres</Link>
                    <Link href="/service" className="hover:text-black transition">Services</Link>
                    <Link href="/location" className="hover:text-black transition">Location</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/contact-us">
                        <button className="hidden md:block border-2 border-[#0a1c58] text-[#0a1c58] px-6 py-1.5 rounded-full font-semibold text-base hover:bg-[#0a1c58] hover:text-white transition">
                            Contact Us
                        </button>
                    </Link>

                    {/* Country Dropdown */}
                    <CountryDropdown />
                </div>

                {/* Mobile Navigation */}
                <MobileNavigation />
            </header>

            {/* Page Header */}
            <div className="w-full bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 md:py-16 px-4 flex flex-col items-center">
                <div className="w-full max-w-[1440px] text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
                    <p className="text-lg md:text-xl max-w-3xl mx-auto">Find answers to common questions about our products and services</p>
                </div>
            </div>

            {/* FAQ Content */}
            <div className="w-full max-w-[1440px] py-8 md:py-12 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    className="w-full flex justify-between items-center p-4 md:p-6 bg-white text-left font-semibold text-blue-900 hover:bg-blue-50 transition"
                                    onClick={() => toggleFAQ(index)}
                                >
                                    <span>{faq.question}</span>
                                    <span className="text-blue-700 text-xl font-bold">
                                        {activeIndex === index ? "−" : "+"}
                                    </span>
                                </button>
                                <div
                                    className={`transition-all duration-300 ease-in-out overflow-hidden ${activeIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                                >
                                    <div className="p-4 md:p-6 bg-white border-t border-gray-100">
                                        <p className="text-gray-700">{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <footer className="w-full bg-[#f7f7f7] py-8 md:py-12 px-4 flex flex-col items-center font-poppins mt-12">
                <div className="w-full max-w-[1440px] flex flex-col gap-8 md:gap-12">
                    {/* Top Row: Columns + Subscribe */}
                    <div className="flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-50 w-full">
                        {/* Columns */}
                        <Footer />
                    </div>
                    {/* Divider */}
                    <div className="border-t border-[#e5e7eb] w-full mt-4 md:mt-7" />
                    {/* Bottom Row: Logo and Socials */}
                    <div className="w-full flex flex-col md:flex-row justify-between items-center pt-4 md:pt-8 gap-6">
                        <div>
                            <Image
                                src="/Wabco Logo.jpeg"
                                alt="Wabco Mobility Logo"
                                width={180}
                                height={24}
                                className="md:w-[231px] md:h-[30px]"
                            />
                        </div>
                        <div className="flex gap-4 md:gap-6">
                            <a href="#" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#0a1c58] hover:bg-[#0a1c58] hover:text-white transition">
                                <svg width="16" height="16" className="md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z" /></svg>
                            </a>
                            <a href="#" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#0a1c58] hover:bg-[#0a1c58] hover:text-white transition">
                                <svg width="16" height="16" className="md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.495v-9.294H9.692v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0z" /></svg>
                            </a>
                            <a href="#" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#0a1c58] hover:bg-[#0a1c58] hover:text-white transition">
                                <svg width="16" height="16" className="md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.856 3.17 0 2.188 1.115 4.117 2.823 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A9.936 9.936 0 0 0 24 4.557z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
