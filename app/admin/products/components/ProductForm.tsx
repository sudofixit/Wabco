"use client";

import { useState, useEffect, useRef } from "react";
import { Product, ProductFormData } from "@/types/admin/products";
import FormError from "@/app/components/ui/FormError";
import LoadingButton from "@/app/components/ui/LoadingButton";
import { Brand } from "@/types/admin/brands";

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const initialFormData: ProductFormData = {
  pattern: "",
  price: "",
  image: "",
  brandId: "",
  width: "",
  profile: "",
  diameter: "",
  loadIndex: "",
  speedRating: "",
  warranty: "",
  availability: "In Stock",
  year: "2025",
  origin: "",
  offer: false,
  offerText: "",
  description: "",
};

export default function ProductForm({
  product,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  useEffect(() => {
    async function fetchBrands() {
      setBrandsLoading(true);
      try {
        const res = await fetch("/api/brands");
        const data = await res.json();
        setBrands(data);
      } catch (e) {
        setBrands([]);
      } finally {
        setBrandsLoading(false);
      }
    }
    fetchBrands();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        pattern: product.pattern,
        price: product.price,
        image: product.image,
        brandId: product.brandId ?? "",
        width: product.width || "",
        profile: product.profile || "",
        diameter: product.diameter || "",
        loadIndex: product.loadIndex || "",
        speedRating: product.speedRating || "",
        warranty: product.warranty || "",
        availability: product.availability || "In Stock",
        year: product.year || "2025",
        origin: product.origin || "",
        offer: product.offer || false,
        offerText: product.offerText || "",
        description: product.description || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [product]);

  const validateField = (name: keyof ProductFormData, value: any): string => {
    switch (name) {
      case "pattern":
        return !value ? "Pattern is required" : "";
      case "price":
        if (!value) return "Price is required";
        const priceNum = parseFloat(value);
        return isNaN(priceNum) || priceNum <= 0 ? "Price must be greater than 0" : "";
      case "image":
        return !value ? "Image URL is required" : "";
      case "brandId":
        return !value ? "Brand is required" : "";
      case "width":
        return !value ? "Width is required" : "";
      case "warranty":
        return !value ? "Warranty is required" : "";
      case "year":
        if (!value) return "Year is required";
        const yearNum = parseInt(value);
        return isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1 ? "Invalid year" : "";
      case "origin":
        return !value ? "Origin is required" : "";
      case "offerText":
        return formData.offer && !value ? "Offer text is required when offer is enabled" : "";
      default:
        return "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    const error = validateField(name as keyof ProductFormData, newValue);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Form data being submitted:', formData);

    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};
    let hasErrors = false;

    Object.keys(formData).forEach((key) => {
      const error = validateField(key as keyof ProductFormData, formData[key as keyof ProductFormData]);
      if (error) {
        newErrors[key as keyof ProductFormData] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    console.log('Validation errors:', newErrors);
    console.log('Has errors:', hasErrors);

    if (!hasErrors) {
      console.log('Submitting form data:', formData);
      onSubmit(formData);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);

    const formDataObj = new FormData();
    formDataObj.append("file", file);

    // If we're updating an existing product and it has an image, pass the old image URL for deletion
    if (product?.image) {
      formDataObj.append("oldImageUrl", product.image);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataObj,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
        setUploading(false);
        return;
      }
      setFormData((prev) => ({
        ...prev,
        image: data.path, // Cloudinary URL
      }));
    } catch (err) {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Row 1: Tire Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Pattern - Wider field */}
        <div className="md:col-span-2">
          <label htmlFor="pattern" className="block text-sm font-semibold text-gray-900 mb-2">Pattern</label>
          <input
            type="text"
            name="pattern"
            id="pattern"
            value={formData.pattern}
            onChange={handleChange}
            className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
          />
          {errors.pattern && <FormError message={errors.pattern} />}
        </div>

        {/* Width - Smaller field */}
        <div>
          <label htmlFor="width" className="block text-sm font-semibold text-gray-900 mb-2">Width</label>
          <input
            type="text"
            name="width"
            id="width"
            value={formData.width}
            onChange={handleChange}
            className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
          />
          {errors.width && <FormError message={errors.width} />}
        </div>

        {/* Profile - Smaller field */}
        <div>
          <label htmlFor="profile" className="block text-sm font-semibold text-gray-900 mb-2">Profile</label>
          <input
            type="text"
            name="profile"
            id="profile"
            value={formData.profile}
            onChange={handleChange}
            className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
          />
          {errors.profile && <FormError message={errors.profile} />}
        </div>

        {/* Diameter - Smaller field */}
        <div>
          <label htmlFor="diameter" className="block text-sm font-semibold text-gray-900 mb-2">Diameter</label>
          <input
            type="text"
            name="diameter"
            id="diameter"
            value={formData.diameter}
            onChange={handleChange}
            className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
          />
          {errors.diameter && <FormError message={errors.diameter} />}
        </div>

        {/* Load Index - Smaller field */}
        <div>
          <label htmlFor="loadIndex" className="block text-sm font-semibold text-gray-900 mb-2">Load Index</label>
          <input
            type="text"
            name="loadIndex"
            id="loadIndex"
            value={formData.loadIndex}
            onChange={handleChange}
            className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
          />
          {errors.loadIndex && <FormError message={errors.loadIndex} />}
        </div>

        {/* Speed Rating - Smaller field */}
        <div>
          <label htmlFor="speedRating" className="block text-sm font-semibold text-gray-900 mb-2">Speed Rating</label>
          <input
            type="text"
            name="speedRating"
            id="speedRating"
            value={formData.speedRating}
            onChange={handleChange}
            className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
          />
          {errors.speedRating && <FormError message={errors.speedRating} />}
        </div>
      </div>

      {/* Row 2: Brand, Warranty, Price */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Brand */}
        <div>
          <label htmlFor="brandId" className="block text-sm font-semibold text-gray-900 mb-2">Brand</label>
          <select
            name="brandId"
            id="brandId"
            value={formData.brandId ?? ""}
            onChange={handleChange}
            className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
            disabled={brandsLoading}
          >
            <option value="">Select a brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          {errors.brandId && <FormError message={errors.brandId} />}
        </div>

        {/* Warranty */}
        <div>
          <label htmlFor="warranty" className="block text-sm font-semibold text-gray-900 mb-2">Warranty</label>
          <input
            type="text"
            name="warranty"
            id="warranty"
            value={formData.warranty}
            onChange={handleChange}
            className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
          />
          {errors.warranty && <FormError message={errors.warranty} />}
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-semibold text-gray-900 mb-2">Price</label>
          <input
            type="text"
            name="price"
            id="price"
            value={formData.price}
            onChange={handleChange}
            className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900"
          />
          {errors.price && <FormError message={errors.price} />}
        </div>
      </div>

      {/* Row 3+: Keep existing layout exactly as is */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Year */}
        <div>
          <label htmlFor="year" className="block text-sm font-semibold text-gray-900 mb-2">Year</label>
          <input type="text" name="year" id="year" value={formData.year} onChange={handleChange} className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900" />
          {errors.year && <FormError message={errors.year} />}
        </div>

        {/* Origin */}
        <div>
          <label htmlFor="origin" className="block text-sm font-semibold text-gray-900 mb-2">Origin</label>
          <input type="text" name="origin" id="origin" value={formData.origin} onChange={handleChange} className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900" />
          {errors.origin && <FormError message={errors.origin} />}
        </div>

        {/* Availability */}
        <div>
          <label htmlFor="availability" className="block text-sm font-semibold text-gray-900 mb-2">Availability</label>
          <select name="availability" id="availability" value={formData.availability} onChange={handleChange} className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900">
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Contact Us">Contact Us</option>
          </select>
        </div>
      </div>

      {/* Special Offer */}
      <div className="flex items-center">
        <input type="checkbox" name="offer" id="offer" checked={formData.offer} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-[#0a1c58] focus:ring-[#0a1c58]" />
        <div className="ml-3">
          <label htmlFor="offer" className="block text-sm font-semibold text-gray-900">Special Offer</label>
          <p className="text-xs text-gray-500">Mark this product for special promotions</p>
        </div>
      </div>

      {formData.offer && (
        <div>
          <label htmlFor="offerText" className="block text-sm font-semibold text-gray-900 mb-2">Offer Text</label>
          <input type="text" name="offerText" id="offerText" value={formData.offerText} onChange={handleChange} className="block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] text-gray-900" />
          {errors.offerText && <FormError message={errors.offerText} />}
        </div>
      )}

      {/* Image upload - Keep exactly as is */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Product Image</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#0a1c58]" onClick={() => fileInputRef.current?.click()}>
          {uploading ? (
            <p className="text-sm text-blue-600">Uploading...</p>
          ) : formData.image ? (
            <img src={formData.image} alt="Product" className="object-cover rounded w-[153px] h-[168px] border border-gray-200" />
          ) : (
            <>
              <svg className="text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              <p className="mt-2 text-sm text-gray-600">Upload a file or drag and drop</p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </>
          )}
        </div>
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        {uploadError && <p className="mt-1 text-sm text-red-600">{uploadError}</p>}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:ring-offset-2">Cancel</button>
        <LoadingButton type="submit" isLoading={isLoading} loadingText="Saving..." className="rounded-md bg-[#0a1c58] px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#132b7c] hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:ring-offset-2">{product ? "Update" : "Save"}</LoadingButton>
      </div>
    </form>
  );
} 
