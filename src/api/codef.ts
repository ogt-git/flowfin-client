import axios from 'axios';
import http from './http';
import type { CodefConnectRequest, ApiResponse, CodefSyncResult, CodefConnection } from '../types/codef';

export function extractCodefErrorCode(error: unknown): string | null {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.errorCode ?? null;
  }
  return null;
}

const api = http;

// 연동된 계정 목록 조회 — GET /api/codef/connections
export async function fetchConnections(): Promise<CodefConnection[]> {
  const res = await api.get<ApiResponse<CodefConnection[]>>('/api/codef/connections');
  return res.data.data;
}

// 연동 해제 — DELETE /api/codef/connect/{id}
export async function deleteConnection(id: number): Promise<void> {
  await api.delete(`/api/codef/connect/${id}`);
}

// 카드/증권 계정 연결 — POST /api/codef/connect
export async function connectAccount(form: CodefConnectRequest): Promise<string> {
  const formData = new FormData();

  formData.append('organization', form.organization);
  formData.append('businessType', form.businessType);
  formData.append('loginType', form.loginType);
  formData.append('password', form.password);
  if (form.id) formData.append('id', form.id);
  if (form.birthDate) formData.append('birthDate', form.birthDate);
  if (form.accountNumber) formData.append('accountNumber', form.accountNumber);
  if (form.accountPassword) formData.append('accountPassword', form.accountPassword);
  if (form.derFile) formData.append('derFile', form.derFile);
  if (form.keyFile) formData.append('keyFile', form.keyFile);

  const res = await api.post<string>('/api/codef/connect', formData, {
    headers: { 'Content-Type': undefined }, // axios가 multipart/form-data + boundary 자동 설정
  });
  return res.data;
}

// 카드 지출 내역 동기화 — POST /api/codef/sync/card
export async function syncCard(): Promise<CodefSyncResult> {
  const res = await api.post<ApiResponse<CodefSyncResult>>('/api/codef/sync/card');
  return res.data.data;
}

// 증권 종합자산 동기화 — POST /api/codef/sync/stock
export async function syncStock(): Promise<CodefSyncResult> {
  const res = await api.post<ApiResponse<CodefSyncResult>>('/api/codef/sync/stock');
  return res.data.data;
}
