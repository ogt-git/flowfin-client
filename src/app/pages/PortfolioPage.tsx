import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { motion, type Variants } from 'motion/react';
import { LayoutGrid, Loader2, RefreshCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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

const RISK_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  CONSERVATIVE:            { label: '안정형',     color: 'text-blue-700',    bg: 'bg-blue-50' },
  MODERATELY_CONSERVATIVE: { label: '안정추구형',  color: 'text-teal-700',    bg: 'bg-teal-50' },
  MODERATE:                { label: '위험중립형',  color: 'text-green-700',   bg: 'bg-green-50' },
  MODERATELY_AGGRESSIVE:   { label: '적극투자형',  color: 'text-orange-700',  bg: 'bg-orange-50' },
  AGGRESSIVE:              { label: '공격투자형',  color: 'text-red-700',     bg: 'bg-red-50' },
};

const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS  = 3 * 60 * 1000; // 3분

function formatAmount(n: number | undefined | null) {
  if (n == null) return '-';
  if (Math.abs(n) >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (Math.abs(n) >= 10_000) return `${(n / 10_000).toFixed(0)}만`;
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
  const info = RISK_LABEL[riskType] ?? { label: riskType, color: 'text-gray-700', bg: 'bg-gray-100' };
  return (
    <span className={`rounded-full px-3 py-1 text-sm font-medium ${info.bg} ${info.color}`}>
      {info.label}
    </span>
  );
}

function AllocationRow({ asset, index }: { asset: RecommendedAsset; index: number }) {
  const desc = asset.reason ?? asset.description;
  return (
    <div className={`flex items-center gap-4 rounded-xl px-4 py-3 ${index % 2 === 0 ? 'bg-white' : 'bg-secondary/30'}`}>
      <div className="flex h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
      <div className="flex-1">
        <p className="font-medium text-sm">{asset.assetClass}</p>
        {asset.subCategory && <p className="text-xs text-muted-foreground">{asset.subCategory}</p>}
        {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">{asset.ratio}%</p>
        <p className="text-xs text-muted-foreground">{formatAmount(asset.amount)}원</p>
      </div>
      <div className="w-24">
        <div className="h-1.5 w-full rounded-full bg-secondary">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: `${asset.ratio}%`, backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
          />
        </div>
      </div>
    </div>
  );
}

function HistoryItem({ portfolio }: { portfolio: Portfolio }) {
  const [open, setOpen] = useState(false);
  const assets = getAssets(portfolio);
  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{formatDate(portfolio.createdAt)}</span>
          <RiskBadge riskType={getRiskType(portfolio)} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">투자가능 {formatAmount(portfolio.investableAmount)}원</span>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-border px-5 pb-4 pt-3 space-y-2">
          {assets.map((a, i) => <AllocationRow key={i} asset={a} index={i} />)}
        </div>
      )}
    </div>
  );
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio]     = useState<Portfolio | null>(null);
  const [history, setHistory]         = useState<Portfolio[]>([]);
  const [loading, setLoading]         = useState(true);
  const [polling, setPolling]         = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [canRecommend, setCanRecommend] = useState(true);
  const [error, setError]             = useState(false);

  const pollingRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    load();
    return () => stopPolling();
  }, []);

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

        if (s.status === 'PENDING' || s.pendingExists) {
          seenPending = true;
        }

        if (s.status === 'COMPLETED' && s.result) {
          // 이전 결과와 동일한 COMPLETED를 새 결과로 오인하지 않도록 검증
          const isNew = oldPortfolioId === undefined
            || seenPending
            || s.portfolioId !== oldPortfolioId;
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
      } catch {
        stopPolling();
      }
    }, POLL_INTERVAL_MS);

    // 3분 후 자동 타임아웃
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
        fetchPortfolioStatus(),
        fetchPortfolioHistory(),
      ]);

      if (statusResult.status === 'fulfilled') {
        const s = statusResult.value;
        setCanRecommend(s.canRecommend);

        if (s.pendingExists || s.status === 'PENDING') {
          startPolling();
        } else if (s.status === 'COMPLETED' && s.result) {
          setPortfolio(resultToPortfolio(s.result, s.portfolioId, s.lastRecommendedAt));
        }
      } else {
        setError(true);
      }

      if (historyResult.status === 'fulfilled') {
        setHistory(historyResult.value);
      }
    } finally {
      setLoading(false);
    }
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
        // 캐시 히트 — 즉시 결과
        const p = resultToPortfolio(res.result);
        setPortfolio(p);
        fetchPortfolioHistory().then(setHistory).catch(() => {});
        toast.success('포트폴리오 추천이 완료되었습니다!');
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg    = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (status === 429) {
        toast.error(msg ?? '잠시 후 다시 시도해주세요. (5분 쿨다운)');
      } else if (status === 400) {
        toast.error(msg ?? '투자 성향을 먼저 설정해주세요. (마이페이지 → 회원정보)');
      } else {
        toast.error('포트폴리오 추천 요청에 실패했습니다.');
      }
    } finally {
      setRecommending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0A3D5C]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">포트폴리오 정보를 불러오지 못했습니다.</p>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl bg-[#0A3D5C] px-5 py-2.5 text-sm text-white hover:bg-[#0A3D5C]/90"
        >
          <RefreshCw className="h-4 w-4" /> 다시 시도
        </button>
      </div>
    );
  }

  const assets    = portfolio ? getAssets(portfolio) : [];
  const riskType  = portfolio ? getRiskType(portfolio) : '';
  const chartData = assets.map((a) => ({ name: a.assetClass, value: a.ratio }));

  return (
    <motion.div className="p-8" variants={containerVariants} initial="hidden" animate="visible">
      {/* 헤더 */}
      <motion.div variants={itemVariants} className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-5 w-5 text-[#0A3D5C]" />
          <h2 className="text-xl font-medium">AI 포트폴리오</h2>
        </div>
        <button
          onClick={handleRecommend}
          disabled={polling || recommending || !canRecommend}
          className="flex items-center gap-2 rounded-xl bg-[#0A3D5C] px-4 py-2 text-sm text-white hover:bg-[#0A3D5C]/90 disabled:opacity-60"
        >
          {recommending || polling
            ? <><Loader2 className="h-4 w-4 animate-spin" /> 분석 중...</>
            : <><Sparkles className="h-4 w-4" /> {canRecommend ? 'AI 추천받기' : '재추천 준비 중'}</>
          }
        </button>
      </motion.div>

      {/* 폴링 중 상태 배너 */}
      {polling && (
        <motion.div
          variants={itemVariants}
          className="mb-8 flex items-center gap-4 rounded-2xl border border-[#0A3D5C]/20 bg-[#0A3D5C]/5 px-6 py-5"
        >
          <Loader2 className="h-6 w-6 shrink-0 animate-spin text-[#0A3D5C]" />
          <div>
            <p className="font-medium text-[#0A3D5C]">AI가 포트폴리오를 분석 중입니다</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              최대 3분 정도 소요될 수 있습니다. 페이지를 닫아도 분석은 계속 진행됩니다.
            </p>
          </div>
        </motion.div>
      )}

      {portfolio === null && !polling ? (
        /* 포트폴리오 없음 */
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-border py-24">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A3D5C]/10">
            <Sparkles className="h-8 w-8 text-[#0A3D5C]" />
          </div>
          <div className="text-center">
            <p className="font-medium">아직 추천된 포트폴리오가 없어요</p>
            <p className="mt-1 text-sm text-muted-foreground">AI 추천받기 버튼을 눌러 맞춤형 자산배분을 받아보세요</p>
          </div>
          <button
            onClick={handleRecommend}
            disabled={polling || recommending || !canRecommend}
            className="flex items-center gap-2 rounded-xl bg-[#0A3D5C] px-6 py-3 text-sm text-white hover:bg-[#0A3D5C]/90 disabled:opacity-60"
          >
            {recommending || polling
              ? <><Loader2 className="h-4 w-4 animate-spin" /> 분석 중...</>
              : <><Sparkles className="h-4 w-4" /> AI 추천받기</>
            }
          </button>
        </motion.div>
      ) : portfolio !== null && (
        <>
          {/* 요약 카드 */}
          <motion.div variants={itemVariants} className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <p className="mb-2 text-sm text-muted-foreground">투자 성향</p>
              <RiskBadge riskType={riskType} />
            </div>
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <p className="mb-2 text-sm text-muted-foreground">투자 가능 금액</p>
              <p className="text-2xl font-semibold">{formatAmount(portfolio.investableAmount)}원</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <p className="mb-2 text-sm text-muted-foreground">마지막 추천일</p>
              <p className="text-2xl font-semibold">{formatDate(portfolio.createdAt)}</p>
            </div>
          </motion.div>

          {/* AI 진단 */}
          {(portfolio.summary || portfolio.aiDiagnosis) && (
            <motion.div variants={itemVariants} className="mb-8 space-y-3">
              {portfolio.aiDiagnosis && (
                <div className="rounded-2xl border border-border bg-white p-6">
                  <p className="mb-2 text-sm font-medium text-muted-foreground">AI 진단</p>
                  <p className="text-sm leading-relaxed">{portfolio.aiDiagnosis}</p>
                </div>
              )}
              {portfolio.summary && (
                <div className="rounded-2xl border border-[#0A3D5C]/20 bg-[#0A3D5C]/5 p-6">
                  <p className="mb-2 text-sm font-medium text-[#0A3D5C]">추천 요약</p>
                  <p className="text-sm leading-relaxed">{portfolio.summary}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* 추천 자산 배분 */}
          <motion.div variants={itemVariants} className="mb-8">
            <h3 className="mb-4 font-medium">추천 자산 배분</h3>
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="rounded-2xl border border-border bg-white p-6">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, '비중']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 lg:col-span-2">
                {assets.map((asset, i) => <AllocationRow key={i} asset={asset} index={i} />)}
              </div>
            </div>
          </motion.div>

          {/* 유의사항 */}
          <motion.div variants={itemVariants} className="mb-8">
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

          {/* 이력 */}
          {history.length > 1 && (
            <motion.div variants={itemVariants}>
              <h3 className="mb-4 font-medium">추천 이력</h3>
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
