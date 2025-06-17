import { Brand, BrandFormData } from "@/types/admin/brands";
import { useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface BrandFormProps {
  brand?: Brand;
  onSubmit: (data: BrandFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function BrandForm({
  brand,
  onSubmit,
  onCancel,
  isLoading = false,
}: BrandFormProps) {
  const [name, setName] = useState(brand?.name || "");
  const [logo, setLogo] = useState(brand?.logo || "");
  const [logoPreview, setLogoPreview] = useState(brand?.logo || "");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Brand name is required");
      return;
    }

    if (!logo) {
      setError("Brand logo is required");
      return;
    }

    onSubmit({ name, logo });
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant preview
    const tempUrl = URL.createObjectURL(file);
    setLogoPreview(tempUrl);

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      // Use the returned path for the logo
      setLogo(data.path);
      setLogoPreview(data.path);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Brand Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-[#f7f7f7] focus:outline-none text-base font-normal text-gray-700 shadow-sm"
            placeholder="Enter brand name"
          />
        </div>

        <div>
          <label
            htmlFor="logo"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Brand Logo
          </label>
          <div className="mt-1 flex items-center gap-4">
            <input
              type="file"
              id="logo"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <label
              htmlFor="logo"
              className="cursor-pointer bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a1c58] shadow-sm"
            >
              Choose File
            </label>
            {logoPreview && (
              <div className="relative h-12 w-12">
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  fill
                  className="object-contain rounded"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a1c58] shadow-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-[#0a1c58] rounded-lg hover:bg-[#132b7c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a1c58] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : brand ? "Update Brand" : "Create Brand"}
        </button>
      </div>
    </form>
  );
} 