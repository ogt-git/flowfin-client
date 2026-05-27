import http from './http';
import type { ApiResponse } from '../types/codef';
import type { Portfolio } from '../types/portfolio';

const api = http;

export async function fetchPortfolio(): Promise<Portfolio> {
  const res = await api.get<ApiResponse<Portfolio>>('/api/portfolio');
  return res.data.data;
}

export async function fetchPortfolioHistory(): Promise<Portfolio[]> {
  const res = await api.get<ApiResponse<Portfolio[]>>('/api/portfolio/history');
  return res.data.data;
}

export async function recommendPortfolio(): Promise<Portfolio> {
  const res = await api.post<ApiResponse<Portfolio>>('/api/portfolio/recommend');
  return res.data.data;
}
