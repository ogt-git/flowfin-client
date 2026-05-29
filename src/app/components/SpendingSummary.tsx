import { TrendingDown, TrendingUp } from 'lucide-react';

interface SpendingSummaryProps {
  totalSpent: number;
  changePercent: number;
  isIncrease: boolean;
}

export function SpendingSummary({ totalSpent, changePercent, isIncrease }: SpendingSummaryProps) {
  return (
    <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A3D5C] to-[#0F4C81] p-8 text-white shadow-xl">
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

      <div className="relative z-10">
        <p className="mb-2 opacity-90">이번 달 총 지출</p>
        <div className="mb-4 flex items-baseline gap-2">
          <h1
            className="text-5xl tracking-tight"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            {totalSpent.toLocaleString('ko-KR')}
          </h1>
          <span className="text-2xl opacity-80">원</span>
        </div>

        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
          isIncrease
            ? 'bg-red-500/20 text-red-100'
            : 'bg-emerald-500/20 text-emerald-100'
        }`}>
          {isIncrease ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span className="text-sm">
            전월 대비 {isIncrease ? '+' : '-'}{changePercent}%
          </span>
        </div>
      </div>
    </div>
  );
}
