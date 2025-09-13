"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import LogoutButton from "../LogoutButton";
import { toast } from 'react-hot-toast';
import AdminLayout from '../layout';
import { useRouter } from 'next/navigation';
import ServiceForm from './components/ServiceForm';
import ServiceTable from './components/ServiceTable';
import { ServiceFormData, Service } from "@/types/admin/services";

const SIDEBAR_ITEMS = [
  { key: "products", label: "Products/Services", href: "/admin/products" },
  { key: "services", label: "Services", href: "/admin/services" },
  { key: "locations", label: "Locations", href: "/admin/locations" },
  { key: "banners", label: "Banners", href: "/admin/banners" },
];

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState("services");
  const [serviceCards, setServiceCards] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editService, setEditService] = useState<Service | undefined>(undefined);
  const [deleteService, setDeleteService] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Add search state
  const [searchTerm, setSearchTerm] = useState("");

  // Filter services based on search term
  const filteredServices = serviceCards.filter((service) => {
    if (searchTerm.trim() === "") return true;

    const term = searchTerm.trim().toLowerCase();
    const titleMatch = service.title.toLowerCase().includes(term);
    const descriptionMatch = service.description.toLowerCase().includes(term);
    const priceMatch = (service.price ?? 0).toString().includes(term);

    return titleMatch || descriptionMatch || priceMatch;
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServiceCards(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const item = SIDEBAR_ITEMS.find((i) => i.key === tab);
    if (item) router.push(item.href);
  };

  const handleAddService = () => {
    setEditService(undefined);
    setShowServiceForm(true);
  };

  const handleEditService = (service: Service) => {
    setEditService(service);
    setShowServiceForm(true);
  };

  const handleCancelForm = () => {
    setShowServiceForm(false);
    setEditService(undefined);
  };

  async function handleSubmitService(formData: ServiceFormData) {
    if (editService) {
      setIsSaving(true);
      try {
        const response = await fetch(`/api/services/${editService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            image: formData.image,
            price: formData.price,
            isActive: formData.isActive ?? true,
          }),
        });
        if (!response.ok) throw new Error('Failed to update service');
        const updated = await response.json();
        setServiceCards(serviceCards.map(s => (s.id === editService.id ? updated : s)));
        toast.success('Service updated successfully');
        setShowServiceForm(false);
        setEditService(undefined);
      } catch (error) {
        console.error('Error updating service:', error);
        toast.error('Failed to update service');
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsSaving(true);
      try {
        const response = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            image: formData.image,
            price: formData.price,
            isActive: formData.isActive ?? true,
          }),
        });
        if (!response.ok) throw new Error('Failed to create service');
        const created = await response.json();
        setServiceCards([...serviceCards, created]);
        toast.success('Service created successfully');
        setShowServiceForm(false);
        setEditService(undefined);
      } catch (error) {
        console.error('Error creating service:', error);
        toast.error('Failed to create service');
      } finally {
        setIsSaving(false);
      }
    }
  }

  async function handleDeleteService(serviceId: number) {
    const service = serviceCards.find(s => s.id === serviceId);
    if (!service) return;
    setDeleteService(service);
  }

  async function handleConfirmDelete() {
    if (!deleteService) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/services/${deleteService.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete service');
      setServiceCards(serviceCards.filter(s => s.id !== deleteService.id));
      toast.success('Service deleted successfully');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    } finally {
      setIsDeleting(false);
      setDeleteService(null);
    }
  }

  return (
    <div className="pb-8 px-2 md:px-4">
      <section className="w-full ml-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-[#222] leading-tight tracking-tight">Service Management</div>
            <div className="text-sm md:text-base text-gray-700 mt-1 font-medium">Add, edit, or remove services from your catalog.</div>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button
              type="button"
              onClick={handleAddService}
              className="bg-[#0a1c58] text-white px-4 py-2 md:px-6 md:py-2 rounded-lg font-semibold hover:bg-[#132b7c] transition text-sm md:text-base flex items-center gap-2 shadow-sm"
            >
              + Add Service
            </button>
          </div>
        </div>

        {/* Add search box */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4 w-full">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search services..."
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

        {showServiceForm ? (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-extrabold text-[#222] mb-6">
              {editService ? 'Edit Service' : 'Add New Service'}
            </h2>
            <ServiceForm
              service={editService}
              onSubmit={handleSubmitService}
              onCancel={handleCancelForm}
              isLoading={isSaving}
            />
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="shadow-md rounded-lg bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <ServiceTable
                    services={filteredServices}
                    onEdit={handleEditService}
                    onDelete={handleDeleteService}
                    isDeleting={isDeleting}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteService && (
          <DeleteModal
            itemName={deleteService.title}
            onCancel={() => setDeleteService(null)}
            onConfirm={handleConfirmDelete}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col items-center pointer-events-auto border border-gray-200">
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