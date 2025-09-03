"use client";

import { useState } from 'react';
import Image from 'next/image';

interface Service {
  id: number;
  title: string;
  description: string | null;
  image: string;
  price: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  services: Service[];
  servicesTitles: string;
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

interface Step4CustomerInfoProps {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  services: Service[];
  selectedLocation?: Location;
  flowType?: 'booking' | 'quotation';
}

export default function Step4CustomerInfo({
  bookingData,
  updateBookingData,
  onPrev,
  onSubmit,
  isSubmitting,
  services,
  selectedLocation,
  flowType = 'booking'
}: Step4CustomerInfoProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const validatePhone = (phone: string): boolean => {
    // only digits, 7 to 15 digits long
    const phoneRegex = /^\d{7,15}$/;
    return phoneRegex.test(phone);
  };

  const validateAndSubmit = () => {
    const newErrors: { [key: string]: string } = {};

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
    } else if (!validatePhone(bookingData.customerPhone)) {
      newErrors.customerPhone = 'Please enter a valid phone number (7–15 digits)';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const totalPrice = services.reduce((sum, service) => sum + (service.price || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Customer Information Form */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-[#0a1c58] mb-6">Customer Information</h2>

        <div className="space-y-6">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="customerName"
              value={bookingData.customerName}
              onChange={(e) => updateBookingData({ customerName: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 ${errors.customerName ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 ${errors.customerEmail ? 'border-red-500' : 'border-gray-300'
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
              maxLength={15}
              value={bookingData.customerPhone}
              onChange={(e) => updateBookingData({ customerPhone: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 ${errors.customerPhone ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Enter your phone number"
            />
            {errors.customerPhone && <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onPrev}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Previous
          </button>
          <button
            onClick={validateAndSubmit}
            disabled={isSubmitting}
            className="bg-[#0a1c58] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#132b7c] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? (flowType === 'booking' ? 'Creating Booking...' : 'Submitting Quote Request...')
              : (flowType === 'booking' ? 'Confirm Booking' : 'Submit Quote Request')
            }
          </button>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-[#0a1c58] mb-6">
          {flowType === 'booking' ? 'Booking Summary' : 'Quote Request Summary'}
        </h2>

        {/* Selected Services */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Selected Services ({services.length})</h3>
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={service.image || "/service card picture.png"}
                      alt={service.title}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{service.title}</div>
                  </div>
                </div>
                <div className="font-semibold text-[#0a1c58]">
                  {service.price ? `KES ${service.price.toLocaleString()}` : 'Quote'}
                </div>
              </div>
            ))}
          </div>
          {totalPrice > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Starting Price:</span>
                <span className="text-lg font-bold text-[#0a1c58]">KES {totalPrice.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Vehicle Information */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Vehicle Information</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700">
              <span className="font-medium">{bookingData.carYear} {bookingData.carMake} {bookingData.carModel}</span>
            </p>
          </div>
        </div>

        {/* Branch Information */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Service Location</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="font-medium text-gray-900">{bookingData.branchName}</div>
            {selectedLocation && (
              <>
                <div className="text-gray-600 mt-1">{selectedLocation.address}</div>
                <div className="text-gray-600">{selectedLocation.phone}</div>
                {selectedLocation.workingHours && (
                  <div className="text-gray-600">{selectedLocation.workingHours}</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Appointment Details - Only show for booking flow */}
        {flowType === 'booking' && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Appointment Details</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-medium text-gray-900">{formatDate(bookingData.bookingDate)}</div>
              <div className="text-gray-600">{formatTime(bookingData.bookingTime)}</div>
            </div>
          </div>
        )}

        {/* Important Notes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Please arrive 10 minutes before your appointment</li>
            <li>• Bring your vehicle registration and driver's license</li>
            <li>• Final pricing may vary based on vehicle condition</li>
            <li>• You will receive a confirmation email shortly</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 