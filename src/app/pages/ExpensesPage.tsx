import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router';
import { ChevronLeft, ChevronRight, Pencil, Trash2, Loader2, RefreshCw, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { Chart, ArcElement, DoughnutController, Tooltip } from 'chart.js';
import { fetchExpenses, updateExpenseCategory, deleteExpense, fetchMonthlyStats } from '../../api/expenses';
import { syncCard, fetchSyncStatus } from '../../api/codef';
import type { Expense, CategoryType, MonthlyStats } from '../../types/expense';
import { CARD_ORGANIZATIONS } from '../../types/card';

function cardName(code: string): string {
  return CARD_ORGANIZATIONS.find((o) => o.code === code)?.name ?? code;
}

Chart.register(ArcElement, DoughnutController, Tooltip);

const CATEGORIES = [
  { id: 1,  name: '주거비',      type: 'FIXED'    as CategoryType },
  { id: 2,  name: '보험비',      type: 'FIXED'    as CategoryType },
  { id: 3,  name: '통신비',      type: 'FIXED'    as CategoryType },
  { id: 4,  name: '교육비',      type: 'FIXED'    as CategoryType },
  { id: 5,  name: '식비',        type: 'VARIABLE' as CategoryType },
  { id: 6,  name: '생활비',      type: 'VARIABLE' as CategoryType },
  { id: 7,  name: '교통비',      type: 'VARIABLE' as CategoryType },
  { id: 8,  name: '의류비',      type: 'VARIABLE' as CategoryType },
  { id: 9,  name: '문화/여가비', type: 'VARIABLE' as CategoryType },
  { id: 10, name: '의료비',      type: 'ETC'      as CategoryType },
  { id: 11, name: '기타지출',    type: 'ETC'      as CategoryType },
];

const TYPE_LABELS: Record<CategoryType, string> = {
  FIXED: '고정비', VARIABLE: '변동비', ETC: '비정기',
};

const TYPE_BADGE: Record<CategoryType, string> = {
  FIXED:    'bg-blue-100 text-blue-700',
  VARIABLE: 'bg-amber-100 text-amber-700',
  ETC:      'bg-purple-100 text-purple-700',
};

const TYPE_BAR: Record<CategoryType, string> = {
  FIXED:    'bg-blue-400',
  VARIABLE: 'bg-amber-400',
  ETC:      'bg-purple-400',
};

const TYPE_STAT: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  고정비: { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  변동비: { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-500'  },
  비정기: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
};

const TYPE_COLORS: Record<string, string> = {
  고정비: '#3266ad', 변동비: '#1D9E75', 비정기: '#D4537E',
};

const CAT_COLORS: Record<string, string> = {
  식비: '#3266ad', 문화생활: '#1D9E75', 의류: '#D4537E', 구독: '#BA7517', 교통비: '#7F77DD',
};

const PAGE_SIZE = 10;
type FilterType = 'ALL' | CategoryType;

function toYYYYMM(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function shiftMonth(yyyyMM: string, delta: number) {
  const y = parseInt(yyyyMM.slice(0, 4));
  const m = parseInt(yyyyMM.slice(4)) - 1;
  const d = new Date(y, m + delta);
  return toYYYYMM(d);
}
function formatMonth(yyyyMM: string) {
  return `${yyyyMM.slice(0, 4)}.${yyyyMM.slice(4)}`;
}

// ── 도넛 차트 훅 ──────────────────────────────────────────
function useDoughnutChart(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  labels: string[], values: number[], colors: string[],
) {
  const chartRef = useRef<Chart | null>(null);
  useEffect(() => {
    const hasData = values.length > 0 && values.some(v => v > 0);
    chartRef.current?.destroy();
    chartRef.current = null;
    if (!canvasRef.current || !hasData) return;
    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: 'transparent' }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '62%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${(ctx.raw as number).toLocaleString()}원` } },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [labels, values, colors]);
}

// ── 메인 컴포넌트 ──────────────────────────────────────────
export default function ExpensesPage() {
  const location = useLocation();
  const justLinked = !!(location.state as { justLinked?: boolean } | null)?.justLinked;

  const SYNC_KEY = 'flowfin_card_syncing';

  const PROGRESS_KEY = SYNC_KEY + '_progress';
  const [syncProgress, setSyncProgress] = useState(() => {
    if (justLinked) return 0;
    return parseInt(sessionStorage.getItem(SYNC_KEY + '_progress') ?? '0', 10);
  });
  const [syncing, setSyncing] = useState(() => {
    if (justLinked) { sessionStorage.setItem(SYNC_KEY, 'true'); return true; }
    return sessionStorage.getItem(SYNC_KEY) === 'true';
  });
  const syncPhase = syncProgress < 30 ? '지출 내역을 수집하는 중...'
                  : syncProgress < 70 ? '지출을 분류하는 중...'
                  : syncProgress < 95 ? 'AI가 카테고리를 분석하는 중...'
                  : '거의 다 됐어요!';

  const [month, setMonth]           = useState(() => toYYYYMM(new Date()));
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [page, setPage]             = useState(0);
  const [expenses, setExpenses]     = useState<Expense[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalAmount, setTotalAmount]     = useState(0);
  const [loading, setLoading]       = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editCategoryId, setEditCategoryId] = useState(0);
  const [saving, setSaving]         = useState(false);
  const [stats, setStats]           = useState<MonthlyStats | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seekedRef = useRef(false);
  const dataPreparedRef = useRef(false);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchExpenses({
        month, categoryType: filterType === 'ALL' ? undefined : filterType, page, size: PAGE_SIZE,
      });
      setExpenses(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setTotalAmount(result.totalAmount ?? 0);
    } catch { toast.error('지출 내역을 불러오지 못했습니다.'); }
    finally { setLoading(false); }
  }, [month, filterType, page]);

  async function reload() {
    setRefreshing(true);
    try {
      const result = await syncCard();
      toast.success(result?.savedCount === 0 ? '새로운 카드 내역이 없습니다.' : `카드 내역 ${result?.savedCount}건이 동기화되었습니다.`);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      toast.error(status === 429 ? '5분에 한 번만 새로고침할 수 있습니다.' : '카드 동기화에 실패했습니다.');
    } finally {
      await Promise.all([loadExpenses(), fetchMonthlyStats(month).then(setStats).catch(() => {})]);
      setRefreshing(false);
    }
  }

  useEffect(() => { setPage(0); setStats(null); }, [month, filterType]);
  useEffect(() => {
    if (syncing) return;

    if (dataPreparedRef.current) {
      dataPreparedRef.current = false;
      return;
    }

    if (!seekedRef.current) {
      seekedRef.current = true;
      const current = toYYYYMM(new Date());
      (async () => {
        for (let i = 0; i <= 12; i++) {
          const m = shiftMonth(current, -i);
          try {
            const result = await fetchExpenses({ month: m, page: 0, size: 1 });
            if (result.totalElements > 0) { setMonth(m); return; }
          } catch { return; }
        }
      })();
      return;
    }

    loadExpenses();
  }, [loadExpenses, syncing]);
  useEffect(() => { fetchMonthlyStats(month).then(setStats).catch(() => {}); }, [month]);

  useEffect(() => {
    if (!syncing) return;

    const MAX_WAIT = 120_000;
    const POLL_INTERVAL = 4_000;
    const MIN_DISPLAY = 3_000;
    const startTime = Date.now();
    let stopped = false;
    let isComplete = false;
    let progress = parseInt(sessionStorage.getItem(PROGRESS_KEY) ?? '0', 10);
    let tickTimer: ReturnType<typeof setTimeout> | null = null;

    // 95%까지 지수 감속, isComplete + 95% 이상일 때만 100%로 채움
    const tick = () => {
      if (stopped) return;

      if (isComplete && progress >= 95) {
        progress = Math.min(progress + 3, 100);
      } else {
        const increment = Math.max(0.3, (95 - progress) * 0.025);
        progress = Math.min(progress + increment, 95);
      }

      const rounded = Math.round(progress);
      setSyncProgress(rounded);
      sessionStorage.setItem(PROGRESS_KEY, String(rounded));

      if (rounded >= 100) {
        // poll에서 이미 데이터를 state에 넣어뒀으므로 바로 화면 전환
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, MIN_DISPLAY - elapsed) + 3_400;
        setTimeout(() => {
          if (!stopped) {
            stopped = true;
            sessionStorage.removeItem(SYNC_KEY);
            sessionStorage.removeItem(PROGRESS_KEY);
            setSyncing(false);
          }
        }, delay);
      } else {
        tickTimer = setTimeout(tick, 100);
      }
    };

    tickTimer = setTimeout(tick, 100);

    async function poll() {
      if (stopped) return;
      try {
        const syncStatus = await fetchSyncStatus('CARD');
        if (syncStatus === 'SYNCING') {
          if (Date.now() - startTime < MAX_WAIT) {
            setTimeout(poll, POLL_INTERVAL);
          } else {
            stopped = true;
            if (tickTimer) clearTimeout(tickTimer);
            sessionStorage.removeItem(SYNC_KEY);
            sessionStorage.removeItem(PROGRESS_KEY);
            setSyncing(false);
          }
          return;
        }

        const result = await fetchExpenses({ month: toYYYYMM(new Date()), page: 0, size: 100 });
        const total   = result.totalElements;
        const pending = result.content.filter(e => e.classifiedBy === 'PENDING').length;

        if (total > 0 && pending === 0) {
          const current = toYYYYMM(new Date());
          for (let i = 0; i <= 12; i++) {
            const m = shiftMonth(current, -i);
            try {
              const res = await fetchExpenses({ month: m, page: 0, size: PAGE_SIZE });
              if (res.totalElements > 0) {
                setMonth(m);
                setExpenses(res.content);
                setTotalPages(res.totalPages);
                setTotalElements(res.totalElements);
                setTotalAmount(res.totalAmount ?? 0);
                fetchMonthlyStats(m).then(setStats).catch(() => {});
                seekedRef.current = true;
                dataPreparedRef.current = true;
                break;
              }
            } catch { break; }
          }
          isComplete = true;
          return;
        }

        if (total > 0 && pending > 0) {
          // AI 분류 중 → 계속 폴링
        } else if (syncStatus === 'DONE' || syncStatus === 'FAILED') {
          isComplete = true;
          return;
        }
      } catch { /* silent */ }

      if (Date.now() - startTime >= MAX_WAIT) {
        stopped = true;
        if (tickTimer) clearTimeout(tickTimer);
        sessionStorage.removeItem(SYNC_KEY);
        sessionStorage.removeItem(PROGRESS_KEY);
        setSyncing(false);
        return;
      }
      setTimeout(poll, POLL_INTERVAL);
    }

    poll();

    return () => {
      stopped = true;
      if (tickTimer) clearTimeout(tickTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const autoRefresh = useCallback(async () => {
    if (saving || editingId !== null || refreshing) return;
    try {
      const result = await fetchExpenses({
        month, categoryType: filterType === 'ALL' ? undefined : filterType, page, size: PAGE_SIZE,
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

  async function saveCategory() {
    if (editingId === null) return;
    setSaving(true);
    try {
      await updateExpenseCategory(editingId, editCategoryId);
      toast.success('카테고리가 수정되었습니다.');
      setEditingId(null);
      await loadExpenses();
      fetchMonthlyStats(month).then(setStats).catch(() => {});
    } catch { toast.error('카테고리 수정에 실패했습니다.'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('이 지출을 삭제하시겠습니까?')) return;
    try {
      await deleteExpense(id);
      toast.success('삭제되었습니다.');
      await loadExpenses();
      fetchMonthlyStats(month).then(setStats).catch(() => {});
    } catch { toast.error('삭제에 실패했습니다.'); }
  }

  // ── 차트 데이터 ───────────────────────────────────────────
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
    expenses.forEach((e) => { catTotals[e.categoryName] = (catTotals[e.categoryName] ?? 0) + e.amount; });
    const labels = Object.keys(catTotals);
    return {
      chartLabels: labels,
      chartValues: labels.map((c) => catTotals[c]),
      chartColors: labels.map((c) => CAT_COLORS[c] ?? '#888'),
    };
  })();

  const chartTotal     = filterType === 'ALL' ? (stats?.totalAmount ?? 0) : totalAmount;
  const prevTotal      = stats?.previousMonthAmount ?? 0;
  const changePercent  = stats?.changePercent ?? 0;
  const isIncrease     = changePercent > 0;

  useDoughnutChart(canvasRef, chartLabels, chartValues, chartColors);

  const currentMonth = toYYYYMM(new Date());
  const isCurrentMonth = month >= currentMonth;
  const windowStart  = Math.max(0, Math.min(page - 2, totalPages - 5));
  const pageNumbers  = Array.from({ length: Math.min(5, totalPages) }, (_, i) => windowStart + i);

  if (syncing) {
    const steps = ['지출 내역 수집', '지출 분류', 'AI 카테고리 분석', '완료'];
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-8 shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          </div>
          <p className="mb-1 text-center text-base font-semibold">{syncPhase}</p>
          <p className="mb-6 text-center text-xs text-muted-foreground">곧 지출 내역이 표시됩니다.</p>

          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">진행률</span>
            <span className="font-semibold text-primary">{syncProgress}%</span>
          </div>
          <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-2 rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${syncProgress}%` }}
            />
          </div>

          <div className="space-y-2.5">
            {steps.map((label, i) => {
              const threshold = i * 25;
              const done   = syncProgress >= threshold + 25;
              const active = syncProgress >= threshold && !done;
              return (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold
                    ${done ? 'bg-primary text-white' : active ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                    {done ? '✓' : i + 1}
                  </span>
                  <span className={done ? 'text-foreground' : active ? 'font-medium text-primary' : 'text-muted-foreground'}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">

      {/* ── 헤더 ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">지출 내역</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={reload} disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm text-muted-foreground hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">새로고침</span>
          </button>
          <button onClick={() => setMonth((m) => shiftMonth(m, -1))} className="rounded-lg p-2 hover:bg-secondary">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="w-20 text-center text-base font-semibold sm:w-24 sm:text-lg">{formatMonth(month)}</span>
          <button
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
            disabled={isCurrentMonth}
            className="rounded-lg p-2 hover:bg-secondary disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── 월별 유형별 요약 카드 (전체 필터일 때) ── */}
      {filterType === 'ALL' && stats && (
        <div className="mb-6 grid grid-cols-3 gap-2 lg:gap-3">
          {[
            { label: '고정비',  amount: stats.fixedAmount,    key: '고정비'  },
            { label: '변동비',  amount: stats.variableAmount, key: '변동비'  },
            { label: '비정기',  amount: stats.etcAmount,      key: '비정기'  },
          ].map(({ label, amount, key }) => {
            const s   = TYPE_STAT[key];
            const pct = stats.totalAmount > 0 ? Math.round(amount / stats.totalAmount * 100) : 0;
            return (
              <div key={key} className={`rounded-2xl border ${s.border} ${s.bg} p-3 lg:p-4`}>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${s.dot}`} />
                  <p className={`text-xs font-medium ${s.text}`}>{label}</p>
                </div>
                <p className={`text-base font-bold lg:text-lg ${s.text}`}>
                  {amount >= 10_000
                    ? `${(amount / 10_000).toFixed(0)}만원`
                    : `${amount.toLocaleString()}원`}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{pct}%</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 필터 탭 ── */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
        {(['ALL', 'FIXED', 'VARIABLE', 'ETC'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filterType === type
                ? 'bg-primary text-white shadow-md'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {type === 'ALL' ? '전체' : TYPE_LABELS[type]}
          </button>
        ))}
        <span className="ml-auto shrink-0 text-sm text-muted-foreground">
          총 {totalElements.toLocaleString()}건
        </span>
      </div>

      {/* ── 본문: 목록 + 차트 ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_240px]">

        {/* 지출 목록 */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-white py-16 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">지출 내역을 불러오는 중...</p>
                <p className="mt-1 text-xs text-muted-foreground">카드 연동 직후라면 잠시 더 걸릴 수 있습니다.</p>
              </div>
              <div className="w-40 space-y-1.5">
                {['내역 조회', '카테고리 분류', '화면 구성'].map((label, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" style={{ animationDelay: `${i * 0.2}s` }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20">
              <Receipt className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">지출 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div
                  key={expense.expenseId}
                  className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3.5 shadow-sm transition-colors hover:bg-secondary/20"
                >
                  {/* 카테고리 타입 컬러 바 */}
                  <div className={`h-10 w-1 shrink-0 rounded-full ${TYPE_BAR[expense.categoryType]}`} />

                  {/* 가맹점·날짜 */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-sm">{expense.merchantName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {expense.expenseDate.slice(0, 10)} · {cardName(expense.cardCompany)}
                    </p>
                  </div>

                  {/* 우측 */}
                  <div className="flex items-center gap-2">
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
                          onClick={saveCategory} disabled={saving}
                          className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white disabled:opacity-60"
                        >
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : '저장'}
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-sm text-muted-foreground hover:text-foreground">
                          취소
                        </button>
                      </div>
                    ) : (
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_BADGE[expense.categoryType]}`}>
                        {expense.categoryName}
                      </span>
                    )}

                    <p className={`w-24 text-right text-sm font-semibold ${expense.amount < 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {expense.amount < 0
                        ? `+${Math.abs(expense.amount).toLocaleString('ko-KR')}원`
                        : `-${expense.amount.toLocaleString('ko-KR')}원`}
                    </p>

                    {editingId !== expense.expenseId && (
                      <div className="flex gap-0.5">
                        <button
                          onClick={() => { setEditingId(expense.expenseId); setEditCategoryId(expense.categoryId); }}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.expenseId)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                className="rounded-lg p-2 hover:bg-secondary disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {pageNumbers.map((n) => (
                <button
                  key={n} onClick={() => setPage(n)}
                  className={`h-9 w-9 rounded-lg text-sm transition-all ${
                    n === page ? 'bg-primary text-white shadow-md' : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  {n + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="rounded-lg p-2 hover:bg-secondary disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── 차트 패널 ── */}
        <div className="self-start rounded-2xl border border-border bg-white p-5 shadow-sm">
          {/* 총 지출 */}
          <p className="text-xs text-muted-foreground">
            {filterType === 'ALL' ? '이번 달 지출' : `${TYPE_LABELS[filterType as CategoryType]} 지출`}
          </p>
          <p className="mt-1 text-2xl font-bold text-red-500">
            -{chartTotal.toLocaleString()}원
          </p>
          {/* 전월 대비 */}
          {filterType === 'ALL' && prevTotal > 0 && (
            <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${isIncrease ? 'text-red-400' : 'text-emerald-500'}`}>
              {isIncrease ? '▲' : '▼'} 전월 대비 {Math.abs(Math.round(changePercent))}%
            </p>
          )}

          {/* 도넛 차트 */}
          <div className="relative mt-4 h-[160px] w-full">
            {chartValues.some(v => v > 0) ? (
              <canvas ref={canvasRef} role="img" aria-label="지출 비율 차트" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                차트 데이터가 없습니다
              </div>
            )}
          </div>

          {/* 범례 */}
          <div className="mt-4 space-y-2">
            {chartLabels.map((lbl, i) => {
              const positiveTotal = chartValues.reduce((s, v) => s + Math.max(0, v), 0);
              const pct = positiveTotal > 0 ? Math.round(Math.max(0, chartValues[i]) / positiveTotal * 100) : 0;
              const amt = chartValues[i];
              return (
                <div key={lbl}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: chartColors[i] }} />
                      {lbl}
                    </span>
                    <span className="font-semibold">{pct}%</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-secondary">
                      <div className="h-1 rounded-full transition-all" style={{ width: `${pct}%`, background: chartColors[i] }} />
                    </div>
                    <span className="w-16 text-right text-[10px] text-muted-foreground">
                      {amt >= 10_000 ? `${(amt / 10_000).toFixed(0)}만` : amt.toLocaleString()}원
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
