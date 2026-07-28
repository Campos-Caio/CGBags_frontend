import axios from "axios";

import { api } from "@/lib/api";
import type { User } from "@/types/auth";

export interface ListUsersParams {
  search?: string;
  is_active?: boolean;
  is_admin?: boolean;
  skip?: number;
  limit?: number;
}

export interface UserUpdateInput {
  email?: string;
  password?: string;
}

export interface UserRoleInput {
  is_admin?: boolean;
  is_active?: boolean;
}

export interface UserCreateAdminInput {
  email: string;
  password: string;
  is_admin?: boolean;
}

export async function listUsersAdmin(params?: ListUsersParams): Promise<User[]> {
  const response = await api.get<User[]>("/users/", { params });
  return response.data;
}

export async function createUserAdmin(data: UserCreateAdminInput): Promise<User> {
  const response = await api.post<User>("/admin/users", data);
  return response.data;
}

export async function getUserByIdAdmin(id: number): Promise<User | null> {
  try {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function updateUserAdmin(id: number, data: UserUpdateInput): Promise<User> {
  const response = await api.patch<User>(`/users/${id}`, data);
  return response.data;
}

export async function setUserRole(id: number, data: UserRoleInput): Promise<User> {
  const response = await api.patch<User>(`/users/${id}/role`, data);
  return response.data;
}

export async function deleteUserAdmin(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}
