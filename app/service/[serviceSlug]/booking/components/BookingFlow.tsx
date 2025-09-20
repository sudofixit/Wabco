"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Step1ServiceCar from './Step1ServiceCar';
import Step2Branch from './Step2Branch';
import Step3DateTime from './Step3DateTime';
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
  serviceId: number;
  serviceTitle: string;
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
  service: Service;
  locations: Location[];
  flowType?: 'booking' | 'quotation';
}

const getSteps = (flowType: 'booking' | 'quotation') => {
  const baseSteps = [
    { number: 1, title: 'Service & Car', description: 'Select service and car details' },
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

export default function BookingFlow({ service, locations, flowType = 'booking' }: BookingFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = getSteps(flowType);
  const maxSteps = steps.length;

  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: service.id,
    serviceTitle: service.title,
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
          serviceId: bookingData.serviceId,
          carYear: bookingData.carYear,
          carMake: bookingData.carMake,
          carModel: bookingData.carModel,
          services: bookingData.serviceTitle,
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
        throw new Error('Failed to create booking');
      }

      const createdBooking = await response.json();
      toast.success(flowType === 'booking' ? 'Booking created successfully!' : 'Quote request submitted successfully!');

      // Redirect to confirmation page
      router.push(`/service/${generateSlug(service.title)}/booking/confirmation?bookingId=${createdBooking.id}`);
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
            service={service}
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
              service={service}
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
            service={service}
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
        <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image src="/Wabco Logo.jpeg" alt="Wabco Mobility Logo" width={231} height={30} />
            </Link>
          </div>
          <nav className="hidden md:flex gap-8 text-base font-medium text-[#0a1c58]">
            <Link href="/" className="hover:text-black transition">Home</Link>
            <Link href="/tire" className="hover:text-black transition">Tires</Link>
            <Link href="/service" className="font-bold text-black transition">Services</Link>
            <Link href="/location" className="hover:text-black transition">Location</Link>
          </nav>
          <Link href="/contact-us">
            <button className="hidden md:block border-2 border-[#0a1c58] text-[#0a1c58] px-6 py-2 rounded-full font-semibold hover:bg-[#0a1c58] hover:text-white transition">
              Contact Us
            </button>
          </Link>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="w-full bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div
            className="flex items-start justify-between"
          >
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${currentStep >= step.number
                      ? "bg-[#0a1c58] text-white"
                      : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    {step.number}
                  </div>
                  <div className="text-center mt-2">
                    <div
                      className={`text-sm font-medium ${currentStep >= step.number ? "text-[#0a1c58]" : "text-gray-500"
                        }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 hidden md:block">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 transition-colors ${currentStep > step.number ? "bg-[#0a1c58]" : "bg-gray-200"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          {renderCurrentStep()}
        </div>
      </main>
    </div>
  );
} 