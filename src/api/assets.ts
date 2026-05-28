import http from './http';
import type { ApiResponse } from '../types/codef';
import type { AssetItem, AssetSummary } from '../types/asset';

const api = http;

export async function fetchStocks(): Promise<AssetItem[]> {
  const res = await api.get<ApiResponse<AssetItem[]>>('/api/stocks');
  return res.data.data;
}

export async function fetchAssetSummary(): Promise<AssetSummary> {
  const res = await api.get<ApiResponse<AssetSummary>>('/api/assets/summary');
  return res.data.data;
}

export interface ManualAssetRequest {
  productType: string;
  itemName: string;
  purchaseAmount: number;
  valuationAmt: number;
}

export async function createManualAsset(payload: ManualAssetRequest): Promise<void> {
  await api.post('/api/assets/manual', payload);
}
