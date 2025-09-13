"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import LogoutButton from "../LogoutButton";
import { toast } from 'react-hot-toast';
import AdminLayout from '../layout';
import { useRouter } from 'next/navigation';
import { Location } from "@/types/admin/locations";

import LocationTable from "./components/LocationTable";
import LocationForm from './components/LocationForm';
import { LocationFormData } from '@/types/admin/locations';

const SIDEBAR_ITEMS = [
  { key: "products", label: "Products/Services", href: "/admin/products" },
  { key: "services", label: "Services", href: "/admin/services" },
  { key: "locations", label: "Locations", href: "/admin/locations" },
  { key: "banners", label: "Banners", href: "/admin/banners" },
];

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState("locations");
  const [locationCards, setLocationCards] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editLocation, setEditLocation] = useState<Location | undefined>(undefined);
  const [deleteLocation, setDeleteLocation] = useState<Location | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Add search state
  const [searchTerm, setSearchTerm] = useState("");

  // Filter locations based on search term
  const filteredLocations = locationCards.filter((location) => {
    if (searchTerm.trim() === "") return true;

    const term = searchTerm.trim().toLowerCase();
    const nameMatch = location.name.toLowerCase().includes(term);
    const addressMatch = location.address.toLowerCase().includes(term);
    const phoneMatch = location.phone.toLowerCase().includes(term);

    return nameMatch || addressMatch || phoneMatch;
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/locations');
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      setLocationCards(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const item = SIDEBAR_ITEMS.find((i) => i.key === tab);
    if (item) router.push(item.href);
  };

  const handleAddLocation = () => {
    setEditLocation(undefined);
    setShowLocationForm(true);
  };

  const handleEditLocation = (location: Location) => {
    setEditLocation(location);
    setShowLocationForm(true);
  };

  const handleCancelForm = () => {
    setShowLocationForm(false);
    setEditLocation(undefined);
  };

  async function handleSubmitLocation(formData: LocationFormData) {
    if (editLocation) {
      setIsSaving(true);
      try {
        const response = await fetch(`/api/locations/${editLocation.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Failed to update location');
        const updated = await response.json();
        setLocationCards(locationCards.map(l => (l.id === editLocation.id ? updated : l)));
        toast.success('Location updated successfully');
        setShowLocationForm(false);
        setEditLocation(undefined);
      } catch (error) {
        console.error('Error updating location:', error);
        toast.error('Failed to update location');
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsSaving(true);
      try {
        const response = await fetch('/api/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Failed to create location');
        const created = await response.json();
        setLocationCards([...locationCards, created]);
        toast.success('Location created successfully');
        setShowLocationForm(false);
        setEditLocation(undefined);
      } catch (error) {
        console.error('Error creating location:', error);
        toast.error('Failed to create location');
      } finally {
        setIsSaving(false);
      }
    }
  }

  async function handleDeleteLocation() {
    if (!deleteLocation) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/locations/${deleteLocation.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete location');
      }

      setLocationCards(locationCards.filter(l => l.id !== deleteLocation.id));
      toast.success('Location deleted successfully');
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete location');
    } finally {
      setIsDeleting(false);
      setDeleteLocation(null);
    }
  }

  return (
    <div className="pb-8 px-2">
      <section className="w-full ml-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="text-3xl font-extrabold text-[#222] leading-tight tracking-tight">Location Management</div>
            <div className="text-base text-gray-700 mt-1 font-medium">Add, edit, or remove locations from your network.</div>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button
              type="button"
              onClick={handleAddLocation}
              className="bg-[#0a1c58] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#132b7c] transition text-base flex items-center gap-2 shadow-sm"
            >
              + Add Location
            </button>
          </div>
        </div>

        {/* Add search box */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4 w-full">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search locations..."
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

        {showLocationForm ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-[#0a1c58] mb-6">
              {editLocation ? 'Edit Location' : 'Add New Location'}
            </h2>
            <LocationForm
              location={editLocation}
              onSubmit={handleSubmitLocation}
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
                  <div className="min-w-max">
                    <LocationTable
                      locations={filteredLocations}
                      onEdit={handleEditLocation}
                      onDelete={id => setDeleteLocation(filteredLocations.find(l => l.id === id) || null)}
                      isDeleting={isDeleting}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {/* Delete Confirmation */}
        {deleteLocation && (
          <DeleteModal
            itemName={deleteLocation.name}
            onCancel={() => setDeleteLocation(null)}
            onConfirm={handleDeleteLocation}
            isLoading={isDeleting}
          />
        )}
      </section>
    </div>
  );
}

// Delete Modal
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
          Are you sure you want to delete <span className="font-bold">{itemName}</span>?
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