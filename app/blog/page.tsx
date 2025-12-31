// pages/blog.js
import Footer from '@/components/Footer';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function BlogPage() {
    const blogPosts = [
        {
            id: 1,
            title: "The Future of Electric Cars",
            date: "August 15, 2025",
            author: "Wabco Mobility",
            description: "Exploring the rise of EVs and what it means for drivers.",
            content: `
      Electric vehicles (EVs) are no longer a niche product — they are quickly
      becoming the standard. With governments worldwide pushing for cleaner
      energy and automakers investing heavily in EV technology, the future is
      exciting. From lower maintenance costs to reduced emissions, EVs bring
      many benefits. However, challenges such as charging infrastructure and
      battery recycling still need to be solved.
    `,
        },
        {
            id: 2,
            title: "Why Tyre Maintenance Matters",
            date: "August 10, 2025",
            author: "Wabco Mobility",
            description: "Learn how proper tyre care improves safety and saves money.",
            content: `
      Tyres are one of the most critical safety components of a car. Regularly
      checking tyre pressure, alignment, and tread depth can prevent accidents
      and improve fuel efficiency. Rotating your tyres every 5,000 to 8,000
      kilometers helps distribute wear evenly, extending their lifespan.
    `,
        },
        {
            id: 3,
            title: "How to Choose the Right Car Battery",
            date: "August 5, 2025",
            author: "Wabco Mobility",
            description: "Simple tips for picking a reliable battery for your vehicle.",
            content: `
      Choosing the right battery ensures your car runs smoothly. Look for the
      correct size and specifications recommended by your vehicle’s
      manufacturer. Consider maintenance-free batteries for convenience, and
      always check the warranty. If you live in colder climates, cold cranking
      amps (CCA) should be a top priority.
    `,
        },
    ];

    return (
        <div className="bg-white min-h-screen w-full flex flex-col items-center font-sans">
            <Head>
                <title>Blog - WABCO Mobility</title>
                <meta name="description" content="Expert tips and advice on car maintenance, tyre selection, and vehicle care from WABCO Mobility in Somalia." />
                <meta name="keywords" content="car maintenance tips, tyre advice, vehicle care Somalia, WABCO Mobility blog" />
            </Head>

            {/* Header */}
            <header className="w-full max-w-[1440px] flex items-center justify-between py-4 px-4 md:py-6 md:px-8 lg:px-16">
                <div className="flex items-center gap-4">
                    <Image
                        src="/Wabco Logo.jpeg"
                        alt="Wabco Mobility Logo"
                        width={180}
                        height={24}
                        className="md:w-[231px] md:h-[30px]"
                    />
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex gap-6 xl:gap-10 text-base xl:text-lg font-medium text-[#0a1c58]">
                    <Link href="/" className="hover:text-black transition">Home</Link>
                    <Link href="/tyre" className="hover:text-black transition">Tyres</Link>
                    <Link href="/service" className="hover:text-black transition">Services</Link>
                    <Link href="/location" className="hover:text-black transition">Location</Link>
                </nav>

                {/* Desktop Contact Button */}
                <Link href="/contact-us" className="hidden lg:block">
                    <button className="border-2 border-[#0a1c58] text-[#0a1c58] px-6 xl:px-8 py-2 rounded-full font-semibold text-base xl:text-lg hover:bg-[#0a1c58] hover:text-white transition">
                        Contact Us
                    </button>
                </Link>

                {/* Mobile Navigation */}
                <div className="lg:hidden">
                    <button className="text-[#0a1c58]">
                        <i className="fas fa-bars text-xl"></i>
                    </button>
                </div>
            </header>

            {/* Page Header */}
            <div className="w-full bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 md:py-16 px-4 flex flex-col items-center">
                <div className="w-full max-w-[1440px] text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">WABCO Mobility Blog</h1>
                    <p className="text-lg md:text-xl max-w-3xl mx-auto">Expert tips and advice on car maintenance, tyres, and vehicle care</p>
                </div>
            </div>

            {/* Blog Content */}
            <div className="w-full max-w-[1440px] py-8 md:py-12 px-4 md:px-8">
                <div className="grid grid-cols-1 gap-8">
                    {blogPosts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition p-6"
                        >
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                                <span>{post.date}</span>
                                <span className="mx-2">•</span>
                                <span>{post.author}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-blue-900 mb-3">{post.title}</h2>
                            <p className="text-gray-700 mb-4">{post.description}</p>
                            <p className="text-gray-800 leading-relaxed">{post.content}</p>
                        </div>
                    ))}
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