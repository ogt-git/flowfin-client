import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { motion, type Variants } from 'motion/react';
import {
  LayoutGrid, Loader2, RefreshCw, Sparkles, ChevronDown, ChevronUp,
  Brain, FileText, Calendar, Wallet, Shield,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchPortfolioStatus, fetchPortfolioHistory, recommendPortfolio } from '../../api/portfolio';
import type { Portfolio, PortfolioResult, RecommendedAsset } from '../../types/portfolio';

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

const RISK_LABEL: Record<string, { label: string; color: string; bg: string; border: string }> = {
  CONSERVATIVE:            { label: '안정형',    color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200'   },
  MODERATELY_CONSERVATIVE: { label: '안정추구형', color: 'text-teal-700',   bg: 'bg-teal-50',   border: 'border-teal-200'   },
  MODERATE:                { label: '위험중립형', color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200'  },
  MODERATELY_AGGRESSIVE:   { label: '적극투자형', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  AGGRESSIVE:              { label: '공격투자형', color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200'    },
};

const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS  = 3 * 60 * 1000;

function formatAmount(n: number | undefined | null) {
  if (n == null) return '-';
  if (Math.abs(n) >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (Math.abs(n) >= 10_000)      return `${(n / 10_000).toFixed(0)}만`;
  return n.toLocaleString();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function getAssets(p: Portfolio): RecommendedAsset[] {
  return p.recommendedAssets ?? p.allocation ?? [];
}

function getRiskType(p: Portfolio): string {
  return p.riskType ?? p.portfolioRiskType ?? '';
}

function resultToPortfolio(result: PortfolioResult, portfolioId?: number, createdAt?: string): Portfolio {
  return {
    portfolioId,
    investableAmount: result.investableAmount,
    riskType: result.riskType,
    recommendedAssets: result.allocation,
    summary: result.summary,
    aiDiagnosis: result.aiDiagnosis,
    status: 'COMPLETED',
    createdAt: createdAt ?? new Date().toISOString(),
  };
}

function RiskBadge({ riskType }: { riskType: string }) {
  const info = RISK_LABEL[riskType] ?? { label: riskType, color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200' };
  return (
    <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${info.bg} ${info.color} ${info.border}`}>
      {info.label}
    </span>
  );
}

function AllocationRow({ asset, index }: { asset: RecommendedAsset; index: number }) {
  const color = CHART_COLORS[index % CHART_COLORS.length];
  const desc  = asset.reason ?? asset.description;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-white px-4 py-3.5 shadow-sm transition-colors hover:bg-secondary/20">
      <div className="mt-0.5 h-10 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="font-semibold text-sm">{asset.assetClass}</p>
          {asset.subCategory && (
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {asset.subCategory}
            </span>
          )}
        </div>
        {desc && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-1.5 rounded-full transition-all duration-700"
            style={{ width: `${asset.ratio}%`, backgroundColor: color }}
          />
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xl font-bold" style={{ color }}>{asset.ratio}%</p>
        <p className="text-xs text-muted-foreground">{formatAmount(asset.amount)}원</p>
      </div>
    </div>
  );
}

function HistoryItem({ portfolio }: { portfolio: Portfolio }) {
  const [open, setOpen] = useState(false);
  const assets   = getAssets(portfolio);
  const riskType = getRiskType(portfolio);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-secondary/30"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{formatDate(portfolio.createdAt)}</span>
          <RiskBadge riskType={riskType} />
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            투자가능 {formatAmount(portfolio.investableAmount)}원
          </span>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="space-y-2 border-t border-border px-5 pb-4 pt-3">
          {assets.map((a, i) => <AllocationRow key={i} asset={a} index={i} />)}
        </div>
      )}
    </div>
  );
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio]       = useState<Portfolio | null>(null);
  const [history, setHistory]           = useState<Portfolio[]>([]);
  const [loading, setLoading]           = useState(true);
  const [polling, setPolling]           = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [canRecommend, setCanRecommend] = useState(true);
  const [error, setError]               = useState(false);

  const pollingRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { load(); return () => stopPolling(); }, []);

  function stopPolling() {
    if (pollingRef.current)        { clearInterval(pollingRef.current);  pollingRef.current = null; }
    if (pollingTimeoutRef.current) { clearTimeout(pollingTimeoutRef.current); pollingTimeoutRef.current = null; }
    setPolling(false);
  }

  function startPolling(oldPortfolioId?: number) {
    stopPolling();
    setPolling(true);
    let seenPending = false;

    pollingRef.current = setInterval(async () => {
      try {
        const s = await fetchPortfolioStatus();
        setCanRecommend(s.canRecommend);
        if (s.status === 'PENDING' || s.pendingExists) seenPending = true;
        if (s.status === 'COMPLETED' && s.result) {
          const isNew = oldPortfolioId === undefined || seenPending || s.portfolioId !== oldPortfolioId;
          if (!isNew) return;
          stopPolling();
          const p = resultToPortfolio(s.result, s.portfolioId, s.lastRecommendedAt);
          setPortfolio(p);
          fetchPortfolioHistory().then(setHistory).catch(() => {});
          toast.success('포트폴리오 추천이 완료되었습니다!');
        } else if (s.status === 'FAILED') {
          stopPolling();
          toast.error('포트폴리오 추천에 실패했습니다. 다시 시도해주세요.');
        }
      } catch { stopPolling(); }
    }, POLL_INTERVAL_MS);

    pollingTimeoutRef.current = setTimeout(() => {
      stopPolling();
      toast.error('분석이 오래 걸리고 있습니다. 잠시 후 페이지를 새로고침해주세요.');
    }, POLL_TIMEOUT_MS);
  }

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const [statusResult, historyResult] = await Promise.allSettled([
        fetchPortfolioStatus(), fetchPortfolioHistory(),
      ]);
      if (statusResult.status === 'fulfilled') {
        const s = statusResult.value;
        setCanRecommend(s.canRecommend);
        if (s.pendingExists || s.status === 'PENDING') startPolling();
        else if (s.status === 'COMPLETED' && s.result)
          setPortfolio(resultToPortfolio(s.result, s.portfolioId, s.lastRecommendedAt));
      } else {
        setError(true);
      }
      if (historyResult.status === 'fulfilled') setHistory(historyResult.value);
    } finally { setLoading(false); }
  }

  async function handleRecommend() {
    setRecommending(true);
    try {
      const res = await recommendPortfolio();
      if (res.accepted) {
        startPolling(portfolio?.portfolioId);
      } else if (res.needAssetLink) {
        toast.error('포트폴리오 추천을 위해 자산을 먼저 연동해주세요.');
      } else if (res.result) {
        const p = resultToPortfolio(res.result);
        setPortfolio(p);
        fetchPortfolioHistory().then(setHistory).catch(() => {});
        toast.success('포트폴리오 추천이 완료되었습니다!');
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg    = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (status === 429)      toast.error(msg ?? '잠시 후 다시 시도해주세요. (5분 쿨다운)');
      else if (status === 400) toast.error(msg ?? '투자 성향을 먼저 설정해주세요. (마이페이지 → 회원정보)');
      else                     toast.error('포트폴리오 추천 요청에 실패했습니다.');
    } finally { setRecommending(false); }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">포트폴리오 정보를 불러오지 못했습니다.</p>
        <button onClick={load} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm text-white hover:bg-primary/90">
          <RefreshCw className="h-4 w-4" /> 다시 시도
        </button>
      </div>
    );
  }

  const assets    = portfolio ? getAssets(portfolio) : [];
  const riskType  = portfolio ? getRiskType(portfolio) : '';
  const chartData = assets.map((a) => ({ name: a.assetClass, value: a.ratio }));

  return (
    <motion.div className="p-4 lg:p-8" variants={containerVariants} initial="hidden" animate="visible">

      {/* 헤더 */}
      <motion.div variants={itemVariants} className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <LayoutGrid className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI 포트폴리오</h2>
            <p className="text-xs text-muted-foreground">투자 성향 기반 맞춤 자산배분</p>
          </div>
        </div>
        <button
          onClick={handleRecommend}
          disabled={polling || recommending || !canRecommend}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-primary/90 disabled:opacity-60"
        >
          {recommending || polling
            ? <><Loader2 className="h-4 w-4 animate-spin" /> 분석 중...</>
            : <><Sparkles className="h-4 w-4" /> {canRecommend ? 'AI 추천받기' : '재추천 준비 중'}</>
          }
        </button>
      </motion.div>

      {/* 분석 중 배너 */}
      {polling && (
        <motion.div variants={itemVariants} className="mb-8 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-4 px-6 py-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            <div>
              <p className="font-semibold text-primary">AI가 포트폴리오를 분석 중입니다</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                최대 3분 정도 소요될 수 있습니다. 페이지를 닫아도 분석은 계속 진행됩니다.
              </p>
            </div>
          </div>
          <div className="h-1 bg-primary/10">
            <div className="h-1 animate-pulse rounded-full bg-primary/50" style={{ width: '60%' }} />
          </div>
        </motion.div>
      )}

      {/* 포트폴리오 없음 */}
      {portfolio === null && !polling && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-border py-24"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">아직 추천된 포트폴리오가 없어요</p>
            <p className="mt-1.5 text-sm text-muted-foreground">AI 추천받기 버튼을 눌러 맞춤형 자산배분을 받아보세요</p>
          </div>
          <button
            onClick={handleRecommend}
            disabled={polling || recommending || !canRecommend}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" /> AI 추천받기
          </button>
        </motion.div>
      )}

      {portfolio !== null && (
        <>
          {/* 요약 카드 3개 */}
          <motion.div variants={itemVariants} className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">투자 성향</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
              </div>
              <RiskBadge riskType={riskType} />
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">투자 가능 금액</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50">
                  <Wallet className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">
                {formatAmount(portfolio.investableAmount)}
                <span className="ml-1 text-base font-medium text-muted-foreground">원</span>
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">마지막 추천일</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-2xl font-bold">{formatDate(portfolio.createdAt)}</p>
            </div>
          </motion.div>

          {/* AI 진단 + 추천 요약 */}
          {(portfolio.aiDiagnosis || portfolio.summary) && (
            <motion.div variants={itemVariants} className="mb-6 grid gap-4 lg:grid-cols-2">
              {portfolio.aiDiagnosis && (
                <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                      <Brain className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-sm font-semibold">AI 진단</p>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{portfolio.aiDiagnosis}</p>
                </div>
              )}
              {portfolio.summary && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-primary">추천 요약</p>
                  </div>
                  <p className="text-sm leading-relaxed text-primary/80">{portfolio.summary}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* 추천 자산 배분 */}
          <motion.div variants={itemVariants} className="mb-6">
            <h3 className="mb-4 font-semibold">추천 자산 배분</h3>
            <div className="grid gap-6 lg:grid-cols-5">
              {/* 도넛 차트 + 커스텀 범례 */}
              <div className="rounded-2xl border border-border bg-white p-5 shadow-sm lg:col-span-2">
                <div className="relative">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={85}
                        paddingAngle={3} dataKey="value"
                      >
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number) => [`${v}%`, '비중']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-[10px] text-muted-foreground">자산배분</p>
                    <p className="text-base font-bold">{assets.length}개 자산군</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2.5 border-t border-border pt-4">
                  {chartData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <p className="flex-1 truncate text-xs text-muted-foreground">{d.name}</p>
                      <p className="text-xs font-bold">{d.value}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 자산 배분 행 */}
              <div className="space-y-3 lg:col-span-3">
                {assets.map((asset, i) => <AllocationRow key={i} asset={asset} index={i} />)}
              </div>
            </div>
          </motion.div>

          {/* 유의사항 — 원본 텍스트 유지 */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
              <p className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-700">
                <span>⚠️</span> 포트폴리오 유의사항 안내
              </p>
              <ul className="space-y-1.5 text-xs leading-relaxed text-amber-700/80">
                <li>• 본 포트폴리오는 사용자의 금융 데이터를 기반으로 AI가 작성한 참고용 리포트이며 틀릴 수 있습니다.</li>
                <li>• 당사는 투자 자문 형태의 정보만 제공할 뿐, 투자 결과로 인한 손실에 대해 책임을 질 수 없습니다.</li>
                <li>• 금융투자상품은 원금 손실 가능성이 존재합니다. 투자 결정은 본인의 책임 하에 신중히 진행해 주시기 바랍니다.</li>
              </ul>
            </div>
          </motion.div>

          {/* 추천 이력 */}
          {history.length > 1 && (
            <motion.div variants={itemVariants}>
              <h3 className="mb-4 font-semibold">추천 이력</h3>
              <div className="space-y-3">
                {history.slice(1).map((p, i) => (
                  <HistoryItem key={p.portfolioId ?? p.id ?? i} portfolio={p} />
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
