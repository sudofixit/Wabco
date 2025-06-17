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
  serviceId: number;
  serviceTitle: string;
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
  service: Service;
  selectedLocation?: Location;
  flowType?: 'booking' | 'quotation';
}

export default function Step4CustomerInfo({
  bookingData,
  updateBookingData,
  onPrev,
  onSubmit,
  isSubmitting,
  service,
  selectedLocation,
  flowType = 'booking',
}: Step4Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof BookingData, value: string) => {
    updateBookingData({ [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!bookingData.customerName.trim()) {
      newErrors.customerName = 'Full name is required';
    }

    if (!bookingData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email address is required';
    } else if (!validateEmail(bookingData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    if (!bookingData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0a1c58] mb-2">Customer Information</h2>
        <p className="text-gray-600">
          {flowType === 'booking' 
            ? 'Provide your contact details to complete the booking'
            : 'Provide your contact details to complete the quote request'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Information Form */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[#0a1c58]">Your Details</h3>
          
          {/* Full Name */}
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="customerName"
              value={bookingData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 ${
                errors.customerName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John Doe"
            />
            {errors.customerName && (
              <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="customerEmail"
              value={bookingData.customerEmail}
              onChange={(e) => handleInputChange('customerEmail', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 ${
                errors.customerEmail ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="john@example.com"
            />
            {errors.customerEmail && (
              <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="customerPhone"
              value={bookingData.customerPhone}
              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 ${
                errors.customerPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+254 700 000 000"
            />
            {errors.customerPhone && (
              <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
            )}
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
            {flowType === 'booking' ? 'Booking Summary' : 'Quote Request Summary'}
          </h3>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6">
            {/* Service Details */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Service</h4>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={service.image || "/service card picture.png"}
                    alt={service.title}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{service.title}</p>
                  {service.price && (
                    <p className="text-sm text-gray-600">
                      Starting from KES {service.price.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Vehicle</h4>
              <p className="text-gray-700">
                {bookingData.carYear} {bookingData.carMake} {bookingData.carModel}
              </p>
            </div>

            {/* Location Details */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-medium text-gray-900">{bookingData.branchName}</p>
                {selectedLocation && (
                  <>
                    <p>{selectedLocation.address}</p>
                    <p>{selectedLocation.phone}</p>
                    {selectedLocation.workingHours && (
                      <p>{selectedLocation.workingHours}</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Appointment Details - Only show for booking flow */}
            {flowType === 'booking' && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Appointment</h4>
                <div className="space-y-1 text-gray-700">
                  <p><span className="font-medium">Date:</span> {formatDate(bookingData.bookingDate)}</p>
                  <p><span className="font-medium">Time:</span> {bookingData.bookingTime}</p>
                </div>
              </div>
            )}
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Important Notes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Please arrive 10 minutes before your appointment</li>
              <li>• Bring your vehicle registration documents</li>
              <li>• Contact us if you need to reschedule</li>
              <li>• Service times may vary based on vehicle condition</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
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
              {flowType === 'booking' ? 'Confirming Booking...' : 'Submitting Quote Request...'}
            </>
          ) : (
            flowType === 'booking' ? 'Confirm Booking ✓' : 'Submit Quote Request ✓'
          )}
        </button>
      </div>
    </div>
  );
} 