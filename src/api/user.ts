import axios from 'axios';
import type { ApiResponse } from '../types/codef';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'application/json;charset=UTF-8',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  riskType: string;
}

export interface UpdateUserRequest {
  name?: string;
  riskType?: string;
  currentPassword?: string;
  newPassword?: string;
}

export function fetchMe(): UserInfo {
  return {
    id: Number(localStorage.getItem('userId') ?? 0),
    name: localStorage.getItem('name') ?? '',
    email: localStorage.getItem('email') ?? '',
    riskType: localStorage.getItem('riskType') ?? '',
  };
}

export async function updateMe(payload: UpdateUserRequest): Promise<void> {
  await api.patch('/api/users/me', payload);
}

export async function deleteMe(): Promise<void> {
  const userId = localStorage.getItem('userId');
  await api.delete(`/api/users/${userId}`);
}
