"use client";

import { useState, useRef } from "react";
import { Location } from "@/types/admin/locations";
import LoadingButton from "@/app/components/ui/LoadingButton";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface LocationFormProps {
  location?: Location;
  onSubmit: (data: FormData) => Promise<void>;
}

interface FormData {
  name: string;
  address: string;
  phone: string;
  image: string;
  subdomain?: string;
  workingHours: string;
  lat: string;
  lng: string;
}

export default function LocationForm({ location, onSubmit }: LocationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: location?.name || "",
    address: location?.address || "",
    phone: location?.phone || "",
    image: location?.image || "",
    subdomain: location?.subdomain || "",
    workingHours: location?.workingHours || "",
    lat: location?.lat?.toString() || "",
    lng: location?.lng?.toString() || "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(location?.image || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCoordinates = (lat: string, lng: string): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (lat && (isNaN(parseFloat(lat)) || parseFloat(lat) < -90 || parseFloat(lat) > 90)) {
      newErrors.lat = 'Latitude must be between -90 and 90';
    }

    if (lng && (isNaN(parseFloat(lng)) || parseFloat(lng) < -180 || parseFloat(lng) > 180)) {
      newErrors.lng = 'Longitude must be between -180 and 180';
    }

    return newErrors;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Validate coordinates in real-time
    if (name === 'lat' || name === 'lng') {
      const latValue = name === 'lat' ? value : formData.lat;
      const lngValue = name === 'lng' ? value : formData.lng;
      const coordErrors = validateCoordinates(latValue, lngValue);
      setErrors(prev => ({ ...prev, ...coordErrors }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate coordinates before submitting
    const coordErrors = validateCoordinates(formData.lat, formData.lng);
    if (Object.keys(coordErrors).length > 0) {
      setErrors(coordErrors);
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
      router.push("/admin/locations");
      router.refresh();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      // If we're updating an existing location and it has an image, pass the old image URL for deletion
      if (location?.image) {
        uploadFormData.append('oldImageUrl', location.image);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        const imagePath = data.path;
        setImagePreview(imagePath);
        setFormData(prev => ({ ...prev, image: imagePath }));
        console.log('Image uploaded successfully:', imagePath);
      } else {
        const err = await response.json();
        console.error('Failed to upload file', err);
        alert('Failed to upload image. ' + (err?.error || 'Please try again.'));
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Location Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0a1c58] focus:border-[#0a1c58] text-gray-900"
          />
        </div>

        <div>
          <label
            htmlFor="subdomain"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Subdomain
          </label>
          <input
            type="text"
            id="subdomain"
            name="subdomain"
            value={formData.subdomain}
            onChange={handleInputChange}
            placeholder="e.g., abu-dhabi"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0a1c58] focus:border-[#0a1c58] text-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">This will create a subdomain like https://wabco.com/abu-dhabi</p>
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0a1c58] focus:border-[#0a1c58] text-gray-900"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0a1c58] focus:border-[#0a1c58] text-gray-900"
          />
        </div>

        <div>
          <label
            htmlFor="workingHours"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Working Hours
          </label>
          <input
            type="text"
            id="workingHours"
            name="workingHours"
            value={formData.workingHours}
            onChange={handleInputChange}
            placeholder="e.g., Monday – Saturday: 9:00 AM – 8:00 PM"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0a1c58] focus:border-[#0a1c58] text-gray-900"
          />
        </div>

        <div>
          <label
            htmlFor="lat"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Latitude
          </label>
          <input
            type="number"
            id="lat"
            name="lat"
            value={formData.lat}
            onChange={handleInputChange}
            step="any"
            min="-90"
            max="90"
            placeholder="e.g., 25.204800"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0a1c58] focus:border-[#0a1c58] text-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">Paste coordinates from Google Maps (-90 to 90)</p>
        </div>

        <div>
          <label
            htmlFor="lng"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Longitude
          </label>
          <input
            type="number"
            id="lng"
            name="lng"
            value={formData.lng}
            onChange={handleInputChange}
            step="any"
            min="-180"
            max="180"
            placeholder="e.g., 55.270800"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0a1c58] focus:border-[#0a1c58] text-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">Paste coordinates from Google Maps (-180 to 180)</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Location Image</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-4 border-gray-300 border-dashed rounded-lg hover:border-[#0a1c58] hover:bg-gray-50 transition-all duration-300 shadow-lg">
          <div className="space-y-1 text-center">
            {isUploadingImage ? (
              <div className="mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#0a1c58] mx-auto"></div>
                <p className="mt-2 text-sm font-semibold text-[#0a1c58]">Uploading...</p>
              </div>
            ) : imagePreview ? (
              <div className="mb-4">
                <img
                  src={imagePreview.startsWith('http') ? imagePreview : (imagePreview.startsWith('/') ? imagePreview : `/${imagePreview}`)}
                  alt="Location preview"
                  className="mx-auto h-[180px] w-[180px] object-cover rounded-lg border-4 border-gray-300 shadow-md"
                  onError={(e) => {
                    console.error('Image failed to load:', imagePreview);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <div className="flex text-base text-gray-700 font-semibold">
              <label
                htmlFor="image-upload"
                className="relative cursor-pointer bg-[#0a1c58] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#132b7c] focus-within:outline-none focus-within:ring-4 focus-within:ring-[#0a1c58] focus-within:ring-opacity-50 transition-all duration-200 shadow-xl border-2 border-[#0a1c58] hover:shadow-2xl transform hover:scale-105"
              >
                <span>{isUploadingImage ? 'Uploading...' : 'Choose File'}</span>
                <input
                  id="image-upload"
                  name="image-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  disabled={isUploadingImage}
                />
              </label>
              <p className="pl-3 self-center">or drag and drop</p>
            </div>
            <p className="text-sm text-gray-600 font-medium">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a1c58]"
        >
          Cancel
        </button>
        <LoadingButton
          type="submit"
          isLoading={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-[#0a1c58] border border-transparent rounded-md shadow-sm hover:bg-[#0a1c58]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a1c58]"
        >
          {location ? "Update Location" : "Create Location"}
        </LoadingButton>
      </div>
    </form>
  );
}