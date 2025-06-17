import { Location } from "@/types/admin/locations";
import Image from "next/image";
import LoadingButton from "@/app/components/ui/LoadingButton";

interface LocationTableProps {
  locations: Location[];
  onEdit: (location: Location) => void;
  onDelete: (locationId: number) => void;
  isDeleting?: boolean;
}

export default function LocationTable({
  locations,
  onEdit,
  onDelete,
  isDeleting = false,
}: LocationTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Address
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Phone
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Latitude
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Longitude
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Working Hours
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {locations.map((location) => (
            <tr key={location.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={location.image}
                      alt={location.name}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{location.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{location.address}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{location.phone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {location.lat ? parseFloat(location.lat.toString()).toFixed(6) : 'Not set'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {location.lng ? parseFloat(location.lng.toString()).toFixed(6) : 'Not set'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{location.workingHours || 'Not set'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(location)}
                  className="text-[#0a1c58] hover:text-[#132b7c] mr-4"
                >
                  Edit
                </button>
                <LoadingButton
                  onClick={() => onDelete(location.id)}
                  isLoading={isDeleting}
                  loadingText="Deleting..."
                  className="text-red-600 hover:text-red-900 bg-transparent p-0"
                >
                  Delete
                </LoadingButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 