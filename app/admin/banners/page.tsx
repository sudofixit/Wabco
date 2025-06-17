"use client";

import { useState, useEffect } from "react";
import { Banner, BannerFormData } from "@/types/admin/banners";
import { banners as initialBanners } from "@/data/banners";
import BannerTable from "./components/BannerTable";
import BannerForm from "./components/BannerForm";
import { useToast } from "@/app/components/ui/Toast";
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const SIDEBAR_ITEMS = [
  { key: "products", label: "Products/Services", href: "/admin/products" },
  { key: "services", label: "Services", href: "/admin/services" },
  { key: "bookings", label: "Bookings", href: "/admin/bookings" },
  { key: "locations", label: "Locations", href: "/admin/locations" },
  { key: "banners", label: "Banners", href: "/admin/banners" },
];

export default function BannersPage() {
  const [activeTab, setActiveTab] = useState("banners");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | undefined>(undefined);
  const [deleteBanner, setDeleteBanner] = useState<Banner | null>(null);
  const router = useRouter();

  // Add search state
  const [searchTerm, setSearchTerm] = useState("");

  // Filter banners based on search term
  const filteredBanners = banners.filter((banner) => {
    if (searchTerm.trim() === "") return true;
    
    const term = searchTerm.trim().toLowerCase();
    const titleMatch = banner.title.toLowerCase().includes(term);
    const linkMatch = banner.link.toLowerCase().includes(term);
    
    return titleMatch || linkMatch;
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/banners');
      if (!response.ok) throw new Error('Failed to fetch banners');
      const data = await response.json();
      setBanners(data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to load banners');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const item = SIDEBAR_ITEMS.find((i) => i.key === tab);
    if (item) router.push(item.href);
  };

  const handleAddBanner = () => {
    setEditBanner(undefined);
    setShowBannerForm(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditBanner(banner);
    setShowBannerForm(true);
  };

  const handleCancelForm = () => {
    setShowBannerForm(false);
    setEditBanner(undefined);
  };

  async function handleSubmitBanner(formData: BannerFormData) {
    if (editBanner) {
      setIsSaving(true);
      try {
        const response = await fetch(`/api/banners/${editBanner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Failed to update banner');
        const updated = await response.json();
        setBanners(banners.map(b => (b.id === editBanner.id ? updated : b)));
        toast.success('Banner updated successfully');
        setShowBannerForm(false);
        setEditBanner(undefined);
      } catch (error) {
        console.error('Error updating banner:', error);
        toast.error('Failed to update banner');
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsSaving(true);
      try {
        const response = await fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Failed to create banner');
        const created = await response.json();
        setBanners([...banners, created]);
        toast.success('Banner created successfully');
        setShowBannerForm(false);
        setEditBanner(undefined);
      } catch (error) {
        console.error('Error creating banner:', error);
        toast.error('Failed to create banner');
      } finally {
        setIsSaving(false);
      }
    }
  }

  async function handleDeleteBanner() {
    if (!deleteBanner) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/banners/${deleteBanner.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete banner');
      setBanners(banners.filter(b => b.id !== deleteBanner.id));
      toast.success('Banner deleted successfully');
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    } finally {
      setIsDeleting(false);
      setDeleteBanner(null);
    }
  }

  return (
    <div className="pt-24 pb-8 px-2">
      <section className="w-full ml-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="text-3xl font-extrabold text-[#222] leading-tight tracking-tight">Banner Management</div>
            <div className="text-base text-gray-700 mt-1 font-medium">Add, edit, or remove banners from your homepage.</div>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button
              type="button"
              onClick={handleAddBanner}
              className="bg-[#0a1c58] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#132b7c] transition text-base flex items-center gap-2 shadow-sm"
            >
              + Add Banner
            </button>
          </div>
        </div>

        {/* Add search box */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4 w-full">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search banners..."
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

        {showBannerForm ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-[#0a1c58] mb-6">
              {editBanner ? 'Edit Banner' : 'Add New Banner'}
            </h2>
            <BannerForm
              banner={editBanner}
              onSubmit={handleSubmitBanner}
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
                <BannerTable
                  banners={filteredBanners}
                  onEdit={handleEditBanner}
                  onDelete={id => setDeleteBanner(filteredBanners.find(b => b.id === id) || null)}
                  isDeleting={isDeleting}
                />
              )}
            </div>
          </div>
        )}
        {/* Delete Confirmation */}
        {deleteBanner && (
          <DeleteModal
            itemName={deleteBanner.title}
            onCancel={() => setDeleteBanner(null)}
            onConfirm={handleDeleteBanner}
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