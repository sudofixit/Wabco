"use client";

import { useState } from 'react';
import Image from 'next/image';

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
  serviceId?: number;
  serviceTitle?: string;
  services?: any[];
  servicesTitles?: string;
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

interface Step2Props {
  locations: Location[];
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  flowType?: 'booking' | 'quotation';
}

export default function Step2Branch({ locations, bookingData, updateBookingData, onNext, onPrev, flowType = 'booking' }: Step2Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLocationSelect = (location: Location) => {
    updateBookingData({
      branchId: location.id,
      branchName: location.name,
    });
    // Clear error when user selects a location
    if (errors.branchId) {
      setErrors(prev => ({ ...prev, branchId: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!bookingData.branchId || bookingData.branchId === 0) {
      newErrors.branchId = 'Please select a branch location';
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
        <h2 className="text-2xl font-bold text-[#0a1c58] mb-2">Choose Your Preferred Branch</h2>
        <p className="text-gray-600">Select the location where you'd like to receive your service</p>
      </div>

      {/* Branch Selection */}
      <div className="space-y-4">
        {errors.branchId && (
          <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
            {errors.branchId}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {locations.map((location) => (
            <div
              key={location.id}
              onClick={() => handleLocationSelect(location)}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                bookingData.branchId === location.id
                  ? 'border-[#0a1c58] bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={location.image || "/location-placeholder.png"}
                    alt={location.name}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-[#0a1c58] mb-2">
                    {location.name}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{location.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{location.phone}</span>
                    </div>
                    
                    {location.workingHours && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{location.workingHours}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Selection Indicator */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  bookingData.branchId === location.id
                    ? 'border-[#0a1c58] bg-[#0a1c58]'
                    : 'border-gray-300'
                }`}>
                  {bookingData.branchId === location.id && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {locations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No locations available at the moment.</p>
            <p className="text-sm">Please contact us to book your service.</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onPrev}
          className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        >
          ← Back to Service & Car
        </button>
        
        <button
          onClick={handleNext}
          disabled={!bookingData.branchId}
          className={`px-8 py-3 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            bookingData.branchId
              ? 'bg-[#0a1c58] text-white hover:bg-[#132b7c] focus:ring-[#0a1c58]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {flowType === 'booking' ? 'Continue to Date & Time →' : 'Continue to Quotation Details →'}
        </button>
      </div>
    </div>
  );
} 