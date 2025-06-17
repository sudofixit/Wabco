export interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'STAFF';
  name?: string;
  lastLogin?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFormData {
  email: string;
  password?: string;
  role: 'ADMIN' | 'STAFF';
  name?: string;
  isActive: boolean;
} 