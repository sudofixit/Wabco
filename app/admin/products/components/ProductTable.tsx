import { Product } from "@/types/admin/products";
import Image from "next/image";
import LoadingButton from "@/app/components/ui/LoadingButton";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  isDeleting?: boolean;
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  isDeleting = false,
}: ProductTableProps) {
  return (
    <table className="min-w-full divide-y divide-gray-300 text-[15px]">
      <thead>
        <tr>
          <th
            scope="col"
            className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
          >
            Image
          </th>
          <th
            scope="col"
            className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900 w-48"
          >
            Pattern
          </th>
          <th
            scope="col"
            className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900 w-20"
          >
            Width
          </th>
          <th
            scope="col"
            className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900 w-20"
          >
            Profile
          </th>
          <th
            scope="col"
            className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900 w-20"
          >
            Diameter
          </th>
          <th
            scope="col"
            className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900 w-20"
          >
            Load Index
          </th>
          <th
            scope="col"
            className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900 w-20"
          >
            Speed Rating
          </th>
          <th
            scope="col"
            className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900"
          >
            Brand
          </th>
          <th
            scope="col"
            className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900"
          >
            Warranty
          </th>
          <th
            scope="col"
            className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900"
          >
            Price
          </th>
          <th
            scope="col"
            className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900"
          >
            Year
          </th>
          <th
            scope="col"
            className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900"
          >
            Origin
          </th>
          <th
            scope="col"
            className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900"
          >
            Offer
          </th>
          <th
            scope="col"
            className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900"
          >
            Status
          </th>
          <th scope="col" className="relative py-2 pl-3 pr-4 sm:pr-6">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {products.map((product) => (
          <tr key={product.id}>
            <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
              <Image
                src={product.image}
                alt={product.pattern}
                width={90}
                height={99}
                className="rounded object-cover w-[90px] h-[99px]"
              />
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900 max-w-[200px]">
              <div className="truncate" title={product.pattern}>
                {product.pattern}
              </div>
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
              {product.width || '-'}
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
              {product.profile || '-'}
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
              {product.diameter || '-'}
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
              {product.loadIndex || '-'}
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
              {product.speedRating || '-'}
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
              {product.brand && product.brand.name ? (
                <div className="flex items-center gap-2">
                  {product.brand.logo ? (
                    <Image
                      src={product.brand.logo}
                      alt={product.brand.name}
                      width={32}
                      height={32}
                      className="rounded object-contain w-8 h-8 bg-gray-100 border"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600 border">?</div>
                  )}
                  <span>{product.brand.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600 border">?</div>
                  <span className="text-gray-600 italic">No Brand</span>
                </div>
              )}
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
              {product.warranty}
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
              KES {product.price}
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
              {product.year}
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
              {product.origin}
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
              {product.offer ? 'Yes' : 'No'}
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
              <span className={`font-bold ${product.availability === "In Stock"
                ? "text-green-700"
                : product.availability === "Contact Us"
                  ? "text-red-600"
                  : "text-red-600" // For Low Stock, Out of Stock, etc.
                }`}>
                {product.availability}
              </span>
            </td>
            <td className=" whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => onEdit(product)}
                  className="text-[#0a1c58] hover:text-[#0a1c58]/80"
                >
                  Edit
                </button>
                <LoadingButton
                  onClick={() => onDelete(product)}
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