import { UserFormData } from "@/types/admin/users";

interface UserFormProps {
  initialData?: UserFormData;
  onSubmit: (data: UserFormData) => void;
  isSubmitting: boolean;
  actionButtons?: React.ReactNode;
}

export default function UserForm({ initialData, onSubmit, isSubmitting, actionButtons }: UserFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: UserFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as "ADMIN" | "STAFF",
      name: formData.get("name") as string,
      isActive: formData.get("isActive") === "true",
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-900">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          defaultValue={initialData?.email}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] sm:text-sm text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-900">
          Password {initialData && "(leave blank to keep current)"}
        </label>
        <input
          type="password"
          name="password"
          id="password"
          required={!initialData}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] sm:text-sm text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-900">
          Role
        </label>
        <select
          name="role"
          id="role"
          required
          defaultValue={initialData?.role || "STAFF"}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] sm:text-sm text-gray-900"
        >
          <option value="ADMIN">Admin</option>
          <option value="STAFF">Staff</option>
        </select>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-900">
          Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          defaultValue={initialData?.name}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0a1c58] focus:ring-[#0a1c58] sm:text-sm text-gray-900"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          id="isActive"
          defaultChecked={initialData?.isActive ?? true}
          value="true"
          className="h-4 w-4 rounded border-gray-300 text-[#0a1c58] focus:ring-[#0a1c58]"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
          Active
        </label>
      </div>

      {actionButtons ? (
        actionButtons
      ) : (
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-[#0a1c58] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#132b7c] focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : initialData ? "Update User" : "Create User"}
          </button>
        </div>
      )}
    </form>
  );
} 