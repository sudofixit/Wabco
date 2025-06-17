"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import LogoutButton from "../LogoutButton";
import { toast } from 'react-hot-toast';
import AdminLayout from '../layout';
import { useRouter } from 'next/navigation';
import ServiceForm from './components/ServiceForm';
import { ServiceFormData } from "@/types/admin/services";

interface ServiceCard {
  id: number;
  title: string;
  description: string;
  image: string;
  price: number;
  isActive: boolean;
}

const SIDEBAR_ITEMS = [
  { key: "products", label: "Products/Services", href: "/admin/products" },
  { key: "services", label: "Services", href: "/admin/services" },
  { key: "locations", label: "Locations", href: "/admin/locations" },
  { key: "banners", label: "Banners", href: "/admin/banners" },
];

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState("services");
  const [serviceCards, setServiceCards] = useState<ServiceCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editService, setEditService] = useState<ServiceCard | undefined>(undefined);
  const [deleteService, setDeleteService] = useState<ServiceCard | null>(null);
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
    const priceMatch = service.price.toString().includes(term);
    
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

  const handleEditService = (service: ServiceCard) => {
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

  async function handleDeleteService() {
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
    <div className="pb-8 px-2">
      <section className="w-full ml-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="text-3xl font-extrabold text-[#222] leading-tight tracking-tight">Service Management</div>
            <div className="text-base text-gray-700 mt-1 font-medium">Add, edit, or remove services from your catalog.</div>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button
              type="button"
              onClick={handleAddService}
              className="bg-[#0a1c58] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#132b7c] transition text-base flex items-center gap-2 shadow-sm"
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
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            {searchTerm && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            )}
          </div>
        </div>

        {showServiceForm ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-[#0a1c58] mb-6">
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
          <div className="overflow-x-auto w-full min-w-[700px]">
            <div className="shadow-md rounded-lg bg-white">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <table className="min-w-full w-full text-left rounded-lg overflow-hidden">
                  <thead>
                    <tr className="text-[#222] font-medium text-base border-b bg-[#f9fafb] rounded-t-lg">
                      <th className="py-3 pl-6 pr-4">Image</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 pr-6 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.map((card, idx) => (
                      <tr key={card.id} className={`border-b last:border-0 hover:bg-gray-50 transition text-base ${idx === 0 ? 'rounded-t-lg' : ''} ${idx === serviceCards.length-1 ? 'rounded-b-lg' : ''}`}> 
                        <td className="py-3 pl-6 pr-4 align-middle">
                          <img src={card.image} alt={card.title} className="w-12 h-12 object-cover rounded-lg" />
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#222] align-middle break-words whitespace-normal text-base" style={{fontSize:'14px', fontWeight:600, lineHeight:'1.3'}}>{card.title}</td>
                        <td className="py-3 px-4 text-gray-700 font-medium text-sm align-middle break-words whitespace-normal">{card.description}</td>
                        <td className="py-3 px-4 text-gray-700 font-medium text-sm align-middle whitespace-nowrap">${card.price}</td>
                        <td className="py-3 px-4 align-middle">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            card.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {card.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 pr-6 pl-4 text-right align-middle">
                          <div className="flex gap-2 justify-end">
                            <button className="hover:bg-gray-100 p-2 rounded-full transition" onClick={() => handleEditService(card)} title="Edit">
                              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.94l-4.243 1.415 1.415-4.243a4 4 0 01.94-1.414z" stroke="#0a1c58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                            <button className="hover:bg-gray-100 p-2 rounded-full transition" onClick={() => setDeleteService(card)} title="Delete">
                              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 7V5a2 2 0 00-2-2H7a2 2 0 00-2 2v2m5 4v6m4-6v6" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteService && (
          <DeleteModal
            itemName={deleteService.title}
            onCancel={() => setDeleteService(null)}
            onConfirm={handleDeleteService}
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