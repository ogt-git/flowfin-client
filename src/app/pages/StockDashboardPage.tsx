import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, type Variants } from 'motion/react';
import { TrendingUp, TrendingDown, RefreshCw, PlusCircle, Loader2, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchAssetSummary, fetchStocks, fetchManualAssets, deleteManualAsset } from '../../api/assets';
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

function SummaryCard({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <p className="mb-2 text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      {sub !== undefined && (
        <p
          className={`mt-1 flex items-center gap-1 text-sm font-medium ${
            positive === true
              ? 'text-emerald-600'
              : positive === false
              ? 'text-red-500'
              : 'text-muted-foreground'
          }`}
        >
          {positive === true && <TrendingUp className="h-3.5 w-3.5" />}
          {positive === false && <TrendingDown className="h-3.5 w-3.5" />}
          {sub}
        </p>
      )}
    </div>
  );
}

function StockRow({ item, brokerName, index }: { item: StockItem; brokerName: string; index: number }) {
  const pl = item.valuationPl ?? 0;
  const rate = Number(item.earningsRate ?? 0);
  const isPositive = pl >= 0;
  return (
    <tr className={index % 2 === 0 ? 'bg-white' : 'bg-secondary/30'}>
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-sm">{item.itemName}</p>
          <p className="text-xs text-muted-foreground">{item.itemCode} · {brokerName}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-right">{(item.quantity ?? 0).toLocaleString()}</td>
      <td className="px-4 py-3 text-sm text-right">{(item.purchaseAmount ?? 0).toLocaleString()}원</td>
      <td className="px-4 py-3 text-sm text-right">{(item.valuationAmt ?? 0).toLocaleString()}원</td>
      <td className={`px-4 py-3 text-sm text-right font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
        {isPositive ? '+' : ''}{pl.toLocaleString()}원
      </td>
      <td className={`px-4 py-3 text-sm text-right font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
        {isPositive ? '+' : ''}{rate.toFixed(2)}%
      </td>
    </tr>
  );
}

function buildChartData(items: StockItem[]) {
  return items
    .filter((i) => i.valuationAmt > 0)
    .sort((a, b) => b.valuationAmt - a.valuationAmt)
    .slice(0, 8)
    .map((i) => ({ name: i.itemName, value: i.valuationAmt }));
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  DEPOSIT: '예금', SAVINGS: '적금', REAL_ESTATE: '부동산',
  CASH: '현금', PENSION: '연금', ETC: '기타',
};

export default function StockDashboardPage() {
  const navigate = useNavigate();
  const [assetSummary, setAssetSummary] = useState<AssetSummaryData | null>(null);
  const [stocks, setStocks] = useState<StockAccount[]>([]);
  const [manualAssets, setManualAssets] = useState<ManualAssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockError, setStockError] = useState(false);

  async function load() {
    setLoading(true);
    setStockError(false);
    const [summaryResult, stocksResult, manualResult] = await Promise.allSettled([
      fetchAssetSummary(),
      fetchStocks(),
      fetchManualAssets(),
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
    } catch {
      /* no-op */
    }
  }

  useEffect(() => { load(); }, []);

  const allItems = stocks.flatMap((a) => {
    const brokerName = STOCK_ORGANIZATIONS.find((o) => o.code === a.brokerCode)?.name ?? a.brokerCode;
    return a.items.map((item) => ({ ...item, brokerName }));
  });
  const chartData = buildChartData(allItems);
  const totalValuationPl = allItems.reduce((s, i) => s + (i.valuationPl ?? 0), 0);
  const isPositive = totalValuationPl >= 0;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0A3D5C]" />
      </div>
    );
  }


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
          <TrendingUp className="h-5 w-5 text-[#0A3D5C]" />
          <h2 className="text-xl font-medium">증권 현황</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm text-muted-foreground hover:bg-secondary"
          >
            <RefreshCw className="h-4 w-4" /> 새로고침
          </button>
          <button
            onClick={() => navigate('/asset/link')}
            className="flex items-center gap-2 rounded-xl bg-[#0A3D5C] px-4 py-2 text-sm text-white hover:bg-[#0A3D5C]/90"
          >
            <PlusCircle className="h-4 w-4" /> 증권 계좌 연동하기
          </button>
        </div>
      </motion.div>

      {/* 요약 카드 */}
      {assetSummary && (
        <>
          {/* 전체 자산 총합 */}
          <motion.div variants={itemVariants} className="mb-4 rounded-2xl border border-border bg-[#0A3D5C] p-6 text-white shadow-sm">
            <p className="mb-1 text-sm text-white/70">전체 자산 총합</p>
            <p className="text-3xl font-bold">
              {formatAmount(assetSummary.totalStockAsset + assetSummary.totalManualAsset + assetSummary.depositReceived)}원
            </p>
            <div className="mt-3 flex gap-4 text-sm text-white/70">
              <span>예수금 {formatAmount(assetSummary.depositReceived)}원</span>
              <span>·</span>
              <span>증권 {formatAmount(assetSummary.totalStockAsset)}원</span>
              <span>·</span>
              <span>수동 자산 {formatAmount(assetSummary.totalManualAsset)}원</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="증권 총 자산"
              value={`${formatAmount(assetSummary.totalStockAsset)}원`}
            />
            <SummaryCard
              label="예수금"
              value={`${formatAmount(assetSummary.depositReceived)}원`}
            />
            <SummaryCard
              label="평가 손익"
              value={`${isPositive ? '+' : ''}${formatAmount(totalValuationPl)}원`}
              sub={isPositive ? '수익 중' : '손실 중'}
              positive={isPositive}
            />
            <SummaryCard
              label="투자 가능 금액"
              value={`${formatAmount(assetSummary.investableAmount)}원`}
            />
          </motion.div>
        </>
      )}

      {stockError ? (
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-12">
          <p className="text-sm text-muted-foreground">증권 정보를 불러오지 못했습니다.</p>
          <button onClick={load} className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm hover:bg-secondary">
            <RefreshCw className="h-4 w-4" /> 다시 시도
          </button>
        </motion.div>
      ) : allItems.length === 0 ? (
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20">
          <TrendingUp className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">보유 종목이 없습니다.</p>
          <button
            onClick={() => navigate('/portfolio/link')}
            className="flex items-center gap-2 rounded-xl bg-[#0A3D5C] px-5 py-2.5 text-sm text-white hover:bg-[#0A3D5C]/90"
          >
            <TrendingUp className="h-4 w-4" /> 포트폴리오 보기
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* 종목 테이블 */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h3 className="mb-4 font-medium">보유 종목</h3>
            <div className="overflow-hidden rounded-2xl border border-border bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
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
                      <StockRow key={`${item.itemCode}-${i}`} item={item} brokerName={item.brokerName} index={i} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* 파이차트 */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-4 font-medium">자산 구성</h3>
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
                    formatter={(value: number) => [formatMoney(value), '평가금액']}
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
          </motion.div>
        </div>
      )}

      {/* 수동 자산 섹션 */}
      <motion.div variants={itemVariants} className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium">수동 등록 자산</h3>
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
              className="flex items-center gap-2 rounded-xl bg-[#0A3D5C] px-4 py-2 text-sm text-white hover:bg-[#0A3D5C]/90"
            >
              <PlusCircle className="h-4 w-4" /> 자산 등록하기
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">자산명</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">유형</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">취득가액</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">현재가액</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">평가손익</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">취득일</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {manualAssets.map((asset, i) => {
                    const pl = (asset.valuationAmt ?? 0) - (asset.purchaseAmount ?? 0);
                    const isPos = pl >= 0;
                    return (
                      <tr key={asset.id} className={i % 2 === 0 ? 'bg-white' : 'bg-secondary/30'}>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium">{asset.itemName}</p>
                          {asset.memo && <p className="text-xs text-muted-foreground">{asset.memo}</p>}
                        </td>
                        <td className="px-4 py-3 text-center text-sm">
                          {ASSET_TYPE_LABELS[asset.assetType] ?? asset.assetType}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          {(asset.purchaseAmount ?? 0).toLocaleString()}원
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          {(asset.valuationAmt ?? 0).toLocaleString()}원
                        </td>
                        <td className={`px-4 py-3 text-right text-sm font-medium ${isPos ? 'text-emerald-600' : 'text-red-500'}`}>
                          {isPos ? '+' : ''}{pl.toLocaleString()}원
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                          {asset.purchaseDate ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteManual(asset.id)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
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
