import { Service } from "@/types/admin/services";
import Image from "next/image";
import LoadingButton from "@/app/components/ui/LoadingButton";

interface ServiceTableProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (serviceId: number) => void;
  isDeleting?: boolean;
}

export default function ServiceTable({
  services,
  onEdit,
  onDelete,
  isDeleting = false,
}: ServiceTableProps) {
  return (
    <table className="min-w-full divide-y divide-gray-300">
      <thead>
        <tr>
          <th
            scope="col"
            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
          >
            Image
          </th>
          <th
            scope="col"
            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Title
          </th>
          <th
            scope="col"
            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Description
          </th>
          <th
            scope="col"
            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Price
          </th>
          <th
            scope="col"
            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Status
          </th>
          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {services.map((service) => (
          <tr key={service.id}>
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
              <Image
                src={service.image}
                alt={service.title}
                width={48}
                height={48}
                className="rounded"
              />
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
              {service.title}
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
              {service.description}
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
              KES {service.price}
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  service.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {service.isActive ? "Active" : "Inactive"}
              </span>
            </td>
            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => onEdit(service)}
                  className="text-[#0a1c58] hover:text-[#0a1c58]/80"
                >
                  Edit
                </button>
                <LoadingButton
                  onClick={() => onDelete(service.id)}
                  isLoading={isDeleting}
                  loadingText="Deleting..."
                  className="text-red-600 hover:text-red-900 bg-transparent p-0"
                >
                  Delete
                </LoadingButton>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
} 