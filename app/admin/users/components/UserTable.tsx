import { User } from "@/types/admin/users";
import LoadingButton from "@/app/components/ui/LoadingButton";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  isDeleting?: boolean;
}

export default function UserTable({ users, onEdit, onDelete, isDeleting = false }: UserTableProps) {
  return (
    <table className="min-w-full divide-y divide-gray-300">
      <thead>
        <tr>
          <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
          <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {users.map((user) => (
          <tr key={user.id}>
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{user.name || '-'}</td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{user.email}</td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{user.role}</td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </td>
            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
              <div className="flex gap-2 justify-end">
                <button onClick={() => onEdit(user)} className="text-[#0a1c58] hover:text-[#0a1c58]/80">Edit</button>
                <LoadingButton
                  onClick={() => onDelete(user.id)}
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