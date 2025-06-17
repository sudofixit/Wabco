import React, { useState, useEffect, useMemo } from "react";
import { Booking, BookingFormData } from "@/types/admin/booking";
import { Location } from "@/types/admin/location";
import { Service } from "@/types/admin/services";
import FormError from "@/app/components/ui/FormError";
import LoadingButton from "@/app/components/ui/LoadingButton";

interface BookingFormProps {
  booking?: Booking;
  onSubmit: (data: BookingFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  locations: Location[];
  services: Service[];
}

const initialFormData: BookingFormData = {
  carYear: '',
  carMake: '',
  carModel: '',
  services: '',
  branchId: 0,
  branchName: '',
  bookingDate: '',
  bookingTime: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  requestType: 'booking',
};

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

interface FormErrors {
  carYear?: string;
  carMake?: string;
  carModel?: string;
  services?: string;
  branchId?: string;
  bookingDate?: string;
  bookingTime?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export default function BookingForm({
  booking,
  onSubmit,
  onCancel,
  isLoading = false,
  locations,
  services
}: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [backendError, setBackendError] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);

  // Memoize active services to prevent infinite re-renders
  const activeServices = useMemo(() => 
    services.filter(service => service.isActive), 
    [services]
  );

  useEffect(() => {
    if (booking) {
      setFormData({
        carYear: booking.carYear,
        carMake: booking.carMake,
        carModel: booking.carModel,
        services: booking.services,
        branchId: booking.branchId,
        branchName: booking.branchName,
        bookingDate: booking.bookingDate ? booking.bookingDate.toString().split('T')[0] : null,
        bookingTime: booking.bookingTime,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        requestType: booking.requestType,
      });

      // Parse existing services if editing
      if (booking.services && activeServices.length > 0) {
        try {
          const serviceNames = booking.services.split(', ');
          const serviceIds = activeServices
            .filter(service => serviceNames.includes(service.title))
            .map(service => service.id);
          setSelectedServices(serviceIds);
        } catch (error) {
          console.error('Error parsing existing services:', error);
        }
      }
    }
  }, [booking]); // Remove activeServices from dependency array

  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case 'carYear':
        if (!value) return 'Car year is required';
        return undefined;
      case 'carMake':
        if (!value) return 'Car make is required';
        return undefined;
      case 'carModel':
        if (!value) return 'Car model is required';
        return undefined;
      case 'services':
        if (!value) return 'At least one service is required';
        return undefined;
      case 'branchId':
        if (!value || value === 0) return 'Branch is required';
        return undefined;
      case 'bookingDate':
        // Only required for bookings, not quotations
        if (!value && formData.requestType === 'booking') return 'Booking date is required';
        return undefined;
      case 'bookingTime':
        // Only required for bookings, not quotations
        if (!value && formData.requestType === 'booking') return 'Booking time is required';
        return undefined;
      case 'customerName':
        if (!value) return 'Customer name is required';
        return undefined;
      case 'customerEmail':
        if (!value) return 'Customer email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email format';
        return undefined;
      case 'customerPhone':
        if (!value) return 'Customer phone is required';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'branchId') {
      const selectedLocation = locations.find(loc => loc.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0,
        branchName: selectedLocation?.name || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleServiceChange = (serviceId: number) => {
    setSelectedServices(prev => {
      const newSelected = prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId];
      
      // Update the services string in formData
      const selectedServiceNames = activeServices
        .filter(service => newSelected.includes(service.id))
        .map(service => service.title)
        .join(', ');
      
      setFormData(prevData => ({
        ...prevData,
        services: selectedServiceNames
      }));

      // Clear error if services are selected
      if (newSelected.length > 0 && touched.services) {
        setErrors(prev => ({ ...prev, services: undefined }));
      }
      
      return newSelected;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBackendError(null);

    // Validate all required fields
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof BookingFormData]);
      if (error) newErrors[key as keyof FormErrors] = error;
    });

    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    // If no errors, submit
    if (Object.keys(newErrors).length === 0) {
      try {
        onSubmit(formData);
      } catch (err: any) {
        setBackendError(err?.message || 'Failed to create booking');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {backendError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{backendError}</p>
        </div>
      )}

      {/* Row 1: Car Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="carYear" className="block text-sm font-semibold text-gray-900 mb-2">Car Year</label>
          <input
            type="text"
            name="carYear"
            id="carYear"
            value={formData.carYear}
            onChange={handleChange}
            onBlur={handleBlur}
            className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
            placeholder="2023"
          />
          {errors.carYear && <FormError message={errors.carYear} />}
        </div>
        
        <div>
          <label htmlFor="carMake" className="block text-sm font-semibold text-gray-900 mb-2">Car Make</label>
          <input
            type="text"
            name="carMake"
            id="carMake"
            value={formData.carMake}
            onChange={handleChange}
            onBlur={handleBlur}
            className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
            placeholder="Toyota"
          />
          {errors.carMake && <FormError message={errors.carMake} />}
        </div>

        <div>
          <label htmlFor="carModel" className="block text-sm font-semibold text-gray-900 mb-2">Car Model</label>
          <input
            type="text"
            name="carModel"
            id="carModel"
            value={formData.carModel}
            onChange={handleChange}
            onBlur={handleBlur}
            className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
            placeholder="Camry"
          />
          {errors.carModel && <FormError message={errors.carModel} />}
        </div>
      </div>

      {/* Row 2: Request Type, Branch, Date, Time */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label htmlFor="requestType" className="block text-sm font-semibold text-gray-900 mb-2">Request Type</label>
          <select
            name="requestType"
            id="requestType"
            value={formData.requestType}
            onChange={handleChange}
            onBlur={handleBlur}
            className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
          >
            <option value="booking">Booking</option>
            <option value="quotation">Quotation</option>
          </select>
        </div>
        <div>
          <label htmlFor="branchId" className="block text-sm font-semibold text-gray-900 mb-2">Branch</label>
          <select
            name="branchId"
            id="branchId"
            value={formData.branchId}
            onChange={handleChange}
            onBlur={handleBlur}
            className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
          >
            <option value="">Select Branch</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          {errors.branchId && <FormError message={errors.branchId} />}
        </div>

        {formData.requestType === 'booking' && (
          <>
            <div>
              <label htmlFor="bookingDate" className="block text-sm font-semibold text-gray-900 mb-2">Booking Date</label>
              <input
                type="date"
                name="bookingDate"
                id="bookingDate"
                value={formData.bookingDate || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                min={new Date().toISOString().split('T')[0]}
                className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
              />
              {errors.bookingDate && <FormError message={errors.bookingDate} />}
            </div>

            <div>
              <label htmlFor="bookingTime" className="block text-sm font-semibold text-gray-900 mb-2">Booking Time</label>
              <select
                name="bookingTime"
                id="bookingTime"
                value={formData.bookingTime || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
              >
                <option value="">Select Time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.bookingTime && <FormError message={errors.bookingTime} />}
            </div>
          </>
        )}
      </div>

      {/* Services Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Services (Select one or more)</label>
        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
          {activeServices.length === 0 ? (
            <p className="text-gray-700 text-sm">No active services available</p>
          ) : (
            activeServices.map((service) => (
              <label key={service.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service.id)}
                  onChange={() => handleServiceChange(service.id)}
                  className="h-4 w-4 text-[#0a1c58] focus:ring-[#0a1c58] border-gray-300 rounded"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">{service.title}</span>
                  {service.price && (
                    <span className="text-sm text-gray-700 ml-2">${service.price}</span>
                  )}
                  {service.description && (
                    <p className="text-xs text-gray-600 mt-1">{service.description}</p>
                  )}
                </div>
              </label>
            ))
          )}
        </div>
        {errors.services && <FormError message={errors.services} />}
        {selectedServices.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            Selected: {activeServices
              .filter(service => selectedServices.includes(service.id))
              .map(service => service.title)
              .join(', ')}
          </p>
        )}
      </div>

      {/* Row 3: Customer Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="customerName" className="block text-sm font-semibold text-gray-900 mb-2">Customer Name</label>
          <input
            type="text"
            name="customerName"
            id="customerName"
            value={formData.customerName}
            onChange={handleChange}
            onBlur={handleBlur}
            className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
            placeholder="John Doe"
          />
          {errors.customerName && <FormError message={errors.customerName} />}
        </div>

        <div>
          <label htmlFor="customerEmail" className="block text-sm font-semibold text-gray-900 mb-2">Customer Email</label>
          <input
            type="email"
            name="customerEmail"
            id="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            onBlur={handleBlur}
            className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
            placeholder="john@example.com"
          />
          {errors.customerEmail && <FormError message={errors.customerEmail} />}
        </div>

        <div>
          <label htmlFor="customerPhone" className="block text-sm font-semibold text-gray-900 mb-2">Customer Phone</label>
          <input
            type="tel"
            name="customerPhone"
            id="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            onBlur={handleBlur}
            className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
            placeholder="+1-234-567-8900"
          />
          {errors.customerPhone && <FormError message={errors.customerPhone} />}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="rounded-md border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:ring-offset-2"
        >
          Cancel
        </button>
        <LoadingButton 
          type="submit" 
          isLoading={isLoading} 
          loadingText="Saving..." 
          className="rounded-md bg-[#0a1c58] px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#132b7c] hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:ring-offset-2"
        >
          {booking ? "Update" : "Save"}
        </LoadingButton>
      </div>
    </form>
  );
} 