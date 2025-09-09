import Link from 'next/link'
import React from 'react'

function Footer() {
    return (
        <div className="flex flex-col sm:flex-row gap-8 md:gap-16 lg:gap-40 w-full lg:w-auto">
            {/* Company */}
            <div>
                <div className="font-semibold text-lg md:text-xl text-[#0a1c58] mb-4">Company</div>
                <ul className="space-y-2 text-[#7d7d7d] text-base md:text-lg">
                    <li><Link href="/" className="hover:underline">Home</Link></li>
                    <li><Link href="/tire" className="hover:underline">Tires</Link></li>
                    <li><Link href="/service" className="hover:underline">Services</Link></li>
                    <li><Link href="/location" className="hover:underline">Location</Link></li>
                    <li><Link href="/contact-us" className="hover:underline">Contact Us</Link></li>
                </ul>
            </div>
            {/* Information 1 */}
            <div>
                <div className="font-semibold text-lg md:text-xl text-[#0a1c58] mb-4">Information</div>
                <ul className="space-y-2 text-[#7d7d7d] text-base md:text-lg">
                    <li><a href="/FAQs" className="hover:underline">FAQ</a></li>
                    <li><a href="/blog" className="hover:underline">Blog</a></li>
                    <li><a href="/contact-us" className="hover:underline">Support</a></li>
                </ul>
            </div>
            {/* Information 2 */}
            <div>
                <div className="font-semibold text-lg md:text-xl text-[#0a1c58] mb-4">Information</div>
                <ul className="space-y-2 text-[#7d7d7d] text-base md:text-lg">
                    <li><a href="/terms" className="hover:underline">Terms</a></li>
                    <li><a href="/privacy" className="hover:underline">Privacy</a></li>
                </ul>
            </div>
        </div>
    )
}

export default Footer