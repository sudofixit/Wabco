import { Booking } from "@/types/admin/booking";
import LoadingButton from "@/app/components/ui/LoadingButton";

interface BookingTableProps {
  bookings: Booking[];
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
  onToggleStatus: (booking: Booking) => void;
  isDeleting?: boolean;
  isTogglingStatus?: boolean;
}

export default function BookingTable({
  bookings,
  onEdit,
  onDelete,
  onToggleStatus,
  isDeleting = false,
  isTogglingStatus = false,
}: BookingTableProps) {
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-300 text-[15px]">
        <thead>
          <tr>
            <th
              scope="col"
              className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              Customer
            </th>
            <th
              scope="col"
              className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900"
            >
              Car Details
            </th>
            <th
              scope="col"
              className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900"
            >
              Services
            </th>
            <th
              scope="col"
              className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900"
            >
              Branch
            </th>
            <th
              scope="col"
              className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900"
            >
              Date & Time
            </th>
            <th
              scope="col"
              className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900"
            >
              Type
            </th>
            <th
              scope="col"
              className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900"
            >
              Contact
            </th>
            <th
              scope="col"
              className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-2 py-2 text-left text-[15px] font-semibold text-gray-900"
            >
              Created
            </th>
            <th
              scope="col"
              className="relative py-2 pl-3 pr-4 sm:pr-6"
            >
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                <div>
                  <div className="font-medium">{booking.customerName}</div>
                </div>
              </td>
              <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
                <div>
                  <div className="font-medium">{booking.carYear} {booking.carMake}</div>
                  <div className="text-gray-600">{booking.carModel}</div>
                </div>
              </td>
              <td className="px-2 py-2 text-sm text-gray-700">
                <div className="max-w-[200px]">
                  <div className="truncate" title={booking.services}>
                    {booking.services}
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
                {booking.branchName}
              </td>
              <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
                <div>
                  <div className="font-medium">{formatDate(booking.bookingDate)}</div>
                  <div className="text-gray-600">{booking.bookingTime || 'N/A'}</div>
                </div>
              </td>
              <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${booking.requestType === 'booking'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
                  }`}>
                  {booking.requestType === 'booking' ? 'Booking' : 'Quote'}
                </span>
              </td>
              <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
                <div>
                  <div className="text-xs">{booking.customerEmail}</div>
                  <div className="text-xs text-gray-600">{booking.customerPhone}</div>
                </div>
              </td>
              <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
                <button
                  onClick={() => onToggleStatus(booking)}
                  disabled={isTogglingStatus}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${booking.isActive
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                    } ${isTogglingStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {booking.isActive ? 'Active' : 'Cancelled'}
                </button>
              </td>
              <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700">
                {formatDateTime(booking.createdAt)}
              </td>
              <td className="relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => onEdit(booking)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <LoadingButton
                    onClick={() => onDelete(booking)}
                    isLoading={isDeleting}
                    className="text-red-600 hover:text-red-900 bg-transparent p-0 border-none"
                  >
                    Delete
                  </LoadingButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {bookings.length === 0 && (
        <div className="text-center py-8 text-gray-700">
          No bookings found.
        </div>
      )}
    </div>
  );
} 