"use client";

import { useState, useEffect } from "react";
import { Brand, BrandFormData } from "@/types/admin/brands";
import BrandTable from "./components/BrandTable";
import BrandForm from "./components/BrandForm";
import { toast } from "react-hot-toast";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | undefined>();
  const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/brands");
      if (!response.ok) throw new Error("Failed to fetch brands");
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Failed to load brands");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBrand = () => {
    setEditBrand(undefined);
    setShowBrandForm(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditBrand(brand);
    setShowBrandForm(true);
  };

  const handleCancelForm = () => {
    setShowBrandForm(false);
    setEditBrand(undefined);
  };

  async function handleSubmitBrand(formData: BrandFormData) {
    if (editBrand) {
      setIsSaving(true);
      try {
        const response = await fetch(`/api/brands/${editBrand.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Failed to update brand');
        const updated = await response.json();
        setBrands(brands.map(b => (b.id === editBrand.id ? updated : b)));
        toast.success('Brand updated successfully');
        setShowBrandForm(false);
        setEditBrand(undefined);
      } catch (error) {
        console.error('Error updating brand:', error);
        toast.error('Failed to update brand');
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsSaving(true);
      try {
        const response = await fetch('/api/brands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Failed to create brand');
        const created = await response.json();
        setBrands([...brands, created]);
        toast.success('Brand created successfully');
        setShowBrandForm(false);
        setEditBrand(undefined);
      } catch (error) {
        console.error('Error creating brand:', error);
        toast.error('Failed to create brand');
      } finally {
        setIsSaving(false);
      }
    }
  }

  async function handleDeleteBrand() {
    if (!deleteBrand) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/brands/${deleteBrand.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete brand");
      setBrands(brands.filter(b => b.id !== deleteBrand.id));
      toast.success("Brand deleted successfully");
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast.error("Failed to delete brand");
    } finally {
      setIsDeleting(false);
      setDeleteBrand(null);
    }
  }

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-10 pb-8 px-2">
      <section className="w-full ml-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="text-3xl font-extrabold text-[#222] leading-tight tracking-tight">Brand Management</div>
            <div className="text-base text-gray-700 mt-1 font-medium">Add, edit, or remove brands from your catalog.</div>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button
              type="button"
              onClick={handleAddBrand}
              className="bg-[#0a1c58] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#132b7c] transition text-base flex items-center gap-2 shadow-sm"
            >
              + Add Brand
            </button>
          </div>
        </div>

        {/* Add search box */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4 w-full">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search brands..."
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

        {showBrandForm ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-[#0a1c58] mb-6">
              {editBrand ? 'Edit Brand' : 'Add New Brand'}
            </h2>
            <BrandForm
              brand={editBrand}
              onSubmit={handleSubmitBrand}
              onCancel={handleCancelForm}
              isLoading={isSaving}
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
                    <BrandTable
                      brands={filteredBrands}
                      onEdit={handleEditBrand}
                      onDelete={id => setDeleteBrand(brands.find(b => b.id === id) || null)}
                      isDeleting={isDeleting}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation */}
        {deleteBrand && (
          <DeleteModal
            itemName={deleteBrand.name}
            onCancel={() => setDeleteBrand(null)}
            onConfirm={handleDeleteBrand}
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