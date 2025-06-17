import { Brand } from "@/types/admin/brands";
import Image from "next/image";
import LoadingButton from "@/app/components/ui/LoadingButton";

interface BrandTableProps {
  brands: Brand[];
  onEdit: (brand: Brand) => void;
  onDelete: (brandId: number) => void;
  isDeleting?: boolean;
}

export default function BrandTable({
  brands,
  onEdit,
  onDelete,
  isDeleting = false,
}: BrandTableProps) {
  return (
    <table className="min-w-full divide-y divide-gray-300">
      <thead>
        <tr>
          <th
            scope="col"
            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
          >
            Logo
          </th>
          <th
            scope="col"
            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Name
          </th>
          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {brands.map((brand) => (
          <tr key={brand.id}>
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
              <Image
                src={brand.logo}
                alt={brand.name}
                width={48}
                height={48}
                className="rounded"
              />
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
              {brand.name}
            </td>
            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => onEdit(brand)}
                  className="text-[#0a1c58] hover:text-[#0a1c58]/80"
                >
                  Edit
                </button>
                <LoadingButton
                  onClick={() => onDelete(brand.id)}
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