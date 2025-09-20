"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { Toaster } from "react-hot-toast";

const SIDEBAR_ITEMS = [
  { key: "products", label: "Products", href: "/admin/products" },
  { key: "bookings", label: "Bookings", href: "/admin/bookings" },
  { key: "locations", label: "Locations", href: "/admin/locations" },
  { key: "banners", label: "Banners", href: "/admin/banners" },
  { key: "brands", label: "Brands", href: "/admin/brands" },
  { key: "carbrands", label: "Car Brands", href: "/admin/car-brands" },
  { key: "users", label: "Users", href: "/admin/users" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarOpen');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // Authentication check
  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated" || !session?.user) {
      router.push("/admin-login");
      return;
    }

    // Check if user has admin role
    if (session.user.role !== "ADMIN") {
      router.push("/admin-login");
      return;
    }
  }, [session, status, router]);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // Handle escape key for mobile
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a1c58] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting unauthenticated users
  if (status === "unauthenticated" || !session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a1c58] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If on the login page, render only the children (no layout)
  if (pathname === "/admin") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex font-inter bg-[#f7f7f7]">
      <Toaster />
      {/* Backdrop for sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-transparent cursor-pointer"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar backdrop"
        />
      )}
      {/* Main Content */}
      <main className="flex-1 w-full">
        {/* Top Navigation Bar */}
        <div className="fixed left-0 right-0 top-0 bg-white shadow flex items-center h-16 px-6 justify-between z-50">
          <div className="flex items-center gap-4 w-full">
            <button
              className="text-[#0a1c58] p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              role="button"
              tabIndex={0}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="#0a1c58" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-6">
            {/* <button className="relative">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="#0a1c58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button> */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" stroke="#0a1c58" strokeWidth="2" />
                  <path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" stroke="#0a1c58" strokeWidth="2" />
                </svg>
              </div>
              <span className="font-semibold text-[#0a1c58]">{session.user.name || 'Admin'}</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="pt-16 pb-8 px-2">
          {children}
        </div>
      </main>

      {/* Sidebar - Adjusted z-index to be consistent */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Fixed Logo Section */}
        <div className="flex-shrink-0 flex justify-center py-6 border-b border-gray-200">
          <Image src="/Wabco Logo.jpeg" alt="Wabco Mobility Logo" width={180} height={30} />
        </div>

        {/* Scrollable Navigation Section */}
        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col gap-2 p-4">
            {SIDEBAR_ITEMS.map(item => (
              <Link
                key={item.key}
                href={item.href}
                className={`text-lg font-semibold rounded-lg px-4 py-3 text-left transition ${pathname === item.href ? "bg-[#0a1c58] text-white" : "text-[#0a1c58] hover:bg-[#e5e7eb]"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout Section */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}