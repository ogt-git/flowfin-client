import http from './http';
import type { Expense, ExpensePage, MonthlyStats } from '../types/expense';
import type { ApiResponse } from '../types/codef';

const api = http;

export interface FetchExpensesParams {
  month?: string;
  categoryType?: string;
  categoryId?: number;
  page?: number;
  size?: number;
}

function toApiMonth(month: string): string {
  // Internal state uses YYYYMM; backend expects YYYY-MM
  return month.length === 6 ? `${month.slice(0, 4)}-${month.slice(4)}` : month;
}

export async function fetchExpenses(params: FetchExpensesParams): Promise<ExpensePage> {
  const apiParams = params.month ? { ...params, month: toApiMonth(params.month) } : params;
  const res = await api.get<ApiResponse<ExpensePage>>('/api/expenses', { params: apiParams });
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
  const res = await api.get<ApiResponse<MonthlyStats>>('/api/expenses/stats', { params: { month: toApiMonth(month) } });
  return res.data.data;
}
