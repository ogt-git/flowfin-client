import axios from 'axios';
import type { ApiResponse } from '../types/codef';
import type { AssetItem, AssetSummary } from '../types/asset';

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

export async function fetchStocks(): Promise<AssetItem[]> {
  const res = await api.get<ApiResponse<AssetItem[]>>('/api/stocks');
  return res.data.data;
}

export async function fetchAssetSummary(): Promise<AssetSummary> {
  const res = await api.get<ApiResponse<AssetSummary>>('/api/assets/summary');
  return res.data.data;
}
