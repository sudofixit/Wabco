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

interface Step1Props {
  service: Service;
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  onNext: () => void;
  flowType?: 'booking' | 'quotation';
}

export default function Step1ServiceCar({ service, bookingData, updateBookingData, onNext, flowType = 'booking' }: Step1Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof BookingData, value: string | number) => {
    updateBookingData({ [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0a1c58] mb-2">
          {flowType === 'booking' ? 'Select Service & Car Details' : 'Request a Service Quote'}
        </h2>
        <p className="text-gray-600">
          {flowType === 'booking' 
            ? 'Choose your service and provide your vehicle information'
            : 'Choose your service and provide your vehicle information for quotation'
          }
        </p>
      </div>

      {/* Selected Service Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#0a1c58] mb-4">Selected Service</h3>
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={service.image || "/service card picture.png"}
              alt={service.title}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-lg text-[#0a1c58]">{service.title}</h4>
            {service.description && (
              <p className="text-gray-600 text-sm mb-2">{service.description}</p>
            )}
            {service.price && (
              <p className="font-semibold text-[#0a1c58]">
                Starting from KES {service.price.toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 text-sm text-blue-700">
          ✓ Service is pre-selected. You can change it if needed by going back to the services page.
        </div>
      </div>

      {/* Car Details Form */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-[#0a1c58]">Vehicle Information</h3>
        
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
              onChange={(e) => handleInputChange('carYear', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 ${
                errors.carYear ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 2020"
            />
            {errors.carYear && (
              <p className="text-red-500 text-sm mt-1">{errors.carYear}</p>
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
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 ${
                errors.carMake ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Toyota"
            />
            {errors.carMake && (
              <p className="text-red-500 text-sm mt-1">{errors.carMake}</p>
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
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent placeholder-gray-600 text-gray-900 ${
                errors.carModel ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Camry"
            />
            {errors.carModel && (
              <p className="text-red-500 text-sm mt-1">{errors.carModel}</p>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-500">
          * Required fields
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
    </div>
  );
} 