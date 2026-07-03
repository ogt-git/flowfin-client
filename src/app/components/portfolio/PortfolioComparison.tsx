import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, PieChart as PieIcon, TrendingDown, TrendingUp, Minus, AlertCircle } from 'lucide-react';
import type { RecommendedAsset } from '../../../types/portfolio';
import type { StockAccount, StockItem } from '../../../types/asset';

/**
 * 현재 "증권" 보유 비중과 추천 비중을 화면에서 비교해 보여주는 보조 섹션.
 * - 추천 로직/데이터는 건드리지 않고, 이미 있는 recommendation.allocation 과
 *   이미 있는 증권 조회(fetchStocks) 결과만 프론트에서 비교한다.
 * - "현재 전체 자산 비중"이 아니라 "현재 증권 자산 비중" 임에 유의.
 */

// 비교 임계값(%p) — 이 값 이상 차이나면 부족/과다로 판단. 나중에 쉽게 조정 가능하도록 상수 분리.
export const COMPARISON_THRESHOLD_PP = 10;

const CHART_COLORS = [
  '#0A3D5C', '#10B981', '#3B82F6', '#F59E0B',
  '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6',
];

// canonical 자산군 버킷 (추천 라벨과 증권 종목을 이 버킷으로 매핑해 조인)
type Bucket = '국내주식' | '해외주식' | '채권' | 'ETF' | '기타';

// 버킷 판정용 키워드 규칙 — 조정이 쉽도록 테이블로 분리 (위에서부터 우선 매칭)
const BUCKET_KEYWORDS: { bucket: Bucket; pattern: RegExp }[] = [
  { bucket: '채권',   pattern: /채권|국고|회사채|본드|bond/i },
  { bucket: 'ETF',    pattern: /etf/i },
  { bucket: '해외주식', pattern: /외화|해외|미국|글로벌|s&p|s\s*&\s*p|나스닥|nasdaq|다우|dow|us\b|usd|달러/i },
  { bucket: '국내주식', pattern: /국내|코스피|코스닥|kospi|kosdaq|주식/i },
];

/**
 * 문자열(종목명/코드 또는 추천 자산군 라벨)을 canonical 버킷으로 분류.
 * 매칭되지 않으면 '기타'. 단, 6자리 숫자 종목코드는 국내 상장 관례상 국내주식으로 본다.
 */
function classifyToBucket(text: string, itemCode?: string): Bucket {
  const s = `${text ?? ''}`;
  for (const { bucket, pattern } of BUCKET_KEYWORDS) {
    if (pattern.test(s)) return bucket;
  }
  if (itemCode && /^\d{6}$/.test(itemCode.trim())) return '국내주식';
  return '기타';
}

/** valuationAmt 안전 처리: null/undefined/음수/0 → 0 */
function safeValuation(n: number | undefined | null): number {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return 0;
  return v;
}

function formatAmount(n: number) {
  if (Math.abs(n) >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (Math.abs(n) >= 10_000) return `${(n / 10_000).toFixed(0)}만`;
  return n.toLocaleString();
}

type CompareStatus = 'UNDER' | 'OVER' | 'SIMILAR' | 'MISSING';

interface CompareRow {
  label: string;        // 화면 표시 라벨 (추천은 원문 assetClass, 현재-only는 버킷명)
  recommended: number;  // 추천 비중 %
  current: number;      // 현재 증권 비중 %
  gap: number;          // 추천 - 현재 (%p)
  status: CompareStatus;
  message: string;
}

function buildMessage(label: string, gap: number, current: number, status: CompareStatus): string {
  const pp = Math.abs(Math.round(gap));
  switch (status) {
    case 'MISSING':
      return `${label}은(는) 현재 보유가 없어 추천 비중 대비 부족해요`;
    case 'UNDER':
      return `${label}이(가) 추천 비중보다 ${pp}%p 부족해요`;
    case 'OVER':
      return current > 0 && gap <= -COMPARISON_THRESHOLD_PP
        ? `${label}이(가) 추천 비중보다 ${pp}%p 높아요`
        : `${label}이(가) 추천 비중보다 ${pp}%p 많아요`;
    default:
      return `${label}은(는) 추천 비중과 비슷해요`;
  }
}

interface Props {
  allocation: RecommendedAsset[];
  stocks: StockAccount[];
  loading: boolean;
  error: boolean;
}

export function PortfolioComparison({ allocation, stocks, loading, error }: Props) {
  const { rows, currentChartData, totalValuation, hasCurrent } = useMemo(() => {
    // 1. 모든 계좌의 items 를 펼쳐 버킷별 valuationAmt 합산
    const allItems: StockItem[] = stocks.flatMap((acc) => acc.items ?? []);
    const currentByBucket = new Map<Bucket, number>();
    let total = 0;
    for (const item of allItems) {
      const amt = safeValuation(item.valuationAmt);
      if (amt === 0) continue;
      const bucket = classifyToBucket(`${item.itemName ?? ''} ${item.itemCode ?? ''}`, item.itemCode);
      currentByBucket.set(bucket, (currentByBucket.get(bucket) ?? 0) + amt);
      total += amt;
    }

    const currentRatio = (bucket: Bucket) =>
      total > 0 ? ((currentByBucket.get(bucket) ?? 0) / total) * 100 : 0;

    // 2. 추천 allocation 을 assetClass 라벨 기준으로 집계 (중복 라벨 합산)
    const recByLabel = new Map<string, number>();
    const labelBucket = new Map<string, Bucket>();
    for (const a of allocation ?? []) {
      const label = a.assetClass ?? '기타';
      const ratio = Number(a.ratio);
      recByLabel.set(label, (recByLabel.get(label) ?? 0) + (Number.isFinite(ratio) ? ratio : 0));
      if (!labelBucket.has(label)) labelBucket.set(label, classifyToBucket(label));
    }

    const coveredBuckets = new Set<Bucket>();
    const result: CompareRow[] = [];

    // 2-1. 추천에 있는 자산군 (현재 비중은 매핑된 버킷에서 조회)
    for (const [label, recommended] of recByLabel) {
      const bucket = labelBucket.get(label)!;
      coveredBuckets.add(bucket);
      const current = currentRatio(bucket);
      const gap = recommended - current;
      let status: CompareStatus;
      if (current === 0 && recommended > 0) status = 'MISSING';
      else if (gap >= COMPARISON_THRESHOLD_PP) status = 'UNDER';
      else if (gap <= -COMPARISON_THRESHOLD_PP) status = 'OVER';
      else status = 'SIMILAR';
      result.push({ label, recommended, current, gap, status, message: buildMessage(label, gap, current, status) });
    }

    // 2-2. 현재에는 있지만 추천에 없는 자산군 (추천 비중 0)
    for (const [bucket, amt] of currentByBucket) {
      if (amt <= 0 || coveredBuckets.has(bucket)) continue;
      const current = currentRatio(bucket);
      const gap = 0 - current;
      const status: CompareStatus = gap <= -COMPARISON_THRESHOLD_PP ? 'OVER' : 'SIMILAR';
      result.push({ label: bucket, recommended: 0, current, gap, status, message: buildMessage(bucket, gap, current, status) });
    }

    // 현재 증권 비중 파이 차트 데이터 (버킷별, 0 초과만)
    const chart = Array.from(currentByBucket.entries())
      .filter(([, amt]) => amt > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([bucket, amt]) => ({ name: bucket, value: amt }));

    return { rows: result, currentChartData: chart, totalValuation: total, hasCurrent: total > 0 };
  }, [allocation, stocks]);

  // 추천 결과 자체가 없으면 비교 섹션을 그리지 않음 (추천 결과 화면 흐름 유지)
  if (!allocation || allocation.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="mb-1 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <PieIcon className="h-3.5 w-3.5 text-primary" />
        </div>
        <h3 className="font-semibold">현재 증권 비중 비교</h3>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        연동된 <span className="font-medium">증권 자산</span>의 보유 비중을 추천 비중과 비교한 결과입니다. (전체 자산이 아닌 증권 보유 기준)
      </p>

      {/* ── 예외 상태 처리: 로딩 / 실패 / 미보유 ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-12">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">증권 보유 정보를 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-12">
          <AlertCircle className="h-5 w-5 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">증권 보유 정보를 불러오지 못했습니다.</p>
          <p className="text-xs text-muted-foreground/70">추천 결과는 정상입니다. 잠시 후 다시 시도해 주세요.</p>
        </div>
      ) : !hasCurrent ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-12">
          <PieIcon className="h-6 w-6 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">비교할 증권 보유 내역이 없습니다.</p>
          <p className="text-xs text-muted-foreground/70">증권 계좌를 연동하면 추천 비중과 자동으로 비교해 드려요.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* 현재 증권 비중 도넛 차트 + 범례 */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm lg:col-span-2">
            <div className="relative">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={currentChartData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={85}
                    paddingAngle={3} dataKey="value"
                  >
                    {currentChartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${formatAmount(v)}원`, '평가금액']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[10px] text-muted-foreground">현재 증권</p>
                <p className="text-sm font-bold">{formatAmount(totalValuation)}원</p>
              </div>
            </div>
            <div className="mt-4 space-y-2.5 border-t border-border pt-4">
              {currentChartData.map((d, i) => {
                const pct = totalValuation > 0 ? Math.round((d.value / totalValuation) * 100) : 0;
                return (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <p className="flex-1 truncate text-xs text-muted-foreground">{d.name}</p>
                    <p className="text-xs font-bold">{pct}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 추천 vs 현재 비교 리스트 */}
          <div className="space-y-3 lg:col-span-3">
            {rows.map((row) => (
              <CompareRowCard key={row.label} row={row} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_STYLE: Record<CompareStatus, { badge: string; label: string; icon: React.ReactNode }> = {
  UNDER:   { badge: 'bg-blue-50 text-blue-600',       label: '부족', icon: <TrendingDown className="h-3 w-3" /> },
  MISSING: { badge: 'bg-blue-50 text-blue-600',       label: '미보유', icon: <TrendingDown className="h-3 w-3" /> },
  OVER:    { badge: 'bg-orange-50 text-orange-600',   label: '과다', icon: <TrendingUp className="h-3 w-3" /> },
  SIMILAR: { badge: 'bg-emerald-50 text-emerald-600', label: '적정', icon: <Minus className="h-3 w-3" /> },
};

function CompareRowCard({ row }: { row: CompareRow }) {
  const s = STATUS_STYLE[row.status];
  return (
    <div className="rounded-xl border border-border/60 bg-white px-4 py-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-sm">{row.label}</p>
            <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${s.badge}`}>
              {s.icon}{s.label}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{row.message}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-muted-foreground">추천 {Math.round(row.recommended)}%</p>
          <p className="text-sm font-bold">현재 {Math.round(row.current)}%</p>
        </div>
      </div>
      {/* 추천(연함) 위에 현재(진함) 바를 겹쳐 표시 */}
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className="relative h-2 w-full">
          <div className="absolute inset-y-0 left-0 rounded-full bg-primary/25" style={{ width: `${Math.min(100, row.recommended)}%` }} />
          <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${Math.min(100, row.current)}%` }} />
        </div>
      </div>
    </div>
  );
}
