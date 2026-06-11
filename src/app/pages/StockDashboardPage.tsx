import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router';
import { motion, type Variants } from 'motion/react';
import {
  TrendingUp, TrendingDown, RefreshCw, PlusCircle, Loader2, Trash2,
  BarChart2, Wallet, Target, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchAssetSummary, fetchStocks, fetchManualAssets, deleteManualAsset } from '../../api/assets';
import { syncStock, fetchSyncStatus } from '../../api/codef';
import type { AssetSummaryData, StockAccount, StockItem, ManualAssetItem } from '../../types/asset';
import { STOCK_ORGANIZATIONS } from '../../types/card';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const CHART_COLORS = [
  '#0A3D5C', '#10B981', '#3B82F6', '#F59E0B',
  '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6',
];

function formatAmount(n: number | undefined | null) {
  const v = n ?? 0;
  if (Math.abs(v) >= 100_000_000) return `${(v / 100_000_000).toFixed(1)}억`;
  if (Math.abs(v) >= 10_000) return `${(v / 10_000).toFixed(0)}만`;
  return v.toLocaleString();
}

function formatMoney(n: number | undefined | null) {
  const v = n ?? 0;
  return `${v < 0 ? '-' : ''}${Math.abs(v).toLocaleString()}원`;
}

// ── 요약 카드 ──────────────────────────────────────────────
type CardAccent = 'emerald' | 'red' | 'primary' | 'default';

const accentStyles: Record<CardAccent, { wrap: string; icon: string; value: string }> = {
  emerald: { wrap: 'bg-emerald-50 border-emerald-200',  icon: 'bg-emerald-100 text-emerald-600', value: 'text-emerald-600' },
  red:     { wrap: 'bg-red-50 border-red-200',          icon: 'bg-red-100 text-red-500',         value: 'text-red-500'     },
  primary: { wrap: 'bg-primary/5 border-primary/20',    icon: 'bg-primary/10 text-primary',      value: ''                 },
  default: { wrap: 'bg-white border-border',            icon: 'bg-secondary text-muted-foreground', value: ''              },
};

function SummaryCard({
  label, value, sub, positive, icon, accent = 'default',
}: {
  label: string; value: string; sub?: string;
  positive?: boolean; icon: React.ReactNode; accent?: CardAccent;
}) {
  const s = accentStyles[accent];
  return (
    <div className={`rounded-2xl border ${s.wrap} p-5 shadow-sm`}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${s.icon}`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold ${s.value}`}>{value}</p>
      {sub && (
        <p className={`mt-1 flex items-center gap-0.5 text-xs font-medium ${
          positive === true ? 'text-emerald-600' : positive === false ? 'text-red-500' : 'text-muted-foreground'
        }`}>
          {positive === true  && <ArrowUpRight   className="h-3.5 w-3.5" />}
          {positive === false && <ArrowDownRight className="h-3.5 w-3.5" />}
          {sub}
        </p>
      )}
    </div>
  );
}

// ── 종목 행 ────────────────────────────────────────────────
function StockRow({
  item, index, maxValuation,
}: {
  item: StockItem & { brokerName: string };
  index: number;
  maxValuation: number;
}) {
  const pl     = item.valuationPl ?? 0;
  const rate   = Number(item.earningsRate ?? 0);
  const isPos  = pl >= 0;
  const barPct = maxValuation > 0 ? Math.round((item.valuationAmt / maxValuation) * 100) : 0;

  return (
    <tr className={`border-b border-border/50 transition-colors hover:bg-secondary/20 ${index % 2 !== 0 ? 'bg-secondary/10' : ''}`}>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`h-8 w-1 shrink-0 rounded-full ${isPos ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <div>
            <p className="font-medium text-sm">{item.itemName}</p>
            <p className="text-xs text-muted-foreground">{item.itemCode} · {item.brokerName}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-sm text-right text-muted-foreground">
        {(item.quantity ?? 0).toLocaleString()}
      </td>
      <td className="px-4 py-3.5 text-sm text-right text-muted-foreground">
        {(item.purchaseAmount ?? 0).toLocaleString()}원
      </td>
      <td className="px-4 py-3.5 text-sm text-right">
        <p className="font-medium">{(item.valuationAmt ?? 0).toLocaleString()}원</p>
        <div className="mt-1.5 h-1 w-full rounded-full bg-secondary">
          <div className="h-1 rounded-full bg-primary/50 transition-all" style={{ width: `${barPct}%` }} />
        </div>
      </td>
      <td className={`px-4 py-3.5 text-sm text-right font-semibold ${isPos ? 'text-emerald-600' : 'text-red-500'}`}>
        {isPos ? '+' : ''}{pl.toLocaleString()}원
      </td>
      <td className="px-4 py-3.5 text-right">
        <span className={`inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-xs font-semibold ${
          isPos ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
        }`}>
          {isPos ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(rate).toFixed(2)}%
        </span>
      </td>
    </tr>
  );
}

// ── 차트 커스텀 범례 ────────────────────────────────────────
function ChartLegend({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="mt-4 space-y-2">
      {data.map((d, i) => {
        const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
        return (
          <div key={d.name} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
            <p className="flex-1 truncate text-xs text-muted-foreground">{d.name}</p>
            <p className="text-xs font-medium">{pct}%</p>
            <p className="w-20 text-right text-xs text-muted-foreground">{formatAmount(d.value)}원</p>
          </div>
        );
      })}
    </div>
  );
}

// ── 자산 유형 배지 ──────────────────────────────────────────
const ASSET_TYPE_LABELS: Record<string, string> = {
  DEPOSIT: '예금', SAVINGS: '적금', REAL_ESTATE: '부동산',
  CASH: '현금', PENSION: '연금', ETC: '기타',
};
const ASSET_TYPE_COLORS: Record<string, string> = {
  DEPOSIT:     'bg-blue-100 text-blue-700',
  SAVINGS:     'bg-emerald-100 text-emerald-700',
  REAL_ESTATE: 'bg-amber-100 text-amber-700',
  CASH:        'bg-slate-100 text-slate-600',
  PENSION:     'bg-purple-100 text-purple-700',
  ETC:         'bg-gray-100 text-gray-500',
};

function buildChartData(items: StockItem[]) {
  return items
    .filter((i) => i.valuationAmt > 0)
    .sort((a, b) => b.valuationAmt - a.valuationAmt)
    .slice(0, 8)
    .map((i) => ({ name: i.itemName, value: i.valuationAmt }));
}

// ── 메인 컴포넌트 ──────────────────────────────────────────
const STOCK_SYNC_KEY = 'flowfin_stock_syncing';

export default function StockDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const justLinked = !!(location.state as { justLinked?: boolean } | null)?.justLinked;

  const STOCK_PROGRESS_KEY = STOCK_SYNC_KEY + '_progress';
  const [syncProgress, setSyncProgress] = useState(() => {
    if (justLinked) return 0;
    return parseInt(sessionStorage.getItem(STOCK_SYNC_KEY + '_progress') ?? '0', 10);
  });
  const [stockSyncing, setStockSyncing] = useState(() => {
    if (justLinked) { sessionStorage.setItem(STOCK_SYNC_KEY, 'true'); return true; }
    return sessionStorage.getItem(STOCK_SYNC_KEY) === 'true';
  });
  const syncPhase = syncProgress < 30 ? '증권 데이터를 수집하는 중...'
                  : syncProgress < 70 ? '종목 정보를 불러오는 중...'
                  : syncProgress < 95 ? '보유 종목을 정리하는 중...'
                  : '거의 다 됐어요!';

  const dataPreparedRef = useRef(false);

  const [assetSummary, setAssetSummary]   = useState<AssetSummaryData | null>(null);
  const [stocks, setStocks]               = useState<StockAccount[]>([]);
  const [manualAssets, setManualAssets]   = useState<ManualAssetItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [syncing, setSyncing]             = useState(false);
  const [stockError, setStockError]       = useState(false);

  async function load() {
    setLoading(true);
    setStockError(false);
    const [summaryResult, stocksResult, manualResult] = await Promise.allSettled([
      fetchAssetSummary(), fetchStocks(), fetchManualAssets(),
    ]);
    if (summaryResult.status === 'fulfilled') setAssetSummary(summaryResult.value);
    if (stocksResult.status === 'fulfilled') setStocks(stocksResult.value);
    else setStockError(true);
    if (manualResult.status === 'fulfilled') setManualAssets(manualResult.value);
    setLoading(false);
  }

  async function handleDeleteManual(id: number) {
    try {
      await deleteManualAsset(id);
      setManualAssets((prev) => prev.filter((a) => a.id !== id));
      fetchAssetSummary().then(setAssetSummary).catch(() => {});
    } catch { /* no-op */ }
  }

  async function handleRefresh() {
    setSyncing(true);
    try {
      const result = await syncStock();
      toast.success(result?.savedCount === 0 ? '업데이트된 자산 정보가 없습니다.' : '자산 정보가 동기화되었습니다.');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      toast.error(status === 429 ? '5분에 한 번만 새로고침할 수 있습니다.' : '자산 동기화에 실패했습니다.');
    } finally {
      await load();
      setSyncing(false);
    }
  }

  useEffect(() => {
    if (!stockSyncing) {
      if (dataPreparedRef.current) {
        dataPreparedRef.current = false;
        setLoading(false);
        return;
      }
      load();
    }
  }, [stockSyncing]);

  useEffect(() => {
    if (!stockSyncing) return;

    const MAX_WAIT = 120_000;
    const POLL_INTERVAL = 4_000;
    const MIN_DISPLAY = 3_000;
    const startTime = Date.now();
    let stopped = false;
    let isComplete = false;
    let progress = parseInt(sessionStorage.getItem(STOCK_PROGRESS_KEY) ?? '0', 10);
    let tickTimer: ReturnType<typeof setTimeout> | null = null;

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
      sessionStorage.setItem(STOCK_PROGRESS_KEY, String(rounded));

      if (rounded >= 100) {
        // poll에서 이미 데이터를 state에 넣어뒀으므로 바로 화면 전환
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, MIN_DISPLAY - elapsed) + 3_400;
        setTimeout(() => {
          if (!stopped) {
            stopped = true;
            sessionStorage.removeItem(STOCK_SYNC_KEY);
            sessionStorage.removeItem(STOCK_PROGRESS_KEY);
            setStockSyncing(false);
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
        const syncStatus = await fetchSyncStatus('STOCK');
        if (syncStatus === 'SYNCING') {
          if (Date.now() - startTime < MAX_WAIT) {
            setTimeout(poll, POLL_INTERVAL);
          } else {
            stopped = true;
            if (tickTimer) clearTimeout(tickTimer);
            sessionStorage.removeItem(STOCK_SYNC_KEY);
            sessionStorage.removeItem(STOCK_PROGRESS_KEY);
            setStockSyncing(false);
          }
          return;
        }

        const result = await fetchStocks();
        if (result.length > 0) {
          const [summaryResult, manualResult] = await Promise.allSettled([
            fetchAssetSummary(), fetchManualAssets(),
          ]);
          if (summaryResult.status === 'fulfilled') setAssetSummary(summaryResult.value);
          setStocks(result);
          setStockError(false);
          if (manualResult.status === 'fulfilled') setManualAssets(manualResult.value);
          dataPreparedRef.current = true;
          isComplete = true;
          return;
        } else if (syncStatus === 'FAILED') {
          isComplete = true;
          return;
        }
      } catch { /* silent */ }

      if (Date.now() - startTime >= MAX_WAIT) {
        stopped = true;
        if (tickTimer) clearTimeout(tickTimer);
        sessionStorage.removeItem(STOCK_SYNC_KEY);
        sessionStorage.removeItem(STOCK_PROGRESS_KEY);
        setStockSyncing(false);
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
    if (syncing) return;
    const [summaryResult, stocksResult, manualResult] = await Promise.allSettled([
      fetchAssetSummary(), fetchStocks(), fetchManualAssets(),
    ]);
    if (summaryResult.status === 'fulfilled') setAssetSummary(summaryResult.value);
    if (stocksResult.status === 'fulfilled') { setStocks(stocksResult.value); setStockError(false); }
    if (manualResult.status === 'fulfilled') setManualAssets(manualResult.value);
  }, [syncing]);

  useEffect(() => {
    const id = setInterval(autoRefresh, 30_000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  const allItems = stocks.flatMap((a) => {
    const brokerName = STOCK_ORGANIZATIONS.find((o) => o.code === a.brokerCode)?.name ?? a.brokerCode;
    return a.items.map((item) => ({ ...item, brokerName }));
  });
  const chartData         = buildChartData(allItems);
  const totalValuationPl  = allItems.reduce((s, i) => s + (i.valuationPl ?? 0), 0);
  const isPositive        = totalValuationPl >= 0;
  const maxValuation      = Math.max(...allItems.map((i) => i.valuationAmt ?? 0), 1);
  const totalStockAsset   = assetSummary
    ? assetSummary.totalStockAsset + assetSummary.totalManualAsset + assetSummary.depositReceived
    : 0;

  if (stockSyncing) {
    const steps = ['증권 데이터 수집', '종목 정보 불러오기', '보유 종목 정리', '완료'];
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-8 shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          </div>
          <p className="mb-1 text-center text-base font-semibold">{syncPhase}</p>
          <p className="mb-6 text-center text-xs text-muted-foreground">곧 증권 현황이 표시됩니다.</p>

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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div className="p-4 lg:p-8" variants={containerVariants} initial="hidden" animate="visible">

      {/* ── 헤더 ── */}
      <motion.div variants={itemVariants} className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <BarChart2 className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">증권 현황</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh} disabled={syncing}
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm text-muted-foreground hover:bg-secondary disabled:opacity-60 lg:px-4"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{syncing ? '동기화 중...' : '새로고침'}</span>
          </button>
          <button
            onClick={() => navigate('/asset/link')}
            className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-white hover:bg-primary/90 lg:px-4"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">증권 계좌 연동</span>
          </button>
        </div>
      </motion.div>

      {/* ── 전체 자산 배너 ── */}
      {assetSummary && (
        <>
          <motion.div
            variants={itemVariants}
            className="relative mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white shadow-xl lg:p-8"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
            <div className="relative z-10">
              <p className="mb-1 text-sm text-white/70">전체 자산 총합</p>
              <p className="mb-5 text-4xl font-bold tracking-tight lg:text-5xl" style={{ fontFamily: 'var(--font-family-display)' }}>
                {formatAmount(totalStockAsset)}원
              </p>
              <div className="grid grid-cols-3 divide-x divide-white/20">
                {[
                  { label: '예수금',    val: assetSummary.depositReceived     },
                  { label: '증권 자산',      val: assetSummary.totalStockAsset     },
                  { label: '수동 자산', val: assetSummary.totalManualAsset    },
                ].map((item) => (
                  <div key={item.label} className="px-4 first:pl-0 last:pr-0">
                    <p className="text-xs text-white/60">{item.label}</p>
                    <p className="mt-0.5 text-sm font-semibold">{formatAmount(item.val)}원</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── 요약 카드 4개 ── */}
          <motion.div variants={itemVariants} className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="증권 총 자산"
              value={`${formatAmount(assetSummary.totalStockAsset)}원`}
              icon={<BarChart2 className="h-4 w-4" />}
              accent="primary"
            />
            <SummaryCard
              label="예수금"
              value={`${formatAmount(assetSummary.depositReceived)}원`}
              icon={<Wallet className="h-4 w-4" />}
            />
            <SummaryCard
              label="평가 손익"
              value={`${isPositive ? '+' : ''}${formatAmount(totalValuationPl)}원`}
              sub={isPositive ? '수익 중' : '손실 중'}
              positive={isPositive}
              icon={isPositive
                ? <TrendingUp className="h-4 w-4" />
                : <TrendingDown className="h-4 w-4" />}
              accent={isPositive ? 'emerald' : 'red'}
            />
            <SummaryCard
              label="투자 가능 금액"
              value={`${formatAmount(assetSummary.investableAmount)}원`}
              icon={<Target className="h-4 w-4" />}
              accent="primary"
            />
          </motion.div>
        </>
      )}

      {/* ── 증권사별 계좌 ── */}
      {!stockError && stocks.length > 0 && (
        <motion.div variants={itemVariants} className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stocks.map((acc) => {
            const brokerName = STOCK_ORGANIZATIONS.find((o) => o.code === acc.brokerCode)?.name ?? acc.brokerCode;
            const pct = totalStockAsset > 0
              ? Math.round((acc.totalAsset / totalStockAsset) * 100)
              : 0;
            const initial = brokerName.charAt(0);
            return (
              <div key={acc.accountNo} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{brokerName}</p>
                    <p className="truncate text-xs text-muted-foreground">{acc.accountNo}</p>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground">{pct}%</span>
                </div>
                <p className="mb-2 text-lg font-bold text-primary">{formatAmount(acc.totalAsset)}원</p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">예수금 {formatAmount(acc.depositReceived)}원</p>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* ── 종목 / 차트 ── */}
      {stockError ? (
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-12">
          <p className="text-sm text-muted-foreground">증권 정보를 불러오지 못했습니다.</p>
          <button onClick={load} className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm hover:bg-secondary">
            <RefreshCw className="h-4 w-4" /> 다시 시도
          </button>
        </motion.div>
      ) : allItems.length === 0 ? (
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <TrendingUp className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <div className="text-center">
            <p className="font-medium text-muted-foreground">보유 종목이 없습니다</p>
            <p className="mt-1 text-sm text-muted-foreground/70">증권 계좌를 연동하면 자동으로 불러옵니다</p>
          </div>
          <button
            onClick={() => navigate('/asset/link')}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm text-white hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4" /> 계좌 연동하기
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 종목 테이블 */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h3 className="mb-3 font-semibold">보유 종목</h3>
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">종목</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">수량</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">구매가</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">평가금액</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">평가손익</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">수익률</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allItems.map((item, i) => (
                      <StockRow
                        key={`${item.itemCode}-${i}`}
                        item={item}
                        index={i}
                        maxValuation={maxValuation}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* 도넛 차트 + 커스텀 범례 */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-3 font-semibold">자산 구성</h3>
            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="relative">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatMoney(value), '평가금액']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* 도넛 중앙 총액 */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs text-muted-foreground">총 평가</p>
                  <p className="text-sm font-bold text-foreground">
                    {formatAmount(allItems.reduce((s, i) => s + (i.valuationAmt ?? 0), 0))}원
                  </p>
                </div>
              </div>
              <ChartLegend data={chartData} />
            </div>
          </motion.div>
        </div>
      )}

      {/* ── 수동 자산 ── */}
      <motion.div variants={itemVariants} className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">수동 등록 자산</h3>
          <button
            onClick={() => navigate('/asset/link', { state: { tab: 'manual' } })}
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm text-muted-foreground hover:bg-secondary"
          >
            <PlusCircle className="h-4 w-4" /> 자산 추가
          </button>
        </div>

        {manualAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-12">
            <p className="text-sm text-muted-foreground">등록된 수동 자산이 없습니다.</p>
            <button
              onClick={() => navigate('/asset/link', { state: { tab: 'manual' } })}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
            >
              <PlusCircle className="h-4 w-4" /> 자산 등록하기
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    <th className="px-4 py-3 text-left   text-xs font-medium text-muted-foreground">자산명</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">유형</th>
                    <th className="px-4 py-3 text-right  text-xs font-medium text-muted-foreground">취득가액</th>
                    <th className="px-4 py-3 text-right  text-xs font-medium text-muted-foreground">현재가액</th>
                    <th className="px-4 py-3 text-right  text-xs font-medium text-muted-foreground">평가손익</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">취득일</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {manualAssets.map((asset, i) => {
                    const pl    = (asset.valuationAmt ?? 0) - (asset.purchaseAmount ?? 0);
                    const isPos = pl >= 0;
                    const typeColor = ASSET_TYPE_COLORS[asset.assetType] ?? 'bg-gray-100 text-gray-500';
                    return (
                      <tr
                        key={asset.id}
                        className={`border-b border-border/50 transition-colors hover:bg-secondary/20 ${i % 2 !== 0 ? 'bg-secondary/10' : ''}`}
                      >
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-sm">{asset.itemName}</p>
                          {asset.memo && <p className="text-xs text-muted-foreground">{asset.memo}</p>}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColor}`}>
                            {ASSET_TYPE_LABELS[asset.assetType] ?? asset.assetType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right text-sm text-muted-foreground">
                          {(asset.purchaseAmount ?? 0).toLocaleString()}원
                        </td>
                        <td className="px-4 py-3.5 text-right text-sm font-medium">
                          {(asset.valuationAmt ?? 0).toLocaleString()}원
                        </td>
                        <td className={`px-4 py-3.5 text-right text-sm font-semibold ${isPos ? 'text-emerald-600' : 'text-red-500'}`}>
                          <span className={`inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-xs ${isPos ? 'bg-emerald-50' : 'bg-red-50'}`}>
                            {isPos ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {isPos ? '+' : ''}{pl.toLocaleString()}원
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center text-xs text-muted-foreground">
                          {asset.purchaseDate ?? '-'}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => handleDeleteManual(asset.id)}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
