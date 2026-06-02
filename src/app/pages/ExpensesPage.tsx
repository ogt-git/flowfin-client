import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Chart, ArcElement, DoughnutController, Tooltip } from 'chart.js';
import { fetchExpenses, updateExpenseCategory, deleteExpense, fetchMonthlyStats } from '../../api/expenses';
import { syncCard } from '../../api/codef';
import type { Expense, CategoryType, MonthlyStats } from '../../types/expense';

Chart.register(ArcElement, DoughnutController, Tooltip);

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

const TYPE_COLORS: Record<string, string> = {
  고정비: '#3266ad',
  변동비: '#1D9E75',
  비정기: '#D4537E',
};

const CAT_COLORS: Record<string, string> = {
  식비: '#3266ad',
  문화생활: '#1D9E75',
  의류: '#D4537E',
  구독: '#BA7517',
  교통비: '#7F77DD',
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

// ── 도넛 차트 훅 ─────────────────────────────────────────

function useDoughnutChart(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  labels: string[],
  values: number[],
  colors: string[],
) {
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: 'transparent' }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => ` ${ctx.label}: ${(ctx.raw as number).toLocaleString()}원` },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [labels, values, colors]);
}

export default function ExpensesPage() {
  const [month, setMonth]             = useState(() => toYYYYMM(new Date()));
  const [filterType, setFilterType]   = useState<FilterType>('ALL');
  const [page, setPage]               = useState(0);
  const [expenses, setExpenses]       = useState<Expense[]>([]);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading]         = useState(false);
  const [refreshing, setRefreshing]   = useState(false);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [editCategoryId, setEditCategoryId] = useState(0);
  const [saving, setSaving]           = useState(false);
  const [stats, setStats]             = useState<MonthlyStats | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      setTotalAmount(result.totalAmount ?? 0);
    } catch {
      toast.error('지출 내역을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [month, filterType, page]);

  async function reload() {
    setRefreshing(true);
    try {
      const result = await syncCard();
      const msg = result?.savedCount === 0 ? '새로운 카드 내역이 없습니다.' : `카드 내역 ${result?.savedCount}건이 동기화되었습니다.`;
      toast.success(msg);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      if (status === 429) {
        toast.error('5분에 한 번만 새로고침할 수 있습니다.');
      } else {
        toast.error('카드 동기화에 실패했습니다.');
      }
    } finally {
      await Promise.all([loadExpenses(), fetchMonthlyStats(month).then(setStats).catch(() => {})]);
      setRefreshing(false);
    }
  }

  useEffect(() => { setPage(0); }, [month, filterType]);
  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  useEffect(() => {
    fetchMonthlyStats(month).then(setStats).catch(() => {});
  }, [month]);

  // 1분마다 백그라운드 자동 새로고침 (편집 중·새로고침 중에는 스킵)
  const autoRefresh = useCallback(async () => {
    if (saving || editingId !== null || refreshing) return;
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
      setTotalAmount(result.totalAmount ?? 0);
    } catch { /* silent */ }
    fetchMonthlyStats(month).then(setStats).catch(() => {});
  }, [month, filterType, page, saving, editingId, refreshing]);

  useEffect(() => {
    const id = setInterval(autoRefresh, 60_000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  function startEdit(expense: Expense) {
    setEditingId(expense.expenseId);
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

  // ── 차트 데이터 ────────────────────────────────────────

  const { chartLabels, chartValues, chartColors } = (() => {
    if (filterType === 'ALL' && stats) {
      const labels = ['고정비', '변동비', '비정기'];
      return {
        chartLabels: labels,
        chartValues: [stats.fixedAmount, stats.variableAmount, stats.etcAmount],
        chartColors: labels.map((l) => TYPE_COLORS[l]),
      };
    }
    const catTotals: Record<string, number> = {};
    expenses.forEach((e) => {
      catTotals[e.categoryName] = (catTotals[e.categoryName] ?? 0) + e.amount;
    });
    const labels = Object.keys(catTotals);
    return {
      chartLabels: labels,
      chartValues: labels.map((c) => catTotals[c]),
      chartColors: labels.map((c) => CAT_COLORS[c] ?? '#888'),
    };
  })();

  const chartTotal = filterType === 'ALL' ? (stats?.totalAmount ?? 0) : totalAmount;

  useDoughnutChart(canvasRef, chartLabels, chartValues, chartColors);

  const currentMonth = toYYYYMM(new Date());
  const isCurrentMonth = month >= currentMonth;

  const windowStart = Math.max(0, Math.min(page - 2, totalPages - 5));
  const pageNumbers = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => windowStart + i,
  );

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">지출 내역</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={reload}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm text-muted-foreground hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">새로고침</span>
          </button>
          <button
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            className="rounded-lg p-2 hover:bg-secondary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="w-20 text-center text-base font-medium sm:w-24 sm:text-lg">{formatMonth(month)}</span>
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
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
        {(['ALL', 'FIXED', 'VARIABLE', 'ETC'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filterType === type
                ? 'bg-primary text-white shadow-md'
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

      {/* 본문: 목록 + 차트 */}
      <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
        {/* List */}
        <div>
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
                  key={expense.expenseId}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4"
                >
                  <div>
                    <p className="font-medium">{expense.merchantName}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {expense.expenseDate} · {expense.cardCompany}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {editingId === expense.expenseId ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={editCategoryId}
                          onChange={(e) => setEditCategoryId(Number(e.target.value))}
                          className="rounded-lg border border-border px-2 py-1 text-sm outline-none focus:border-primary"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={saveCategory}
                          disabled={saving}
                          className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white disabled:opacity-60"
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

                    <p className={`w-28 text-right font-medium ${expense.amount < 0 ? 'text-green-500' : ''}`}>
                      {expense.amount < 0
                        ? `+${Math.abs(expense.amount).toLocaleString('ko-KR')}원`
                        : `-${expense.amount.toLocaleString('ko-KR')}원`}
                    </p>

                    {editingId !== expense.expenseId && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(expense)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.expenseId)}
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
                      ? 'bg-primary text-white'
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

        {/* 차트 패널 */}
        <div className="self-start rounded-xl border border-border bg-background p-4">
          <p className="mb-1 text-xs text-muted-foreground">
            {filterType === 'ALL' ? '이번 달 지출' : `${TYPE_LABELS[filterType as CategoryType]} 지출`}
          </p>
          <p className="mb-3 text-xl font-medium text-red-500">
            -{chartTotal.toLocaleString()}원
          </p>
          <div className="relative h-[180px] w-full">
            <canvas ref={canvasRef} role="img" aria-label="지출 비율 차트" />
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            {chartLabels.map((lbl, i) => {
              const positiveTotal = chartValues.reduce((sum, v) => sum + Math.max(0, v), 0);
              const pct = positiveTotal > 0 ? Math.round(Math.max(0, chartValues[i]) / positiveTotal * 100) : 0;
              return (
                <div key={lbl} className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: chartColors[i] }} />
                    {lbl}
                  </span>
                  <span className="font-medium">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
