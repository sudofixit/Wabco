import { useState, useEffect } from "react";
import { Service, ServiceFormData } from "@/types/admin/services";
import FormError from "@/app/components/ui/FormError";
import LoadingButton from "@/app/components/ui/LoadingButton";

interface ServiceFormProps {
  service?: Service;
  onSubmit: (data: ServiceFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  title?: string;
  price?: string;
  image?: string;
}

export default function ServiceForm({ service, onSubmit, onCancel, isLoading = false }: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    title: "",
    description: "",
    image: "",
    price: undefined,
    isActive: true
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title,
        description: service.description || "",
        image: service.image,
        price: service.price,
        isActive: service.isActive
      });
    }
  }, [service]);

  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case 'title':
        if (!value) return 'Title is required';
        if (value.length < 3) return 'Title must be at least 3 characters';
        return undefined;
      case 'price':
        if (value === undefined || value === '') return 'Price is required';
        if (isNaN(value) || Number(value) < 0) return 'Price must be a positive number';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Clear error when user starts typing
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      setErrors(prev => ({ ...prev, image: undefined })); // Clear any previous image errors

      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        // If we're updating an existing service and it has an image, pass the old image URL for deletion
        if (service?.image) {
          uploadFormData.append('oldImageUrl', service.image);
        }

        console.log('Starting image upload for service...');
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
          console.error('Failed to upload file - Response:', response.status, err);
          setErrors(prev => ({
            ...prev,
            image: `Upload failed: ${err?.error || 'Server error'} (${response.status})`
          }));
        }
      } catch (error: any) {
        console.error('Error uploading file - Network/Other error:', error);
        setErrors(prev => ({
          ...prev,
          image: `Upload failed: ${error?.message || 'Network error'}`
        }));
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBackendError(null);
    // Create form data with dummy values for hidden/removed fields to pass validation
    const submitData = {
      ...formData,
      description: formData.description || "Service description" // Add dummy description if empty
    };
    // Validate all required fields
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'description') { // Skip description validation since it's not required
        const error = validateField(key, formData[key as keyof ServiceFormData]);
        if (error) newErrors[key as keyof FormErrors] = error;
      }
    });
    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    // If no errors, submit
    if (Object.keys(newErrors).length === 0) {
      try {
        onSubmit(submitData);
      } catch (err: any) {
        setBackendError(err?.message || 'Failed to create service');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Title field - smaller */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">Service Title</label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleBlur}
            className="block w-full px-3 py-2 text-sm rounded-md border-2 border-gray-300 shadow-2xl focus:border-[#0a1c58] focus:ring-[#0a1c58] focus:shadow-3xl text-gray-900 transition-all duration-200"
          />
          {errors.title && <FormError message={errors.title} />}
        </div>

        {/* Price field - smaller */}
        <div>
          <label htmlFor="price" className="block text-sm font-semibold text-gray-900 mb-2">Price (KES)</label>
          <input
            type="number"
            name="price"
            id="price"
            value={formData.price || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            min="0"
            step="0.01"
            className="block w-full px-3 py-2 text-sm rounded-md border-2 border-gray-300 shadow-2xl focus:border-[#0a1c58] focus:ring-[#0a1c58] focus:shadow-3xl text-gray-900 transition-all duration-200"
          />
          {errors.price && <FormError message={errors.price} />}
        </div>

        {/* Status field - smaller */}
        <div>
          <label htmlFor="isActive" className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
          <select
            name="isActive"
            id="isActive"
            value={formData.isActive ? 'true' : 'false'}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
            className="block w-full px-3 py-2 text-sm rounded-md border-2 border-gray-300 shadow-2xl focus:border-[#0a1c58] focus:ring-[#0a1c58] focus:shadow-3xl text-gray-900 transition-all duration-200"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Description field - full width */}
        <div className="md:col-span-4">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={4}
            className="block w-[500] px-4 py-3 text-base rounded-md border-2 border-gray-300 shadow-2xl focus:border-[#0a1c58] focus:ring-[#0a1c58] focus:shadow-3xl text-gray-900 transition-all duration-200"
            placeholder="Enter service description..."
          />
        </div>
      </div>

      {/* Image upload section - moved to bottom */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Service Image</label>
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
                  src={formData.image.startsWith('http') ? formData.image : (formData.image.startsWith('/') ? formData.image : `/${formData.image}`)}
                  alt="Service preview"
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

      {/* Action buttons */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:ring-offset-2"
        >
          Cancel
        </button>
        <LoadingButton
          type="submit"
          isLoading={isLoading}
          loadingText={service ? "Updating..." : "Creating..."}
          className="rounded-md bg-[#0a1c58] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#132b7c] hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:ring-offset-2"
        >
          {service ? "Update Service" : "Create Service"}
        </LoadingButton>
      </div>

      {backendError && (
        <div className="text-red-600 font-semibold text-center mb-4">{backendError}</div>
      )}
    </form>
  );
} 