import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchExpenses, updateExpenseCategory, deleteExpense } from '../../api/expenses';
import type { Expense, CategoryType } from '../../types/expense';

const CATEGORIES = [
  { id: 1,  name: '주거비',     type: 'FIXED'    as CategoryType },
  { id: 2,  name: '보험비',     type: 'FIXED'    as CategoryType },
  { id: 3,  name: '통신비',     type: 'FIXED'    as CategoryType },
  { id: 4,  name: '교육비',     type: 'FIXED'    as CategoryType },
  { id: 5,  name: '식비',       type: 'VARIABLE' as CategoryType },
  { id: 6,  name: '생활비',     type: 'VARIABLE' as CategoryType },
  { id: 7,  name: '교통비',     type: 'VARIABLE' as CategoryType },
  { id: 8,  name: '의류비',     type: 'VARIABLE' as CategoryType },
  { id: 9,  name: '문화/여가비', type: 'VARIABLE' as CategoryType },
  { id: 10, name: '의료비',     type: 'ETC'      as CategoryType },
  { id: 11, name: '기타지출',   type: 'ETC'      as CategoryType },
];

const TYPE_LABELS: Record<CategoryType, string> = {
  FIXED: '고정비',
  VARIABLE: '변동비',
  ETC: '비정기',
};

const TYPE_BADGE: Record<CategoryType, string> = {
  FIXED:    'bg-blue-100 text-blue-700',
  VARIABLE: 'bg-amber-100 text-amber-700',
  ETC:      'bg-purple-100 text-purple-700',
};

const PAGE_SIZE = 10;
type FilterType = 'ALL' | CategoryType;

function toYYYYMM(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(yyyyMM: string, delta: number): string {
  const year = parseInt(yyyyMM.slice(0, 4));
  const month = parseInt(yyyyMM.slice(4)) - 1;
  const d = new Date(year, month + delta);
  return toYYYYMM(d);
}

function formatMonth(yyyyMM: string): string {
  return `${yyyyMM.slice(0, 4)}.${yyyyMM.slice(4)}`;
}

export default function ExpensesPage() {
  const [month, setMonth]             = useState(() => toYYYYMM(new Date()));
  const [filterType, setFilterType]   = useState<FilterType>('ALL');
  const [page, setPage]               = useState(0);
  const [expenses, setExpenses]       = useState<Expense[]>([]);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(false);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [editCategoryId, setEditCategoryId] = useState(0);
  const [saving, setSaving]           = useState(false);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchExpenses({
        month,
        categoryType: filterType === 'ALL' ? undefined : filterType,
        page,
        size: PAGE_SIZE,
      });
      setExpenses(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch {
      toast.error('지출 내역을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [month, filterType, page]);

  useEffect(() => { setPage(0); }, [month, filterType]);
  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  function startEdit(expense: Expense) {
    setEditingId(expense.id);
    setEditCategoryId(expense.categoryId);
  }

  async function saveCategory() {
    if (editingId === null) return;
    setSaving(true);
    try {
      await updateExpenseCategory(editingId, editCategoryId);
      toast.success('카테고리가 수정되었습니다.');
      setEditingId(null);
      loadExpenses();
    } catch {
      toast.error('카테고리 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('이 지출을 삭제하시겠습니까?')) return;
    try {
      await deleteExpense(id);
      toast.success('삭제되었습니다.');
      loadExpenses();
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
  }

  const currentMonth = toYYYYMM(new Date());
  const isCurrentMonth = month >= currentMonth;

  // pagination window: up to 5 pages centered around current page
  const windowStart = Math.max(0, Math.min(page - 2, totalPages - 5));
  const pageNumbers = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => windowStart + i,
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">지출 내역</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            className="rounded-lg p-2 hover:bg-secondary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="w-24 text-center text-lg font-medium">{formatMonth(month)}</span>
          <button
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
            disabled={isCurrentMonth}
            className="rounded-lg p-2 hover:bg-secondary disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex items-center gap-2">
        {(['ALL', 'FIXED', 'VARIABLE', 'ETC'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filterType === type
                ? 'bg-[#0A3D5C] text-white shadow-md'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {type === 'ALL' ? '전체' : TYPE_LABELS[type]}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground">
          총 {totalElements.toLocaleString()}건
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">지출 내역이 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4"
            >
              <div>
                <p className="font-medium">{expense.merchantName}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {expense.expenseDate} · {expense.cardCompany}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {editingId === expense.id ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(Number(e.target.value))}
                      className="rounded-lg border border-border px-2 py-1 text-sm outline-none focus:border-[#0A3D5C]"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={saveCategory}
                      disabled={saving}
                      className="rounded-lg bg-[#0A3D5C] px-3 py-1.5 text-sm text-white disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : '저장'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${TYPE_BADGE[expense.categoryType]}`}>
                    {expense.categoryName}
                  </span>
                )}

                <p className="w-28 text-right font-medium">
                  -{expense.amount.toLocaleString('ko-KR')}원
                </p>

                {editingId !== expense.id && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(expense)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg p-2 hover:bg-secondary disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pageNumbers.map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-9 w-9 rounded-lg text-sm ${
                n === page
                  ? 'bg-[#0A3D5C] text-white'
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              {n + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-lg p-2 hover:bg-secondary disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
