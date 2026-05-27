import http from './http';
import type { ApiResponse } from '../types/codef';

const api = http;

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
