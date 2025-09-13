"use client";
import { useState, useEffect } from "react";
import { Booking, BookingFormData } from "@/types/admin/booking";
import { Location } from "@/types/admin/location";
import { Service } from "@/types/admin/services";
import BookingForm from "./components/BookingForm";
import BookingTable from "./components/BookingTable";
import { toast } from 'react-hot-toast';

// Delete Modal (copied from ServicesPage)
interface DeleteModalProps {
  itemName: string;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

function DeleteModal({ itemName, onCancel, onConfirm, isLoading }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center pointer-events-auto border border-gray-200">
        <div className="text-xl font-bold text-gray-900 mb-4">Delete Confirmation</div>
        <div className="mb-6 text-center text-gray-900 font-semibold">
          Are you sure you want to delete the booking for <span className="font-bold">{itemName}</span>?
        </div>
        <div className="flex gap-4 w-full">
          <button
            className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
          <button
            className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | undefined>(undefined);
  const [deleteBooking, setDeleteBooking] = useState<Booking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Filter bookings based on search term
  const filteredBookings = bookings.filter((booking) => {
    if (searchTerm.trim() === "") return true;

    const term = searchTerm.trim().toLowerCase();
    const customerMatch = booking.customerName.toLowerCase().includes(term);
    const emailMatch = booking.customerEmail.toLowerCase().includes(term);
    const phoneMatch = booking.customerPhone.toLowerCase().includes(term);
    const carMatch = `${booking.carYear} ${booking.carMake} ${booking.carModel}`.toLowerCase().includes(term);
    const servicesMatch = booking.services.toLowerCase().includes(term);
    const branchMatch = booking.branchName.toLowerCase().includes(term);

    return customerMatch || emailMatch || phoneMatch || carMatch || servicesMatch || branchMatch;
  });

  useEffect(() => {
    fetchBookings();
    fetchLocations();
    fetchServices();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    }
  };

  const handleAddBooking = () => {
    setEditBooking(undefined);
    setShowBookingForm(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditBooking(booking);
    setShowBookingForm(true);
  };

  const handleCancelForm = () => {
    setShowBookingForm(false);
    setEditBooking(undefined);
  };

  async function handleSubmitBooking(formData: BookingFormData) {
    if (editBooking) {
      // Update existing booking
      setIsSaving(true);
      try {
        const response = await fetch(`/api/bookings/${editBooking.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            carYear: formData.carYear,
            carMake: formData.carMake,
            carModel: formData.carModel,
            services: formData.services,
            branchId: formData.branchId,
            branchName: formData.branchName,
            bookingDate: formData.bookingDate,
            bookingTime: formData.bookingTime,
            customerName: formData.customerName,
            customerEmail: formData.customerEmail,
            customerPhone: formData.customerPhone,
            requestType: formData.requestType
          }),
        });
        if (!response.ok) throw new Error('Failed to update booking');
        const updatedBooking = await response.json();
        setBookings(bookings.map(b => (b.id === editBooking.id ? updatedBooking : b)));
        toast.success('Booking updated successfully');
        setShowBookingForm(false);
        setEditBooking(undefined);
      } catch (error) {
        console.error('Error updating booking:', error);
        toast.error('Failed to update booking');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Create new booking
      setIsSaving(true);
      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            carYear: formData.carYear,
            carMake: formData.carMake,
            carModel: formData.carModel,
            services: formData.services,
            branchId: formData.branchId,
            branchName: formData.branchName,
            bookingDate: formData.bookingDate,
            bookingTime: formData.bookingTime,
            customerName: formData.customerName,
            customerEmail: formData.customerEmail,
            customerPhone: formData.customerPhone,
            requestType: formData.requestType
          }),
        });
        if (!response.ok) throw new Error('Failed to create booking');
        const newBooking = await response.json();
        setBookings([...bookings, newBooking]);
        toast.success('Booking created successfully');
        setShowBookingForm(false);
        setEditBooking(undefined);
      } catch (error) {
        console.error('Error creating booking:', error);
        toast.error('Failed to create booking');
      } finally {
        setIsSaving(false);
      }
    }
  }

  const handleDelete = (booking: Booking) => {
    setDeleteBooking(booking);
  };

  async function handleConfirmDelete() {
    if (!deleteBooking) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/bookings/${deleteBooking.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete booking');
      setBookings(bookings.filter(b => b.id !== deleteBooking.id));
      toast.success('Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    } finally {
      setIsDeleting(false);
      setDeleteBooking(null);
    }
  }

  const handleToggleStatus = async (booking: Booking) => {
    setIsTogglingStatus(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/toggle-status`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to toggle booking status');
      const updatedBooking = await response.json();
      setBookings(bookings.map(b => (b.id === booking.id ? updatedBooking : b)));
      toast.success(`Booking ${updatedBooking.isActive ? 'activated' : 'cancelled'} successfully`);
    } catch (error) {
      console.error('Error toggling booking status:', error);
      toast.error('Failed to toggle booking status');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <div className="pb-8 px-2">
      <section className="w-full ml-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="text-3xl font-extrabold text-[#222] leading-tight tracking-tight">Booking Management</div>
            <div className="text-base text-gray-700 mt-1 font-medium">Add, edit, or remove customer bookings and appointments.</div>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button
              type="button"
              onClick={handleAddBooking}
              className="bg-[#0a1c58] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#132b7c] transition text-base flex items-center gap-2 shadow-sm"
            >
              + Add Booking
            </button>
          </div>
        </div>

        {/* Search Box */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4 w-full">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search bookings..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-[#f7f7f7] focus:outline-none text-base font-normal text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            {searchTerm && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            )}
          </div>
        </div>

        {showBookingForm ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-[#0a1c58] mb-6">
              {editBooking ? 'Edit Booking' : 'Add New Booking'}
            </h2>
            <BookingForm
              booking={editBooking}
              onSubmit={handleSubmitBooking}
              onCancel={handleCancelForm}
              isLoading={isSaving}
              locations={locations}
              services={services}
            />
          </div>
        ) : (
          <>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="shadow-md rounded-lg bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="min-w-[1000px]">
                    <BookingTable
                      bookings={filteredBookings}
                      onEdit={handleEditBooking}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                      isDeleting={isDeleting}
                      isTogglingStatus={isTogglingStatus}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation */}
        {deleteBooking && (
          <DeleteModal
            itemName={deleteBooking.customerName}
            onCancel={() => setDeleteBooking(null)}
            onConfirm={handleConfirmDelete}
            isLoading={isDeleting}
          />
        )}
      </section>
    </div>
  );
} 