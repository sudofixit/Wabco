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
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateAndNext = () => {
    const newErrors: {[key: string]: string} = {};
    
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

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  const totalPrice = tire.price * quantity;

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0a1c58] mb-2">
          {flowType === 'booking' ? 'Select Tire & Car Details' : 'Request a Tire Quote'}
        </h2>
        <p className="text-gray-600">
          {flowType === 'booking' 
            ? 'Confirm your tire selection and provide your vehicle information'
            : 'Confirm your tire selection and provide your vehicle information for quotation'
          }
        </p>
      </div>

      {/* Selected Tire Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#0a1c58] mb-4">Selected Tire</h3>
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
              Availability: <span className={`font-semibold ${
                tire.availability === 'IN_STOCK' ? 'text-green-600' : 'text-red-600'
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
          ✓ Tire is pre-selected with quantity {quantity}. You can change it by going back to the tire page.
        </div>
      </div>

      {/* Car Details Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#0a1c58] mb-4">Vehicle Information</h3>
        <p className="text-gray-600 mb-6">Please provide your vehicle details to ensure proper tire fitment and installation.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="carYear" className="block text-sm font-medium text-gray-700 mb-2">
              Year *
            </label>
            <input
              type="text"
              id="carYear"
              value={bookingData.carYear}
              onChange={(e) => updateBookingData({ carYear: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent text-gray-900 ${
                errors.carYear ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 2020"
            />
            {errors.carYear && <p className="mt-1 text-sm text-red-600">{errors.carYear}</p>}
          </div>

          <div>
            <label htmlFor="carMake" className="block text-sm font-medium text-gray-700 mb-2">
              Make *
            </label>
            <input
              type="text"
              id="carMake"
              value={bookingData.carMake}
              onChange={(e) => updateBookingData({ carMake: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent text-gray-900 ${
                errors.carMake ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Toyota"
            />
            {errors.carMake && <p className="mt-1 text-sm text-red-600">{errors.carMake}</p>}
          </div>

          <div>
            <label htmlFor="carModel" className="block text-sm font-medium text-gray-700 mb-2">
              Model *
            </label>
            <input
              type="text"
              id="carModel"
              value={bookingData.carModel}
              onChange={(e) => updateBookingData({ carModel: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent text-gray-900 ${
                errors.carModel ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Camry"
            />
            {errors.carModel && <p className="mt-1 text-sm text-red-600">{errors.carModel}</p>}
          </div>
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
                Please ensure your vehicle information is accurate. Our technicians will verify tire compatibility before installation to ensure optimal performance and safety.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <div></div> {/* Empty div for spacing */}
        
        <button
          onClick={validateAndNext}
          className="bg-[#0a1c58] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#132b7c] transition focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:ring-offset-2"
        >
          Continue to Branch Selection →
        </button>
      </div>
    </div>
  );
} 