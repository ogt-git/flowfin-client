import http from './http';
import type { ApiResponse } from '../types/codef';
import type { StockAccount, AssetSummaryData, ManualAssetItem } from '../types/asset';

const api = http;

export async function fetchStocks(): Promise<StockAccount[]> {
  const res = await api.get<ApiResponse<StockAccount[]>>('/api/stocks');
  return res.data.data;
}

export async function fetchAssetSummary(): Promise<AssetSummaryData> {
  const res = await api.get<ApiResponse<AssetSummaryData>>('/api/assets/summary');
  return res.data.data;
}

export interface ManualAssetRequest {
  assetType: string;
  itemName: string;
  purchaseAmount: number;
  valuationAmt: number;
  purchaseDate?: string;
  memo?: string;
}

export async function createManualAsset(payload: ManualAssetRequest): Promise<void> {
  await api.post('/api/assets/manual', payload);
}

export async function fetchManualAssets(): Promise<ManualAssetItem[]> {
  const res = await api.get<ApiResponse<ManualAssetItem[]>>('/api/assets/manual');
  return res.data.data;
}

export async function deleteManualAsset(assetId: number): Promise<void> {
  await api.delete(`/api/assets/manual/${assetId}`);
}
