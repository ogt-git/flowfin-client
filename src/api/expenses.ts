import axios from 'axios';
import type { Expense, ExpensePage, MonthlyStats } from '../types/expense';
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

export interface FetchExpensesParams {
  month?: string;
  categoryType?: string;
  categoryId?: number;
  page?: number;
  size?: number;
}

export async function fetchExpenses(params: FetchExpensesParams): Promise<ExpensePage> {
  const res = await api.get<ApiResponse<ExpensePage>>('/api/expenses', { params });
  return res.data.data;
}

export async function fetchExpenseDetail(id: number): Promise<Expense> {
  const res = await api.get<ApiResponse<Expense>>(`/api/expenses/details/${id}`);
  return res.data.data;
}

export async function updateExpenseCategory(id: number, categoryId: number): Promise<void> {
  await api.put(`/api/expenses/category/${id}`, { categoryId });
}

export async function deleteExpense(id: number): Promise<void> {
  await api.delete(`/api/expenses/delete/${id}`);
}

export async function fetchMonthlyStats(month: string): Promise<MonthlyStats> {
  const res = await api.get<ApiResponse<MonthlyStats>>('/api/expenses/stats', { params: { month } });
  return res.data.data;
}
