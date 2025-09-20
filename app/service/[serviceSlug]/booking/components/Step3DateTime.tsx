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
  bookingType?: 'servicebooking' | 'tirebooking';
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

export default function Step3DateTime({
  bookingData,
  updateBookingData,
  onNext,
  onPrev,
  bookingType = 'servicebooking'
}: Step3Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [apiMessage, setApiMessage] = useState<string>('');
  const timeSlots = generateTimeSlots();

  // Calculate min and max dates (today to 1 month from now)
  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);

  const minDateString = today.toISOString().split('T')[0];
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Fetch available slots when date, branch, or service changes (only for service booking)
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      // For tire booking, all slots are always available
      if (bookingType === 'tirebooking') {
        setAvailableSlots(timeSlots);
        setBookedSlots([]);
        setAllSlots(timeSlots);
        setApiMessage('All time slots are available for tire booking');
        return;
      }

      // Service booking logic (existing)
      if (!bookingData.bookingDate || !bookingData.branchId) {
        setAvailableSlots(timeSlots);
        setBookedSlots([]);
        setAllSlots(timeSlots);
        return;
      }

      setIsLoadingSlots(true);
      try {
        const queryParams = new URLSearchParams({
          branchId: bookingData.branchId.toString(),
          bookingDate: bookingData.bookingDate,
        });

        // Handle multiple services
        if (bookingData.services && bookingData.services.length > 0) {
          bookingData.services.forEach((s) => {
            queryParams.append('serviceIds', s.id.toString());
          });
        }
        // fallback: support single legacy serviceId if still present
        else if (bookingData.serviceId) {
          queryParams.append('serviceId', bookingData.serviceId.toString());
        }

        const response = await fetch(`/api/bookings/available-slots?${queryParams}`);

        if (!response.ok) {
          throw new Error('Failed to fetch available slots');
        }

        const data = await response.json();
        setAvailableSlots(data.availableSlots || timeSlots);
        setBookedSlots(data.bookedSlots || []);
        setAllSlots(data.allSlots || timeSlots);
        setApiMessage(data.message || '');

        // Clear any existing time conflict errors when new data loads
        if (errors.timeConflict) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.timeConflict;
            return newErrors;
          });
        }

      } catch (error) {
        console.error('Error fetching available slots:', error);
        // Fallback to all slots if API fails
        setAvailableSlots(timeSlots);
        setBookedSlots([]);
        setAllSlots(timeSlots);
        setApiMessage('Failed to load booking data. All slots shown as available.');
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [bookingData.bookingDate, bookingData.branchId, bookingData.serviceId, bookingType]);

  const handleDateChange = (date: string) => {
    updateBookingData({ bookingDate: date });
    // Clear time selection when date changes
    if (bookingData.bookingTime) {
      updateBookingData({ bookingTime: '' });
    }
    // Clear error when user selects a date
    if (errors.bookingDate) {
      setErrors(prev => ({ ...prev, bookingDate: '' }));
    }
  };

  const handleTimeChange = (time: string) => {
    // For tire booking, all slots are always available
    if (bookingType === 'tirebooking') {
      updateBookingData({ bookingTime: time });

      // Clear any existing errors
      if (errors.bookingTime || errors.timeConflict) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.bookingTime;
          delete newErrors.timeConflict;
          return newErrors;
        });
      }
      return;
    }

    // Service booking logic (existing)
    // Check if this time slot is booked for the same service
    const isBookedForSameService = bookedSlots.includes(time);

    if (isBookedForSameService) {
      // Show inline error for same-service conflict
      setErrors(prev => ({
        ...prev,
        timeConflict: `This time slot (${time}) is already booked for "${bookingData.serviceTitle ? bookingData.serviceTitle : 'the same service'}". Please choose a different time. Note: Different services can be booked at the same time.`
      }));

      // Don't select the time slot
      return;
    }

    // Time slot is available - proceed with selection
    updateBookingData({ bookingTime: time });

    // Clear any existing errors
    if (errors.bookingTime || errors.timeConflict) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.bookingTime;
        delete newErrors.timeConflict;
        return newErrors;
      });
    }
  };

  // Enhanced validation with error navigation for TC-054
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!bookingData.bookingDate) {
      newErrors.bookingDate = 'Please select a booking date';
    }
    if (!bookingData.bookingTime) {
      newErrors.bookingTime = 'Please select a booking time';
    }

    setErrors(newErrors);

    // Navigate to first error field
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });

        setTimeout(() => {
          errorElement.focus();
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

  // Get dynamic content based on booking type
  const getBookingTypeText = () => {
    return bookingType === 'tirebooking'
      ? {
        title: 'tire installation',
        availability: 'Multiple tire installations can be scheduled at the same time',
        conflict: 'All time slots are available for tire booking'
      }
      : {
        title: 'service',
        availability: 'Different services can share time slots',
        conflict: 'Same service bookings create conflicts'
      };
  };

  const bookingTypeText = getBookingTypeText();

  return (
    <div className="space-y-14">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0a1c58] mb-2">Select Date & Time</h2>
        <p className="text-gray-600">Choose your preferred appointment date and time</p>
        {bookingType === 'tirebooking' && (
          <p className="text-green-600 text-sm mt-2 font-medium">
            ✓ All time slots are available for tire booking
          </p>
        )}
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
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:border-transparent text-gray-900 ${errors.bookingDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              style={{ colorScheme: 'light' }}
            />
            {errors.bookingDate && (
              <p className="text-red-500 text-sm mt-1 font-medium animate-pulse flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {errors.bookingDate}
              </p>
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

          {/* Time Conflict Error (only for service booking) */}
          {bookingType === 'servicebooking' && errors.timeConflict && (
            <div className="text-red-600 text-sm p-4 bg-red-50 border border-red-200 rounded-lg font-medium">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold mb-1">Service Booking Conflict</p>
                  <p>{errors.timeConflict}</p>
                </div>
              </div>
            </div>
          )}

          {/* General Time Error */}
          {errors.bookingTime && !errors.timeConflict && (
            <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg font-medium animate-pulse">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>{errors.bookingTime}</span>
              </div>
            </div>
          )}

          {isLoadingSlots && bookingType === 'servicebooking' ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a1c58]"></div>
              <span className="ml-2 text-gray-600">Loading available slots...</span>
            </div>
          ) : (
            <div id="bookingTime" className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto p-4">
              {allSlots.map((time) => {
                const isBookedForSameService = bookingType === 'servicebooking' && bookedSlots.includes(time);
                const isSelected = bookingData.bookingTime === time;
                const isAvailable = availableSlots.includes(time);

                return (
                  <button
                    key={time}
                    onClick={() => handleTimeChange(time)}
                    className={`p-3 text-sm font-medium rounded-lg border-2 transition-all relative ${isSelected
                      ? 'border-[#0a1c58] bg-[#0a1c58] text-white shadow-md'
                      : bookingType === 'tirebooking'
                        ? 'border-gray-200 text-gray-700 hover:border-[#0a1c58] hover:bg-blue-50'
                        : isBookedForSameService
                          ? 'border-orange-300 bg-orange-50 text-orange-700 cursor-pointer hover:border-orange-400 hover:bg-orange-100'
                          : isAvailable
                            ? 'border-gray-200 text-gray-700 hover:border-[#0a1c58] hover:bg-blue-50'
                            : 'border-gray-200 bg-gray-100 text-gray-400'
                      }`}
                    title={
                      bookingType === 'tirebooking'
                        ? `Available time slot - book tire installation`
                        : isBookedForSameService
                          ? `This time is already booked for "${bookingData.serviceTitle}". Click to see details.`
                          : isAvailable
                            ? `Available time slot - book "${bookingData.serviceTitle}"`
                            : 'Time slot unavailable'
                    }
                  >
                    {time}
                    {bookingType === 'servicebooking' && isBookedForSameService && (
                      <div className="text-xs mt-1 text-orange-600 font-medium">Same Service Conflict</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {bookingData.bookingTime && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✓ Selected Time</h4>
              <p className="text-green-700 font-medium">{bookingData.bookingTime}</p>
              <p className="text-green-600 text-sm mt-1">
                Ready to book {bookingType === 'tirebooking' ? 'tire installation' : `"${bookingData.serviceTitle}"`} at this time
              </p>
            </div>
          )}

          {/* API Status Message */}
          {apiMessage && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
              <strong>System Info:</strong> {apiMessage}
            </div>
          )}

          <div className="text-sm text-gray-500">
            <p>• Available hours: 9:00 AM - 5:30 PM</p>
            <p>• 30-minute appointment slots</p>
            <p className="text-green-600">• {bookingTypeText.availability}</p>
            {bookingType === 'servicebooking' && (
              <p className="text-orange-600">• {bookingTypeText.conflict}</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {bookingData.bookingDate && bookingData.bookingTime && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#0a1c58] mb-4">Appointment Summary</h3>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-medium">{bookingType === 'tirebooking' ? 'Service:' : 'Service:'}</span> {bookingData.serviceTitle ? bookingData.serviceTitle : bookingData.servicesTitles}</p>
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
          className={`px-8 py-3 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${bookingData.bookingDate && bookingData.bookingTime
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