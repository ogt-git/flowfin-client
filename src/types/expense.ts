export type CategoryType = 'FIXED' | 'VARIABLE' | 'ETC';
export type ClassifiedBy = 'RULE' | 'AI' | 'USER';

export interface Expense {
  expenseId: number;
  cardCompany: string;
  amount: number;
  merchantName: string;
  expenseDate: string;
  categoryId: number;
  categoryName: string;
  categoryType: CategoryType;
  classifiedBy: ClassifiedBy;
  isUserModified: boolean;
  isExcluded: boolean;
}

export interface ExpensePage {
  content: Expense[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  totalAmount: number;
}

export interface CategoryStat {
  categoryId: number;
  name: string;
  icon: string;
  color: string;
  amount: number;
  ratio: number;
}

export interface MonthlyStats {
  month: string;
  totalAmount: number;
  fixedAmount: number;
  variableAmount: number;
  etcAmount: number;
  previousMonthAmount: number;
  changePercent: number;
  categoryStats: CategoryStat[];
}
