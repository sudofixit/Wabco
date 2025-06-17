"use client";

import { useState, useEffect } from "react";
import { Banner, BannerFormData } from "@/types/admin/banners";
import FormError from "@/app/components/ui/FormError";
import LoadingButton from "@/app/components/ui/LoadingButton";

interface BannerFormProps {
  banner?: Banner;
  onSubmit: (data: BannerFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const initialFormData: BannerFormData = {
  title: "",
  image: "",
  link: "",
};

export default function BannerForm({
  banner,
  onSubmit,
  onCancel,
  isLoading = false,
}: BannerFormProps) {
  const [formData, setFormData] = useState<BannerFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof BannerFormData, string>>>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title,
        image: banner.image,
        link: banner.link,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [banner]);

  const validateField = (name: keyof BannerFormData, value: any): string => {
    switch (name) {
      case "title":
        if (!value) return "Title is required";
        if (value.length < 3) return "Title must be at least 3 characters";
        return "";
      case "image":
        if (!value) return "Image URL is required";
        if (!/^(https?:\/\/|\/)[\w\-._~:/?#[\]@!$&'()*+,;=]+$/.test(value)) {
          return "Please enter a valid URL";
        }
        return "";
      case "link":
        if (!value) return "Link is required";
        if (!/^(https?:\/\/|\/)[\w\-._~:/?#[\]@!$&'()*+,;=]+$/.test(value)) {
          return "Please enter a valid URL";
        }
        return "";
      default:
        return "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    const error = validateField(name as keyof BannerFormData, newValue);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({ ...prev, image: data.path }));
          console.log('Image uploaded successfully:', data.path);
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
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBackendError(null);
    const newErrors: Partial<Record<keyof BannerFormData, string>> = {};
    let hasErrors = false;
    Object.keys(formData).forEach((key) => {
      const error = validateField(key as keyof BannerFormData, formData[key as keyof BannerFormData]);
      if (error) {
        newErrors[key as keyof BannerFormData] = error;
        hasErrors = true;
      }
    });
    setErrors(newErrors);
    if (!hasErrors) {
      try {
        onSubmit(formData);
      } catch (err: any) {
        setBackendError(err?.message || 'Failed to save banner');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">Title</label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            className="block w-full px-4 py-3 text-base rounded-lg border-2 border-gray-300 shadow-2xl focus:border-[#0a1c58] focus:ring-[#0a1c58] focus:shadow-3xl text-gray-900 transition-all duration-200"
          />
          {errors.title && <FormError message={errors.title} />}
        </div>
        <div>
          <label htmlFor="link" className="block text-sm font-semibold text-gray-900 mb-2">Link</label>
          <input
            type="text"
            name="link"
            id="link"
            value={formData.link}
            onChange={handleChange}
            className="block w-full px-4 py-3 text-base rounded-lg border-2 border-gray-300 shadow-2xl focus:border-[#0a1c58] focus:ring-[#0a1c58] focus:shadow-3xl text-gray-900 transition-all duration-200"
          />
          {errors.link && <FormError message={errors.link} />}
        </div>
        <div></div>
      </div>
      {/* Image upload section at the bottom */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Banner Image</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-4 border-gray-300 border-dashed rounded-lg hover:border-[#0a1c58] hover:bg-gray-50 transition-all duration-300 shadow-lg">
          <div className="space-y-1 text-center">
            {isUploadingImage ? (
              <div className="mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#0a1c58] mx-auto"></div>
                <p className="mt-2 text-sm font-semibold text-[#0a1c58]">Uploading...</p>
              </div>
            ) : formData.image ? (
              <div className="mb-4">
                <img 
                  src={formData.image.startsWith('/') ? formData.image : `/${formData.image}`}
                  alt="Banner preview" 
                  className="mx-auto h-[180px] w-[180px] object-cover rounded-lg border-4 border-gray-300 shadow-md"
                  onError={(e) => {
                    console.error('Image failed to load:', formData.image);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  onLoad={() => console.log('Image loaded successfully:', formData.image)}
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
                  onChange={handleFileChange}
                  disabled={isUploadingImage}
                />
              </label>
              <p className="pl-3 self-center">or drag and drop</p>
            </div>
            <p className="text-sm text-gray-600 font-medium">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        {errors.image && <FormError message={errors.image} />}
      </div>
      {backendError && (
        <div className="text-red-600 font-semibold text-center mb-4">{backendError}</div>
      )}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:ring-offset-2"
        >
          Cancel
        </button>
        <LoadingButton
          type="submit"
          isLoading={isLoading}
          loadingText={banner ? "Updating..." : "Creating..."}
          className="rounded-full bg-[#0a1c58] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#132b7c] hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:ring-offset-2"
        >
          {banner ? "Update" : "Create"}
        </LoadingButton>
      </div>
    </form>
  );
} 