import { useState, useEffect } from 'react';
import { motion, type Variants } from 'motion/react';
import { LayoutGrid, Loader2, RefreshCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchPortfolio, fetchPortfolioHistory, recommendPortfolio } from '../../api/portfolio';
import type { Portfolio, RecommendedAsset } from '../../types/portfolio';

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
  CONSERVATIVE:           { label: '안정형',      color: 'text-blue-700',   bg: 'bg-blue-50' },
  MODERATELY_CONSERVATIVE:{ label: '안정추구형',   color: 'text-teal-700',   bg: 'bg-teal-50' },
  MODERATE:               { label: '위험중립형',   color: 'text-green-700',  bg: 'bg-green-50' },
  MODERATELY_AGGRESSIVE:  { label: '적극투자형',   color: 'text-orange-700', bg: 'bg-orange-50' },
  AGGRESSIVE:             { label: '공격투자형',   color: 'text-red-700',    bg: 'bg-red-50' },
};

function formatAmount(n: number) {
  if (Math.abs(n) >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (Math.abs(n) >= 10_000) return `${(n / 10_000).toFixed(0)}만`;
  return n.toLocaleString();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
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
  return (
    <div className={`flex items-center gap-4 rounded-xl px-4 py-3 ${index % 2 === 0 ? 'bg-white' : 'bg-secondary/30'}`}>
      <div className="flex h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
      <div className="flex-1">
        <p className="font-medium text-sm">{asset.assetClass}</p>
        {asset.description && <p className="mt-0.5 text-xs text-muted-foreground">{asset.description}</p>}
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
  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{formatDate(portfolio.createdAt)}</span>
          <RiskBadge riskType={portfolio.riskType} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">투자가능 {formatAmount(portfolio.investableAmount)}원</span>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-border px-5 pb-4 pt-3 space-y-2">
          {portfolio.recommendedAssets.map((a, i) => (
            <AllocationRow key={i} asset={a} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [history, setHistory] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommending, setRecommending] = useState(false);
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const [p, h] = await Promise.all([fetchPortfolio(), fetchPortfolioHistory()]);
      setPortfolio(p);
      setHistory(h);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleRecommend() {
    setRecommending(true);
    try {
      const result = await recommendPortfolio();
      setPortfolio(result);
      setHistory((prev) => [result, ...prev]);
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

  const chartData = portfolio?.recommendedAssets.map((a) => ({ name: a.assetClass, value: a.ratio })) ?? [];

  return (
    <motion.div
      className="p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 헤더 */}
      <motion.div variants={itemVariants} className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-5 w-5 text-[#0A3D5C]" />
          <h2 className="text-xl font-medium">AI 포트폴리오</h2>
        </div>
        <button
          onClick={handleRecommend}
          disabled={recommending}
          className="flex items-center gap-2 rounded-xl bg-[#0A3D5C] px-4 py-2 text-sm text-white hover:bg-[#0A3D5C]/90 disabled:opacity-60"
        >
          {recommending
            ? <><Loader2 className="h-4 w-4 animate-spin" /> 분석 중...</>
            : <><Sparkles className="h-4 w-4" /> AI 추천받기</>
          }
        </button>
      </motion.div>

      {portfolio === null ? (
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
            disabled={recommending}
            className="flex items-center gap-2 rounded-xl bg-[#0A3D5C] px-6 py-3 text-sm text-white hover:bg-[#0A3D5C]/90 disabled:opacity-60"
          >
            {recommending
              ? <><Loader2 className="h-4 w-4 animate-spin" /> 분석 중...</>
              : <><Sparkles className="h-4 w-4" /> AI 추천받기</>
            }
          </button>
        </motion.div>
      ) : (
        <>
          {/* 요약 카드 */}
          <motion.div variants={itemVariants} className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <p className="mb-2 text-sm text-muted-foreground">투자 성향</p>
              <RiskBadge riskType={portfolio.riskType} />
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

          {/* 추천 자산배분 */}
          <motion.div variants={itemVariants} className="mb-8">
            <h3 className="mb-4 font-medium">추천 자산 배분</h3>
            <div className="grid gap-8 lg:grid-cols-3">
              {/* 파이차트 */}
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
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* 배분 목록 */}
              <div className="space-y-2 lg:col-span-2">
                {portfolio.recommendedAssets.map((asset, i) => (
                  <AllocationRow key={i} asset={asset} index={i} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* 이력 */}
          {history.length > 1 && (
            <motion.div variants={itemVariants}>
              <h3 className="mb-4 font-medium">추천 이력</h3>
              <div className="space-y-3">
                {history.slice(1).map((p) => (
                  <HistoryItem key={p.id} portfolio={p} />
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
