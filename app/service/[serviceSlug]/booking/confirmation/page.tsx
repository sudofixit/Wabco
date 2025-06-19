import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PrintButton from './components/PrintButton';

interface ConfirmationPageProps {
  searchParams: Promise<{ bookingId?: string }>;
}

async function getBookingDetails(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: { branch: true },
    });
    return booking;
  } catch (error) {
    console.error('Error fetching booking:', error);
    return null;
  }
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { bookingId } = await searchParams;
  
  if (!bookingId) {
    notFound();
  }

  const booking = await getBookingDetails(bookingId);
  
  if (!booking) {
    notFound();
  }

  const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* Header */}
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image src="/Wabco Logo.jpeg" alt="Wabco Mobility Logo" width={231} height={30} />
            </Link>
          </div>
          <nav className="hidden md:flex gap-8 text-base font-medium text-[#0a1c58]">
            <Link href="/" className="hover:text-black transition">Home</Link>
            <Link href="/tire" className="hover:text-black transition">Tires</Link>
            <Link href="/service" className="hover:text-black transition">Services</Link>
            <Link href="/location" className="hover:text-black transition">Location</Link>
          </nav>
          <Link href="/contact-us">
            <button className="hidden md:block border-2 border-[#0a1c58] text-[#0a1c58] px-6 py-2 rounded-full font-semibold hover:bg-[#0a1c58] hover:text-white transition">
              Contact Us
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          {/* Success Icon and Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#0a1c58] mb-4">
              {booking.requestType === 'booking' ? 'Booking Confirmed!' : 'Quote Request Submitted!'}
            </h1>
            <p className="text-gray-600 text-lg">
              {booking.requestType === 'booking' 
                ? 'Your service appointment has been successfully booked. We\'ll see you soon!'
                : 'Your quote request has been submitted. We\'ll contact you soon with pricing details!'
              }
            </p>
          </div>

          {/* Booking Details */}
          <div className="border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#0a1c58] mb-6">
              {booking.requestType === 'booking' ? 'Booking Details' : 'Quote Request Details'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {booking.requestType === 'booking' ? 'Booking Reference' : 'Quote Reference'}
                  </p>
                  <p className="text-lg font-semibold text-[#0a1c58]">
                    {booking.requestType === 'booking' ? 'WM-' : 'QT-'}{booking.id.toString().padStart(6, '0')}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Service
                  </p>
                  <p className="text-gray-900 font-medium">{booking.services}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Vehicle
                  </p>
                  <p className="text-gray-900">
                    {booking.carYear} {booking.carMake} {booking.carModel}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Customer
                  </p>
                  <p className="text-gray-900">{booking.customerName}</p>
                  <p className="text-gray-600 text-sm">{booking.customerEmail}</p>
                  <p className="text-gray-600 text-sm">{booking.customerPhone}</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {booking.requestType === 'booking' && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Date & Time
                    </p>
                    <p className="text-gray-900 font-medium">
                      {formatDate(booking.bookingDate)}
                    </p>
                    <p className="text-gray-900">{booking.bookingTime}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Location
                  </p>
                  <p className="text-gray-900 font-medium">{booking.branchName}</p>
                  <p className="text-gray-600 text-sm">{booking.branch.address}</p>
                  <p className="text-gray-600 text-sm">{booking.branch.phone}</p>
                  {booking.branch.workingHours && (
                    <p className="text-gray-600 text-sm">{booking.branch.workingHours}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Status
                  </p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    booking.requestType === 'booking' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {booking.requestType === 'booking' ? 'Confirmed' : 'Quote Requested'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-4">Important Information</h3>
            <ul className="text-blue-800 space-y-2">
              {booking.requestType === 'booking' ? (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Please arrive 10 minutes before your scheduled appointment time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Bring your vehicle registration documents and any relevant paperwork</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>If you need to reschedule or cancel, please contact us at least 24 hours in advance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Service completion times may vary depending on your vehicle's condition</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>We will contact you within 24 hours with a detailed quote</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Final pricing may vary based on your vehicle's specific requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Quote is valid for 30 days from the date of issue</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>You can book your service once you approve the quote</span>
                  </li>
                </>
              )}
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>A confirmation email has been sent to {booking.customerEmail}</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

          {/* Print Option */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <PrintButton />
          </div>
        </div>
      </main>
    </div>
  );
} 