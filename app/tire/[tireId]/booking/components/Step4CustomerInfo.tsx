"use client";

import { useState } from 'react';
import Image from 'next/image';

interface Tire {
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

interface Location {
  id: number;
  name: string;
  address: string;
  phone: string;
  image: string;
  workingHours: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BookingData {
  tireId: number;
  tirePattern: string;
  quantity: number;
  carYear: string;
  carMake: string;
  carModel: string;
  branchId: number;
  branchName: string;
  bookingDate: string;
  bookingTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

interface Step4Props {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  tire: Tire;
  quantity: number;
  selectedLocation?: Location;
  flowType?: 'booking' | 'quotation';
}

export default function Step4CustomerInfo({
  bookingData,
  updateBookingData,
  onPrev,
  onSubmit,
  isSubmitting,
  tire,
  quantity,
  selectedLocation,
  flowType = 'booking',
}: Step4Props) {
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateAndSubmit = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!bookingData.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }
    if (!bookingData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(bookingData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }
    if (!bookingData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit();
    }
  };

  const handleSubmit = () => {
    validateAndSubmit();
  };

  const totalPrice = tire.price * quantity;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Customer Information Form */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0a1c58] mb-2">
            {flowType === 'booking' ? 'Complete Your Tire Booking' : 'Complete Your Tire Quote Request'}
          </h2>
          <p className="text-gray-600">
            {flowType === 'booking' 
              ? 'Please provide your contact information to confirm your tire installation booking.'
              : 'Please provide your contact information to receive your tire quotation.'
            }
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="customerName"
              value={bookingData.customerName}
              onChange={(e) => updateBookingData({ customerName: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 ${
                errors.customerName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.customerName && <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>}
          </div>

          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="customerEmail"
              value={bookingData.customerEmail}
              onChange={(e) => updateBookingData({ customerEmail: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 ${
                errors.customerEmail ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
            />
            {errors.customerEmail && <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>}
          </div>

          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="customerPhone"
              value={bookingData.customerPhone}
              onChange={(e) => updateBookingData({ customerPhone: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 ${
                errors.customerPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your phone number"
            />
            {errors.customerPhone && <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>}
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>* Required fields</p>
          <p>
            {flowType === 'booking' 
              ? 'We\'ll use this information to send you booking confirmations and updates.'
              : 'We\'ll use this information to send you quote details and updates.'
            }
          </p>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-[#0a1c58]">
          {flowType === 'booking' ? 'Tire Booking Summary' : 'Tire Quote Request Summary'}
        </h3>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6">
          {/* Tire Details */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Tire</h4>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={tire.image || "/tire-placeholder.png"}
                  alt={`${tire.brand} ${tire.pattern}`}
                  width={48}
                  height={48}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Image src={tire.brandLogo} alt={tire.brand} width={40} height={12} />
                </div>
                <p className="font-medium text-gray-900">{tire.pattern}</p>
                <p className="text-sm text-gray-600">Size: {tire.tireSize}</p>
                <p className="text-sm text-gray-600">Quantity: {quantity}</p>
                <p className="text-sm text-gray-600">
                  Total: KES {totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Vehicle</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Year:</span> {bookingData.carYear}</p>
              <p><span className="font-medium">Make:</span> {bookingData.carMake}</p>
              <p><span className="font-medium">Model:</span> {bookingData.carModel}</p>
            </div>
          </div>

          {/* Location Details */}
          {selectedLocation && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Installation Location</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{selectedLocation.name}</p>
                <p>{selectedLocation.address}</p>
                <p>{selectedLocation.phone}</p>
                {selectedLocation.workingHours && (
                  <p>{selectedLocation.workingHours}</p>
                )}
              </div>
            </div>
          )}

          {/* Date & Time (for booking only) */}
          {flowType === 'booking' && bookingData.bookingDate && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Installation Appointment</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Date:</span> {new Date(bookingData.bookingDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                <p><span className="font-medium">Time:</span> {bookingData.bookingTime}</p>
              </div>
            </div>
          )}
        </div>

        {/* Important Notes */}
        {flowType === 'booking' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Important Notes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Please arrive 10 minutes before your appointment</li>
              <li>• Bring your vehicle registration documents</li>
              <li>• Contact us if you need to reschedule</li>
              <li>• Installation time may vary based on tire type</li>
            </ul>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="lg:col-span-2">
        <div className="flex justify-between pt-6 border-t">
          <button
            onClick={onPrev}
            disabled={isSubmitting}
            className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {flowType === 'booking' ? '← Back to Date & Time' : '← Back to Branch Selection'}
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2 ${
              isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-600'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {flowType === 'booking' ? 'Confirming Tire Booking...' : 'Submitting Tire Quote Request...'}
              </>
            ) : (
              flowType === 'booking' ? 'Confirm Tire Booking ✓' : 'Submit Tire Quote Request ✓'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 