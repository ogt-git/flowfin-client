import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, type Variants } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import { SpendingSummary } from '../components/SpendingSummary';
import { CategoryCard } from '../components/CategoryCard';
import { AIInsight } from '../components/AIInsight';
import { RecentTransaction } from '../components/RecentTransaction';
import { fetchExpenses, fetchMonthlyStats } from '../../api/expenses';
import { fetchAssetSummary } from '../../api/assets';
import type { Expense, MonthlyStats } from '../../types/expense';
import type { AssetSummaryData } from '../../types/asset';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

function toYYYYMM(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

interface DashboardPageProps {
  userName: string;
}

function formatAmount(n: number | undefined | null) {
  const v = n ?? 0;
  if (Math.abs(v) >= 100_000_000) return `${(v / 100_000_000).toFixed(1)}억`;
  if (Math.abs(v) >= 10_000) return `${(v / 10_000).toFixed(0)}만`;
  return v.toLocaleString();
}

export default function DashboardPage({ userName: _userName }: DashboardPageProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [assetSummary, setAssetSummary] = useState<AssetSummaryData | null>(null);

  useEffect(() => {
    const month = toYYYYMM(new Date());

    fetchMonthlyStats(month)
      .then(setStats)
      .catch(() => {});

    fetchExpenses({ month, page: 0, size: 4 })
      .then((res) => setRecentExpenses(res.content ?? []))
      .catch(() => {});

    fetchAssetSummary()
      .then(setAssetSummary)
      .catch(() => {});
  }, []);

  const categoryCards = (stats?.categoryStats ?? [])
    .filter((c) => c.amount > 0)
    .map((c) => ({
      icon: c.icon,
      name: c.name,
      amount: c.amount,
      color: c.color,
      percentage: Math.round(c.ratio * 100),
    }));

  return (
    <motion.div
      className="p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 지출 + 자산 요약 */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <SpendingSummary
            totalSpent={stats?.totalAmount ?? 0}
            changePercent={Math.abs(stats?.changePercent ?? 0)}
            isIncrease={(stats?.changePercent ?? 0) > 0}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <div
            className="relative h-full cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A3D5C] to-[#1a5c8a] p-8 text-white shadow-xl"
            onClick={() => navigate('/asset')}
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
            <div className="relative z-10">
              <div className="mb-2 flex items-center gap-2 opacity-90">
                <TrendingUp className="h-4 w-4" />
                <p>전체 자산</p>
              </div>
              <div className="mb-4 flex items-baseline gap-2">
                <h1
                  className="text-5xl tracking-tight"
                  style={{ fontFamily: 'var(--font-family-display)' }}
                >
                  {assetSummary
                    ? formatAmount(assetSummary.totalStockAsset + assetSummary.totalManualAsset)
                    : '-'}
                </h1>
                <span className="text-2xl opacity-80">원</span>
              </div>
              <div className="flex gap-4 text-sm text-white/70">
                <span>증권 {assetSummary ? formatAmount(assetSummary.totalStockAsset) : '-'}원</span>
                <span>·</span>
                <span>수동 {assetSummary ? formatAmount(assetSummary.totalManualAsset) : '-'}원</span>
              </div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm">
                <span>투자 가능</span>
                <span className="font-semibold">
                  {assetSummary ? formatAmount(assetSummary.investableAmount) : '-'}원
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI 인사이트 */}
      <motion.div variants={itemVariants} className="mb-8">
        <AIInsight message="AI 분석을 불러오는 중입니다..." />
      </motion.div>

      {/* Category */}
      {categoryCards.length > 0 && (
        <motion.div variants={itemVariants} className="mb-8">
          <h3 className="mb-5">카테고리별 지출</h3>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categoryCards.map((cat) => (
              <CategoryCard key={cat.name} {...cat} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <div className="mb-5 flex items-center justify-between">
          <h3>최근 내역</h3>
          <button
            onClick={() => navigate('/expenses')}
            className="rounded-lg px-4 py-2 text-sm text-[#0A3D5C] transition-colors hover:bg-secondary"
          >
            전체보기 →
          </button>
        </div>
        {recentExpenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">최근 지출 내역이 없습니다.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {recentExpenses.map((expense) => (
              <RecentTransaction
                key={expense.expenseId}
                merchant={expense.merchantName}
                date={expense.expenseDate}
                amount={expense.amount}
                category={expense.categoryName}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
