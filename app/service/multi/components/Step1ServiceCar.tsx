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

interface Step1ServiceCarProps {
  services: Service[];
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  onNext: () => void;
  flowType?: 'booking' | 'quotation';
}

export default function Step1ServiceCar({ services, bookingData, updateBookingData, onNext, flowType = 'booking' }: Step1ServiceCarProps) {
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

  const totalPrice = services.reduce((sum, service) => sum + (service.price || 0), 0);

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-bold text-[#0a1c58] mb-6">
        {flowType === 'booking' ? 'Selected Services & Car Details' : 'Request Quote for Services'}
      </h2>
      
      {/* Selected Services Display */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Services ({services.length})</h3>
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="flex items-center p-4 border border-gray-200 rounded-lg">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={service.image || "/service card picture.png"}
                  alt={service.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="font-semibold text-gray-900">{service.title}</h4>
                {service.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                )}
              </div>
              <div className="text-right">
                <div className="font-semibold text-[#0a1c58]">
                  {service.price ? `KES ${service.price.toLocaleString()}` : 'Price on request'}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Total Price */}
        {totalPrice > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Starting Price:</span>
              <span className="text-xl font-bold text-[#0a1c58]">KES {totalPrice.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Final price may vary based on vehicle condition and additional requirements</p>
          </div>
        )}
      </div>

      {/* Car Details Form */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 ${
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 ${
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 ${
                errors.carModel ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Camry"
            />
            {errors.carModel && <p className="mt-1 text-sm text-red-600">{errors.carModel}</p>}
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={validateAndNext}
          className="bg-[#0a1c58] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#132b7c] transition"
        >
          Continue to Branch Selection
        </button>
      </div>
    </div>
  );
} 