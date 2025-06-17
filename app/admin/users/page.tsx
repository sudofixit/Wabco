"use client";
import { useState, useEffect } from "react";
import { User, UserFormData } from "@/types/admin/users";
import UserTable from "./components/UserTable";
import UserForm from './components/UserForm';

import { toast } from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUser, setEditUser] = useState<User | undefined>(undefined);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  // Add search state
  const [searchTerm, setSearchTerm] = useState("");

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    if (searchTerm.trim() === "") return true;
    
    const term = searchTerm.trim().toLowerCase();
    const nameMatch = user.name?.toLowerCase().includes(term) || false;
    const emailMatch = user.email.toLowerCase().includes(term);
    const roleMatch = user.role.toLowerCase().includes(term);
    
    return nameMatch || emailMatch || roleMatch;
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditUser(undefined);
    setShowUserForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setShowUserForm(true);
  };

  const handleCancelForm = () => {
    setShowUserForm(false);
    setEditUser(undefined);
  };

  async function handleSubmitUser(formData: UserFormData) {
    if (editUser) {
      setIsSaving(true);
      try {
        const response = await fetch(`/api/users/${editUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Failed to update user');
        const updated = await response.json();
        setUsers(users.map(u => (u.id === editUser.id ? updated : u)));
        toast.success('User updated successfully');
        setShowUserForm(false);
        setEditUser(undefined);
      } catch (error) {
        console.error('Error updating user:', error);
        toast.error('Failed to update user');
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsSaving(true);
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Failed to create user');
        const created = await response.json();
        setUsers([...users, created]);
        toast.success('User created successfully');
        setShowUserForm(false);
        setEditUser(undefined);
      } catch (error) {
        console.error('Error creating user:', error);
        toast.error('Failed to create user');
      } finally {
        setIsSaving(false);
      }
    }
  }

  async function handleDeleteUser() {
    if (!deleteUser) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${deleteUser.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete user");
      setUsers(users.filter(u => u.id !== deleteUser.id));
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
      setDeleteUser(null);
    }
  }

  return (
    <div className="pt-0 pb-8 px-2">
      <section className="w-full ml-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="text-3xl font-extrabold text-[#222] leading-tight tracking-tight">User Management</div>
            <div className="text-base text-gray-700 mt-1 font-medium">Add, edit, or remove users from your admin team.</div>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button
              type="button"
              onClick={handleAddUser}
              className="bg-[#0a1c58] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#132b7c] transition text-base flex items-center gap-2 shadow-sm"
            >
              + Add User
            </button>
          </div>
        </div>

        {/* Add search box */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4 w-full">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-[#f7f7f7] focus:outline-none text-base font-normal text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            {searchTerm && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            )}
          </div>
        </div>

        {showUserForm ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-[#0a1c58] mb-6">
              {editUser ? 'Edit User' : 'Add New User'}
            </h2>
            <UserForm
              initialData={editUser}
              onSubmit={handleSubmitUser}
              isSubmitting={isSaving}
              actionButtons={
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-full bg-[#0a1c58] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#132b7c] hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:ring-offset-2"
                  >
                    {isSaving ? "Saving..." : editUser ? "Update User" : "Create User"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto w-full min-w-[700px]">
            <div className="shadow-md rounded-lg bg-white">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <UserTable
                  users={filteredUsers}
                  onEdit={handleEditUser}
                  onDelete={id => setDeleteUser(users.find(u => u.id === id) || null)}
                  isDeleting={isDeleting}
                />
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteUser && (
          <DeleteModal
            itemName={deleteUser.name || deleteUser.email}
            onCancel={() => setDeleteUser(null)}
            onConfirm={handleDeleteUser}
            isLoading={isDeleting}
          />
        )}
      </section>
    </div>
  );
}

// Delete Modal
interface DeleteModalProps {
  itemName: string;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}
function DeleteModal({ itemName, onCancel, onConfirm, isLoading }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center pointer-events-auto border border-gray-200">
        <div className="text-xl font-bold text-gray-900 mb-4">Delete Confirmation</div>
        <div className="mb-6 text-center text-gray-900 font-semibold">
          Are you sure you want to delete <span className="font-bold">{itemName}</span>?
        </div>
        <div className="flex gap-4 w-full">
          <button
            className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
          <button
            className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 