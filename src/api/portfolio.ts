import axios from 'axios';
import type { ApiResponse } from '../types/codef';
import type { Portfolio } from '../types/portfolio';

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
