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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const validatePhone = (phone: string): boolean => {
    // only digits, 7 to 15 digits long
    const phoneRegex = /^\d{7,15}$/;
    return phoneRegex.test(phone);
  };

  // Enhanced validation with error navigation
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
    } else if (!validatePhone(bookingData.customerPhone)) {
      newErrors.customerPhone = 'Please enter a valid phone number (7–15 digits)';
    }

    setErrors(newErrors);

    // Navigate to first error field with smooth scrolling and visual feedback
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        // Smooth scroll to the error field
        errorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });

        // Add a slight delay to ensure scroll is complete, then focus and highlight
        setTimeout(() => {
          errorElement.focus();
          // Add visual emphasis by briefly highlighting the field
          errorElement.classList.add('ring-4', 'ring-red-200');
          setTimeout(() => {
            errorElement.classList.remove('ring-4', 'ring-red-200');
          }, 2000);
        }, 300);
      }
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };

  const totalPrice = tire.price * quantity;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Customer Information Form */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0a1c58] mb-2">
            {flowType === 'booking' ? 'Complete Your Tyre Booking' : 'Complete Your Tyre Quote Request'}
          </h2>
          <p className="text-gray-600">
            {flowType === 'booking'
              ? 'Please provide your contact information to confirm your tyre installation booking.'
              : 'Please provide your contact information to receive your tyre quotation.'
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
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 ${errors.customerName ? 'border-red-500 bg-red-50 shake' : 'border-gray-300'
                }`}
              placeholder="Enter your full name"
            />
            {errors.customerName && (
              <div className="flex items-center gap-2 mt-1">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-red-500 text-sm font-medium animate-pulse">{errors.customerName}</p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="customerEmail"
              value={bookingData.customerEmail}
              onChange={(e) => handleInputChange('customerEmail', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 ${errors.customerEmail ? 'border-red-500 bg-red-50 shake' : 'border-gray-300'
                }`}
              placeholder="Enter your email address"
            />
            {errors.customerEmail && (
              <div className="flex items-center gap-2 mt-1">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-red-500 text-sm font-medium animate-pulse">{errors.customerEmail}</p>
              </div>
            )}
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
              onChange={(e) => {
                // Only allow numbers
                const value = e.target.value.replace(/[^0-9]/g, '');
                handleInputChange('customerPhone', value);
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 ${errors.customerPhone ? 'border-red-500 bg-red-50 shake' : 'border-gray-300'
                }`}
              placeholder="254700000000"
              inputMode="numeric"
            />
            {errors.customerPhone && (
              <div className="flex items-center gap-2 mt-1">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-red-500 text-sm font-medium animate-pulse">{errors.customerPhone}</p>
              </div>
            )}
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
          {flowType === 'booking' ? 'Tyre Booking Summary' : 'Tyre Quote Request Summary'}
        </h3>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6">
          {/* Tire Details */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Tyre</h4>
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
              <li>• Installation time may vary based on tyre type</li>
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
            className={`px-8 py-3 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2 ${isSubmitting
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-600'
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {flowType === 'booking' ? 'Confirming Tyre Booking...' : 'Submitting Tyre Quote Request...'}
              </>
            ) : (
              flowType === 'booking' ? 'Confirm Tyre Booking ✓' : 'Submit Tyre Quote Request ✓'
            )}
          </button>
        </div>
      </div>

      {/* CSS for shake animation */}
      <style jsx>{`
        .shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}