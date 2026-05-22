import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, type Variants } from 'motion/react';
import { SpendingSummary } from '../components/SpendingSummary';
import { CategoryCard } from '../components/CategoryCard';
import { AIInsight } from '../components/AIInsight';
import { RecentTransaction } from '../components/RecentTransaction';
import { fetchExpenses, fetchMonthlyStats } from '../../api/expenses';
import type { Expense, MonthlyStats } from '../../types/expense';

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

export default function DashboardPage({ userName: _userName }: DashboardPageProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const month = toYYYYMM(new Date());

    fetchMonthlyStats(month)
      .then(setStats)
      .catch(() => {});

    fetchExpenses({ month, page: 0, size: 4 })
      .then((res) => setRecentExpenses(res.content ?? []))
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
      {/* Summary + AI */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <SpendingSummary
            totalSpent={stats?.totalAmount ?? 0}
            changePercent={Math.abs(stats?.changePercent ?? 0)}
            isIncrease={(stats?.changePercent ?? 0) > 0}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AIInsight message="AI 분석을 불러오는 중입니다..." />
        </motion.div>
      </div>

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
                key={expense.id}
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
