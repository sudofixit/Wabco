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

interface Step1Props {
  tire: Tire;
  quantity: number;
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  onNext: () => void;
  flowType?: 'booking' | 'quotation';
}

export default function Step1TireCar({ tire, quantity, bookingData, updateBookingData, onNext, flowType = 'booking' }: Step1Props) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: keyof BookingData, value: string | number) => {
    updateBookingData({ [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Enhanced validation with error navigation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!bookingData.carYear.trim()) {
      newErrors.carYear = 'Car year is required';
    }
    if (!bookingData.carMake.trim()) {
      newErrors.carMake = 'Car make is required';
    }
    if (!bookingData.carModel.trim()) {
      newErrors.carModel = 'Car model is required';
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

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const totalPrice = tire.price * quantity;

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0a1c58] mb-2">
          {flowType === 'booking' ? 'Select Tyre & Car Details' : 'Request a Tyre Quote'}
        </h2>
        <p className="text-gray-600">
          {flowType === 'booking'
            ? 'Confirm your tyre selection and provide your vehicle information'
            : 'Confirm your tyre selection and provide your vehicle information for quotation'
          }
        </p>
      </div>

      {/* Selected Tire Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#0a1c58] mb-4">Selected Tyre</h3>
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={tire.image || "/tire-placeholder.png"}
              alt={`${tire.brand} ${tire.pattern}`}
              width={80}
              height={80}
              className="object-contain w-full h-full"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Image src={tire.brandLogo} alt={tire.brand} width={60} height={16} />
            </div>
            <h4 className="font-semibold text-lg text-[#0a1c58]">{tire.pattern}</h4>
            <p className="text-gray-600 text-sm mb-1">Size: {tire.tireSize}</p>
            <p className="text-gray-600 text-sm mb-1">Warranty: {tire.warranty}</p>
            <p className="text-gray-600 text-sm mb-2">
              Availability: <span className={`font-semibold ${tire.availability === 'IN_STOCK' ? 'text-green-600' : 'text-red-600'
                }`}>
                {tire.availability === 'IN_STOCK' ? 'In Stock' :
                  tire.availability === 'LOW_STOCK' ? 'Low Stock' :
                    tire.availability === 'OUT_OF_STOCK' ? 'No Stock' :
                      tire.availability === 'CONTACT_US' ? 'Contact Us' :
                        tire.availability}
              </span>
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Quantity: <span className="font-semibold text-[#0a1c58]">{quantity}</span></p>
                <p className="font-semibold text-[#0a1c58]">
                  Total: KES {totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm text-blue-700">
          ✓ Tyre is pre-selected with quantity {quantity}. You can change it by going back to the tyre page.
        </div>
      </div>

      {/* Car Details Form */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-[#0a1c58]">Vehicle Information</h3>
        <p className="text-gray-600">Please provide your vehicle details to ensure proper tyre fitment and installation.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Car Year */}
          <div>
            <label htmlFor="carYear" className="block text-sm font-medium text-gray-700 mb-2">
              Car Year *
            </label>
            <input
              type="text"
              id="carYear"
              value={bookingData.carYear}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow up to 4 digits
                if (/^\d{0,4}$/.test(value)) {
                  handleInputChange('carYear', value);

                  // Show error immediately if input length is 1–3
                  if (value.length > 0 && value.length < 4) {
                    setErrors((prev) => ({ ...prev, carYear: 'Year must be 4 digits' }));
                  } else {
                    // Clear error when input is valid
                    setErrors((prev) => ({ ...prev, carYear: '' }));
                  }
                }
              }}
              inputMode="numeric"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 transition-all duration-200 ${errors.carYear ? 'border-red-500 bg-red-50 shake' : 'border-gray-300'
                }`}
              placeholder="e.g., 2020"
            />
            {errors.carYear && (
              <div className="flex items-center gap-2 mt-1">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-500 text-sm font-medium animate-pulse">{errors.carYear}</p>
              </div>
            )}
          </div>

          {/* Car Make */}
          <div>
            <label htmlFor="carMake" className="block text-sm font-medium text-gray-700 mb-2">
              Car Make *
            </label>
            <input
              type="text"
              id="carMake"
              value={bookingData.carMake}
              onChange={(e) => handleInputChange('carMake', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 transition-all duration-200 ${errors.carMake ? 'border-red-500 bg-red-50 shake' : 'border-gray-300'
                }`}
              placeholder="e.g., Toyota"
            />
            {errors.carMake && (
              <div className="flex items-center gap-2 mt-1">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-red-500 text-sm font-medium animate-pulse">{errors.carMake}</p>
              </div>
            )}
          </div>

          {/* Car Model */}
          <div>
            <label htmlFor="carModel" className="block text-sm font-medium text-gray-700 mb-2">
              Car Model *
            </label>
            <input
              type="text"
              id="carModel"
              value={bookingData.carModel}
              onChange={(e) => handleInputChange('carModel', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 transition-all duration-200 ${errors.carModel ? 'border-red-500 bg-red-50 shake' : 'border-gray-300'
                }`}
              placeholder="e.g., Camry"
            />
            {errors.carModel && (
              <div className="flex items-center gap-2 mt-1">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-red-500 text-sm font-medium animate-pulse">{errors.carModel}</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-500">
          * Required fields
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-yellow-800">Important Note</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Please ensure your vehicle information is accurate. Our technicians will verify tyre compatibility before installation to ensure optimal performance and safety.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-6 border-t">
        <button
          onClick={handleNext}
          className="bg-[#0a1c58] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#132b7c] transition focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:ring-offset-2"
        >
          {flowType === 'booking' ? 'Continue to Branch Selection →' : 'Continue to Branch Selection →'}
        </button>
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