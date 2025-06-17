"use client";

import { useState, useEffect } from 'react';

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

interface Step3Props {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

// Generate time slots from 9:00 to 17:30
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 9; hour <= 17; hour++) {
    if (hour === 17) {
      slots.push('17:00', '17:30');
    } else {
      slots.push(`${hour.toString().padStart(2, '0')}:00`, `${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

export default function Step3DateTime({ bookingData, updateBookingData, onNext, onPrev }: Step3Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const timeSlots = generateTimeSlots();

  // Calculate min and max dates (today to 1 month from now)
  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);

  const minDateString = today.toISOString().split('T')[0];
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Fetch available slots when date or branch changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!bookingData.bookingDate || !bookingData.branchId) {
        setAvailableSlots(timeSlots);
        setBookedSlots([]);
        return;
      }

      setIsLoadingSlots(true);
      try {
        const response = await fetch(
          `/api/bookings/available-slots?branchId=${bookingData.branchId}&bookingDate=${bookingData.bookingDate}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch available slots');
        }

        const data = await response.json();
        setAvailableSlots(data.availableSlots);
        setBookedSlots(data.bookedSlots);
      } catch (error) {
        console.error('Error fetching available slots:', error);
        // Fallback to all slots if API fails
        setAvailableSlots(timeSlots);
        setBookedSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [bookingData.bookingDate, bookingData.branchId]);

  const handleDateChange = (date: string) => {
    updateBookingData({ bookingDate: date });
    // Clear error when user selects a date
    if (errors.bookingDate) {
      setErrors(prev => ({ ...prev, bookingDate: '' }));
    }
  };

  const handleTimeChange = (time: string) => {
    updateBookingData({ bookingTime: time });
    // Clear error when user selects a time
    if (errors.bookingTime) {
      setErrors(prev => ({ ...prev, bookingTime: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!bookingData.bookingDate) {
      newErrors.bookingDate = 'Please select a booking date';
    }
    if (!bookingData.bookingTime) {
      newErrors.bookingTime = 'Please select a booking time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
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
        <h2 className="text-2xl font-bold text-[#0a1c58] mb-2">Select Date & Time</h2>
        <p className="text-gray-600">Choose your preferred appointment date and time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Date Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#0a1c58]">Select Date</h3>
          
          <div>
            <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-2">
              Booking Date *
            </label>
            <input
              type="date"
              id="bookingDate"
              value={bookingData.bookingDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={minDateString}
              max={maxDateString}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent text-gray-900 ${
                errors.bookingDate ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ colorScheme: 'light' }}
            />
            {errors.bookingDate && (
              <p className="text-red-500 text-sm mt-1">{errors.bookingDate}</p>
            )}
          </div>

          {bookingData.bookingDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-[#0a1c58] mb-2">Selected Date</h4>
              <p className="text-gray-700">{formatDate(bookingData.bookingDate)}</p>
            </div>
          )}

          <div className="text-sm text-gray-500">
            <p>• You can book up to 1 month in advance</p>
            <p>• Same-day booking is available if slots are open</p>
          </div>
        </div>

        {/* Time Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#0a1c58]">Select Time</h3>
          
          {errors.bookingTime && (
            <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
              {errors.bookingTime}
            </div>
          )}

          {isLoadingSlots ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a1c58]"></div>
              <span className="ml-2 text-gray-600">Loading available slots...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {timeSlots.map((time) => {
                const isBooked = bookedSlots.includes(time);
                const isSelected = bookingData.bookingTime === time;
                
                return (
                  <button
                    key={time}
                    onClick={() => !isBooked && handleTimeChange(time)}
                    disabled={isBooked}
                    className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-[#0a1c58] bg-[#0a1c58] text-white'
                        : isBooked
                        ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed'
                        : 'border-gray-200 text-gray-700 hover:border-[#0a1c58] hover:bg-blue-50'
                    }`}
                    title={isBooked ? 'This time slot is already booked' : ''}
                  >
                    {time}
                    {isBooked && (
                      <div className="text-xs mt-1 text-red-500">Booked</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {bookingData.bookingTime && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Selected Time</h4>
              <p className="text-green-700">{bookingData.bookingTime}</p>
            </div>
          )}

          <div className="text-sm text-gray-500">
            <p>• Available hours: 9:00 AM - 5:30 PM</p>
            <p>• 30-minute appointment slots</p>
            <p>• All times are shown in local time</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      {bookingData.bookingDate && bookingData.bookingTime && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#0a1c58] mb-4">Appointment Summary</h3>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-medium">Service:</span> {bookingData.serviceTitle}</p>
            <p><span className="font-medium">Vehicle:</span> {bookingData.carYear} {bookingData.carMake} {bookingData.carModel}</p>
            <p><span className="font-medium">Location:</span> {bookingData.branchName}</p>
            <p><span className="font-medium">Date:</span> {formatDate(bookingData.bookingDate)}</p>
            <p><span className="font-medium">Time:</span> {bookingData.bookingTime}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onPrev}
          className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        >
          ← Back to Branch Selection
        </button>
        
        <button
          onClick={handleNext}
          disabled={!bookingData.bookingDate || !bookingData.bookingTime}
          className={`px-8 py-3 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            bookingData.bookingDate && bookingData.bookingTime
              ? 'bg-[#0a1c58] text-white hover:bg-[#132b7c] focus:ring-[#0a1c58]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Customer Info →
        </button>
      </div>
    </div>
  );
} 