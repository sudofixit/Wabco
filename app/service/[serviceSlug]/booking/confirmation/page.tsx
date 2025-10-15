"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface BookingData {
  id: number;
  requestType: 'booking' | 'quote';
  services: string;
  carYear: string;
  carMake: string;
  carModel: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: Date | null;
  bookingTime: string;
  branchName: string;
  branch: {
    address: string;
    phone: string;
    workingHours: string;
  };
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookingDetails() {
      if (!bookingId) {
        setError('No booking ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/bookings/${bookingId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch booking details');
        }

        const bookingData = await response.json();
        setBooking(bookingData);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    }

    fetchBookingDetails();
  }, [bookingId]);

  const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const PrintButton = () => {
    return (
      <button
        onClick={() => window.print()}
        className="text-[#0a1c58] hover:text-[#132b7c] font-medium text-sm transition flex items-center gap-2 mx-auto"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print Booking Confirmation
      </button>
    );
  };

  // Show loading state while booking data is being set
  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a1c58] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 font-poppins">
        {/* Header - Hidden when printing */}
        <header className="w-full bg-white shadow-sm print:hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-4 md:px-8">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Image src="/Wabco Logo.jpeg" alt="Wabco Mobility Logo" width={231} height={30} />
              </Link>
            </div>
            <nav className="hidden md:flex gap-8 text-base font-medium text-[#0a1c58]">
              <Link href="/" className="hover:text-black transition">Home</Link>
              <Link href="/tire" className="hover:text-black transition">Tires</Link>
              <Link href="/service" className="font-bold text-black transition">Services</Link>
              <Link href="/location" className="hover:text-black transition">Location</Link>
            </nav>
            <Link href="/contact-us">
              <button className="hidden md:block border-2 border-[#0a1c58] text-[#0a1c58] px-6 py-2 rounded-full font-semibold hover:bg-[#0a1c58] hover:text-white transition">
                Contact Us
              </button>
            </Link>
          </div>
        </header>

        {/* Print-only Header */}
        <div className="hidden print:block print:mb-2">
          <div className="flex items-center justify-between border-b border-gray-200 pb-1">
            <Image src="/Wabco Logo.jpeg" alt="Wabco Mobility Logo" width={120} height={16} />
            <div className="text-right">
              <p className="text-xs text-gray-600">Print Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-12 print:max-w-none print:px-2 print:py-0">
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-12 print:shadow-none print:rounded-none print:p-2">

            {/* Success Header - Very compact in print */}
            <div className="text-center mb-8 print:mb-2">
              <div className="w-20 h-20 print:w-8 print:h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 print:mb-1">
                <svg className="w-10 h-10 print:w-4 print:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl print:text-base font-bold text-[#0a1c58] mb-4 print:mb-1">
                {booking.requestType === 'booking' ? 'Booking Confirmed!' : 'Quote Request Submitted!'}
              </h1>
              <p className="text-gray-600 text-lg print:hidden">
                {booking.requestType === 'booking'
                  ? 'Your service appointment has been successfully booked. We\'ll see you soon!'
                  : 'Your quote request has been submitted. We\'ll contact you soon with pricing details!'
                }
              </p>
            </div>

            {/* Two Column Grid - Two columns on both screen and print */}
            <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-8 print:gap-3">

              {/* Left Column - Booking Details */}
              <div className="print:break-inside-avoid">
                <div className="border border-gray-200 rounded-lg p-6 print:p-2 mb-6 print:mb-2">
                  <h2 className="text-xl print:text-sm font-semibold text-[#0a1c58] mb-6 print:mb-2">
                    {booking.requestType === 'booking' ? 'Booking Details' : 'Quote Request Details'}
                  </h2>

                  <div className="space-y-4 print:space-y-1">
                    {/* Reference */}
                    <div>
                      <p className="text-sm print:text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        {booking.requestType === 'booking' ? 'Booking Reference' : 'Quote Reference'}
                      </p>
                      <p className="text-lg print:text-sm font-semibold text-[#0a1c58]">
                        {booking.requestType === 'booking' ? 'WM-' : 'QT-'}{booking.id.toString().padStart(6, '0')}
                      </p>
                    </div>

                    {/* Service */}
                    <div>
                      <p className="text-sm print:text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Service
                      </p>
                      <p className="text-gray-900 font-medium print:text-xs print:leading-tight">{booking.services}</p>
                    </div>

                    {/* Vehicle */}
                    <div>
                      <p className="text-sm print:text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Vehicle
                      </p>
                      <p className="text-gray-900 print:text-xs">
                        {booking.carYear} {booking.carMake} {booking.carModel}
                      </p>
                    </div>

                    {/* Customer */}
                    <div>
                      <p className="text-sm print:text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Customer
                      </p>
                      <p className="text-gray-900 print:text-xs print:leading-tight">{booking.customerName}</p>
                      <p className="text-gray-600 text-sm print:text-xs">{booking.customerEmail}</p>
                      <p className="text-gray-600 text-sm print:text-xs">{booking.customerPhone}</p>
                    </div>

                    {/* Date & Time for bookings */}
                    {booking.requestType === 'booking' && (
                      <div>
                        <p className="text-sm print:text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Date & Time
                        </p>
                        <p className="text-gray-900 font-medium print:text-xs print:leading-tight">
                          {formatDate(booking.bookingDate)}
                        </p>
                        <p className="text-gray-900 print:text-xs">{booking.bookingTime}</p>
                      </div>
                    )}

                    {/* Location */}
                    <div>
                      <p className="text-sm print:text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Location
                      </p>
                      <p className="text-gray-900 font-medium print:text-xs print:leading-tight">{booking.branchName}</p>
                      <p className="text-gray-600 text-sm print:text-xs print:leading-tight">{booking.branch.address}</p>
                      <p className="text-gray-600 text-sm print:text-xs">{booking.branch.phone}</p>
                      <p className="text-gray-600 text-sm print:text-xs">{booking.branch.workingHours}</p>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-sm print:text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Status
                      </p>
                      <span className={`inline-flex px-3 py-1 print:px-1 print:py-0 text-sm print:text-xs font-semibold rounded-full ${booking.requestType === 'booking'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                        }`}>
                        {booking.requestType === 'booking' ? 'Confirmed' : 'Quote Requested'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Important Information & Contact */}
              <div className="print:break-inside-avoid">
                {/* Important Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 print:p-2 mb-6 print:mb-2">
                  <h3 className="font-semibold text-blue-900 mb-4 print:mb-1 print:text-sm">Important Information</h3>
                  <ul className="text-blue-800 space-y-2 print:space-y-0 text-sm print:text-xs print:leading-tight">
                    {booking.requestType === 'booking' ? (
                      <>
                        <li className="flex items-start gap-1 print:mb-0.5">
                          <span className="text-blue-600 mt-1 print:mt-0">•</span>
                          <span>Please arrive 10 minutes before your scheduled appointment time</span>
                        </li>
                        <li className="flex items-start gap-1 print:mb-0.5">
                          <span className="text-blue-600 mt-1 print:mt-0">•</span>
                          <span>Bring your vehicle registration documents and any relevant paperwork</span>
                        </li>
                        <li className="flex items-start gap-1 print:mb-0.5">
                          <span className="text-blue-600 mt-1 print:mt-0">•</span>
                          <span>If you need to reschedule or cancel, please contact us at least 24 hours in advance</span>
                        </li>
                        <li className="flex items-start gap-1 print:mb-0.5">
                          <span className="text-blue-600 mt-1 print:mt-0">•</span>
                          <span>Service completion times may vary depending on your vehicle's condition</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start gap-1 print:mb-0.5">
                          <span className="text-blue-600 mt-1 print:mt-0">•</span>
                          <span>We will contact you within 24 hours with a detailed quote</span>
                        </li>
                        <li className="flex items-start gap-1 print:mb-0.5">
                          <span className="text-blue-600 mt-1 print:mt-0">•</span>
                          <span>Final pricing may vary based on your vehicle's specific requirements</span>
                        </li>
                        <li className="flex items-start gap-1 print:mb-0.5">
                          <span className="text-blue-600 mt-1 print:mt-0">•</span>
                          <span>Quote is valid for 30 days from the date of issue</span>
                        </li>
                        <li className="flex items-start gap-1 print:mb-0.5">
                          <span className="text-blue-600 mt-1 print:mt-0">•</span>
                          <span>You can book your service once you approve the quote</span>
                        </li>
                      </>
                    )}
                    <li className="flex items-start gap-1">
                      <span className="text-blue-600 mt-1 print:mt-0">•</span>
                      <span>A confirmation email has been sent to {booking.customerEmail}</span>
                    </li>
                  </ul>
                </div>

                {/* Contact Information */}
                <div className="border border-gray-200 rounded-lg p-6 print:p-2 mb-6 print:mb-2">
                  <h3 className="font-semibold text-gray-900 mb-4 print:mb-1 print:text-sm">Need Help?</h3>
                  <div className="space-y-2 print:space-y-0 text-sm print:text-xs print:leading-tight">
                    <p className="text-gray-900 print:mb-0.5"><strong className="text-gray-900">Email:</strong> support@wabcomobility.com</p>
                    <p className="text-gray-900 print:mb-0.5"><strong className="text-gray-900">Phone:</strong> {booking.branch.phone}</p>
                    <p className="text-gray-900 print:mb-0.5"><strong className="text-gray-900">Hours:</strong> {booking.branch.workingHours}</p>
                    <p className="text-gray-900"><strong className="text-gray-900">Address:</strong> {booking.branch.address}</p>
                  </div>
                </div>

                {/* Reference Card */}
                <div className="border border-gray-200 rounded-lg p-6 print:p-2">
                  <h3 className="font-semibold text-gray-900 mb-3 print:mb-1 print:text-sm">Support Reference</h3>
                  <div className="text-center bg-gray-100 rounded p-3 print:p-1">
                    <p className="font-mono text-lg print:text-sm font-bold text-[#0a1c58] print:mb-0">
                      {booking.requestType === 'booking' ? 'WM-' : 'QT-'}{booking.id.toString().padStart(6, '0')}
                    </p>
                    <p className="text-xs text-gray-500 print:text-xs print:leading-tight">Quote this number when calling support</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Hidden when printing */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 print:hidden">
              <Link href="/service">
                <button className="w-full sm:w-auto border-2 border-[#0a1c58] text-[#0a1c58] px-8 py-3 rounded-lg font-semibold hover:bg-[#0a1c58] hover:text-white transition">
                  {booking.requestType === 'booking' ? 'Book Another Service' : 'Back to Quote'}
                </button>
              </Link>

              <Link href="/">
                <button className="w-full sm:w-auto bg-[#0a1c58] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#132b7c] transition">
                  Back to Home
                </button>
              </Link>

              <Link href="/contact-us">
                <button className="w-full sm:w-auto border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition">
                  Contact Support
                </button>
              </Link>
            </div>

            {/* Print Button - Hidden when printing */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200 print:hidden">
              <PrintButton />
            </div>

            {/* Print Footer - Only visible when printing */}
            <div className="hidden print:block print:mt-2 print:pt-1 border-t border-gray-300">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <p>© 2024 Wabco Mobility Services</p>
                <p>Generated: {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Aggressive Print Styles for Single Page */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0.4in 0.3in;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          html, body {
            font-size: 16px !important;
            line-height: 1.5 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:block {
            display: block !important;
          }
          
          .print\\:grid-cols-2 {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
          }
          
          .print\\:gap-3 {
            gap: 2rem !important;
          }
          
          .print\\:break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          
          .print\\:space-y-0 > * + * {
            margin-top: 0 !important;
          }
          
          .print\\:space-y-1 > * + * {
            margin-top: 0.8rem !important;
          }
          
          .print\\:text-xs {
            font-size: 1.2rem !important;
            line-height: 1.4 !important;
          }
          
          .print\\:text-sm {
            font-size: 1.3rem !important;
            line-height: 1.5 !important;
          }
          
          .print\\:text-base {
            font-size: 1.6rem !important;
            line-height: 1.6 !important;
          }
          
          .print\\:leading-tight {
            line-height: 1.1 !important;
          }
          
          .print\\:w-4 {
            width: 0.8rem !important;
          }
          
          .print\\:h-4 {
            height: 0.8rem !important;
          }
          
          .print\\:w-8 {
            width: 1.5rem !important;
          }
          
          .print\\:h-8 {
            height: 1.5rem !important;
          }
          
          .print\\:mb-0 {
            margin-bottom: 0 !important;
          }
          
          .print\\:mb-0\\.5 {
            margin-bottom: 0.125rem !important;
          }
          
          .print\\:mb-1 {
            margin-bottom: 0.6rem !important;
          }
          
          .print\\:mb-2 {
            margin-bottom: 1rem !important;
          }
          
          .print\\:mt-0 {
            margin-top: 0 !important;
          }
          
          .print\\:mt-2 {
            margin-top: 0.5rem !important;
          }
          
          .print\\:p-1 {
            padding: 0.25rem !important;
          }
          
          .print\\:p-2 {
            padding: 1.2rem !important;
          }
          
          .print\\:px-1 {
            padding-left: 0.25rem !important;
            padding-right: 0.25rem !important;
          }
          
          .print\\:px-2 {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }
          
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          
          .print\\:pt-1 {
            padding-top: 0.25rem !important;
          }
          
          .print\\:max-w-none {
            max-width: none !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </>
  );
}