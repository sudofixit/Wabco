"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Step1ServiceCar from './Step1ServiceCar';
import Step2Branch from '../../[serviceSlug]/booking/components/Step2Branch';
import Step3DateTime from '../../[serviceSlug]/booking/components/Step3DateTime';
import Step4CustomerInfo from './Step4CustomerInfo';

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
  // Step 1
  services: Service[];
  servicesTitles: string;
  carYear: string;
  carMake: string;
  carModel: string;
  
  // Step 2
  branchId: number;
  branchName: string;
  
  // Step 3
  bookingDate: string;
  bookingTime: string;
  
  // Step 4
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

interface BookingFlowProps {
  services: Service[];
  locations: Location[];
  flowType?: 'booking' | 'quotation';
}

const getSteps = (flowType: 'booking' | 'quotation') => {
  const baseSteps = [
    { number: 1, title: 'Service & Car', description: 'Selected services and car details' },
    { number: 2, title: 'Branch', description: 'Choose your preferred location' },
  ];
  
  if (flowType === 'booking') {
    return [
      ...baseSteps,
      { number: 3, title: 'Date & Time', description: 'Pick appointment date and time' },
      { number: 4, title: 'Customer Info', description: 'Your contact information' },
    ];
  } else {
    return [
      ...baseSteps,
      { number: 3, title: 'Customer Info', description: 'Your contact information' },
    ];
  }
};

export default function BookingFlow({ services, locations, flowType = 'booking' }: BookingFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const steps = getSteps(flowType);
  const maxSteps = steps.length;
  
  const [bookingData, setBookingData] = useState<BookingData>({
    services: services,
    servicesTitles: services.map(s => s.title).join(', '),
    carYear: '',
    carMake: '',
    carModel: '',
    branchId: 0,
    branchName: '',
    bookingDate: '',
    bookingTime: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitBooking = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carYear: bookingData.carYear,
          carMake: bookingData.carMake,
          carModel: bookingData.carModel,
          services: bookingData.servicesTitles,
          branchId: bookingData.branchId,
          branchName: bookingData.branchName,
          bookingDate: flowType === 'booking' ? bookingData.bookingDate : null,
          bookingTime: flowType === 'booking' ? bookingData.bookingTime : null,
          customerName: bookingData.customerName,
          customerEmail: bookingData.customerEmail,
          customerPhone: bookingData.customerPhone,
          requestType: flowType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create ${flowType}`);
      }

      const createdBooking = await response.json();
      toast.success(flowType === 'booking' ? 'Booking created successfully!' : 'Quote request submitted successfully!');
      
      // Redirect to confirmation page with first service slug for URL consistency
      const firstServiceSlug = generateSlug(services[0].title);
      router.push(`/service/${firstServiceSlug}/booking/confirmation?bookingId=${createdBooking.id}`);
    } catch (error) {
      console.error(`Error creating ${flowType}:`, error);
      toast.error(`Failed to ${flowType === 'booking' ? 'create booking' : 'submit quote request'}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1ServiceCar
            services={services}
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            onNext={nextStep}
            flowType={flowType}
          />
        );
      case 2:
        return (
          <Step2Branch
            locations={locations}
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            onNext={nextStep}
            onPrev={prevStep}
            flowType={flowType}
          />
        );
      case 3:
        if (flowType === 'booking') {
          return (
            <Step3DateTime
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          );
        } else {
          return (
            <Step4CustomerInfo
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              onPrev={prevStep}
              onSubmit={submitBooking}
              isSubmitting={isSubmitting}
              services={services}
              selectedLocation={locations.find(loc => loc.id === bookingData.branchId)}
              flowType={flowType}
            />
          );
        }
      case 4:
        return (
          <Step4CustomerInfo
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            onPrev={prevStep}
            onSubmit={submitBooking}
            isSubmitting={isSubmitting}
            services={services}
            selectedLocation={locations.find(loc => loc.id === bookingData.branchId)}
            flowType={flowType}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* Header */}
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <Link href="/" className="flex items-center">
              <Image src="/Wabco Logo.jpeg" alt="Wabco Mobility Logo" width={231} height={30} />
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-[#0a1c58] transition">Home</Link>
              <Link href="/tire" className="text-gray-700 hover:text-[#0a1c58] transition">Tires</Link>
              <Link href="/service" className="text-[#0a1c58] font-semibold">Services</Link>
              <Link href="/location" className="text-gray-700 hover:text-[#0a1c58] transition">Location</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number 
                      ? 'bg-[#0a1c58] border-[#0a1c58] text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step.number ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-sm font-semibold">{step.number}</span>
                    )}
                  </div>
                  <div className="ml-4 min-w-0">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-[#0a1c58]' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-16 h-0.5 ml-8 ${
                    currentStep > step.number ? 'bg-[#0a1c58]' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentStep()}
      </div>
    </div>
  );
} 