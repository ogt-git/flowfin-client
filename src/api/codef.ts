import axios from 'axios';
import type { CodefConnectRequest, ApiResponse, CodefSyncResult, CodefConnection } from '../types/codef';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: { 'Content-Type': 'application/json' },
});

// HTTPS가 전송 구간 암호화 담당. 백엔드에서 RSA 암호화 후 CODEF 전달.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

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
  const res = await api.post<string>('/api/codef/connect', form);
  return res.data;
}

// 카드 지출 내역 동기화 — POST /api/v1/codef/sync/card
export async function syncCard(userId: number): Promise<ApiResponse<CodefSyncResult>> {
  const res = await api.post<ApiResponse<CodefSyncResult>>('/api/v1/codef/sync/card', null, {
    headers: { 'X-User-Id': String(userId) },
  });
  return res.data;
}

// 증권 종합자산 동기화 — POST /api/v1/codef/sync/stock
export async function syncStock(userId: number): Promise<ApiResponse<CodefSyncResult>> {
  const res = await api.post<ApiResponse<CodefSyncResult>>('/api/v1/codef/sync/stock', null, {
    headers: { 'X-User-Id': String(userId) },
  });
  return res.data;
}
