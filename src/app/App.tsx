import { useState } from 'react';
import { motion } from 'motion/react';
import { Coffee, Zap, ShoppingBag, Car, Bell, Search } from 'lucide-react';
import { SpendingSummary } from './components/SpendingSummary';
import { CategoryCard } from './components/CategoryCard';
import { AIInsight } from './components/AIInsight';
import { RecentTransaction } from './components/RecentTransaction';
import { Sidebar } from './components/Sidebar';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';

type Page = 'login' | 'signup' | 'dashboard';

export default function App() {
  const [page, setPage] = useState<Page>(() => {
    return localStorage.getItem('token') ? 'dashboard' : 'login';
  });
  const [userName, setUserName] = useState(() => localStorage.getItem('name') || '');

  const handleLoginSuccess = (token: string, name: string) => {
    setUserName(name);
    setPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    setPage('login');
  };

  if (page === 'login') {
    return <LoginPage onNavigateToSignup={() => setPage('signup')} onLoginSuccess={handleLoginSuccess} />;
  }

  if (page === 'signup') {
    return <SignupPage onNavigateToLogin={() => setPage('login')} />;
  }

  const categories = [
    { icon: Coffee, name: '식비', amount: 485000, color: '#F59E0B', percentage: 75 },
    { icon: Zap, name: '공과금', amount: 128000, color: '#8B5CF6', percentage: 45 },
    { icon: ShoppingBag, name: '쇼핑', amount: 320000, color: '#EC4899', percentage: 60 },
    { icon: Car, name: '교통', amount: 95000, color: '#3B82F6', percentage: 30 },
  ];

  const transactions = [
    { merchant: '스타벅스 강남점', date: '2026.04.23 14:30', amount: 8500, category: '카페' },
    { merchant: 'GS25 편의점', date: '2026.04.23 09:15', amount: 12400, category: '식비' },
    { merchant: '카카오T', date: '2026.04.22 18:45', amount: 15800, category: '교통' },
    { merchant: '올리브영', date: '2026.04.22 16:20', amount: 45600, category: '쇼핑' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
      <div className="flex min-h-screen">
        <Sidebar onLogout={handleLogout} />
        <main className="ml-64 flex-1">
          <header className="sticky top-0 z-10 border-b border-border bg-white/80 backdrop-blur-xl">
            <div className="flex items-center justify-between px-8 py-5">
              <div>
                <h2 className="mb-1 text-muted-foreground">안녕하세요 👋</h2>
                <h1 style={{ fontFamily: 'var(--font-family-display)' }}>오늘도 갓생 살아볼까요?</h1>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white transition-colors hover:bg-secondary">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </button>
                <button className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white transition-colors hover:bg-secondary">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#10B981]" />
                </button>
                <div className="ml-2 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A3D5C] to-[#10B981] text-white shadow-md">
                  <span style={{ fontFamily: 'var(--font-family-display)' }}>{userName.charAt(0)}</span>
                </div>
              </div>
            </div>
          </header>

          <motion.div className="p-8" variants={containerVariants} initial="hidden" animate="visible">
            <div className="mb-8 grid gap-6 lg:grid-cols-3">
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <SpendingSummary totalSpent={1028000} changePercent={12.5} isIncrease={true} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <AIInsight message="이번 달 배달 음식을 3번 참으면 삼성전자 1주를 살 수 있어요! 💪" />
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="mb-8">
              <h3 className="mb-5">카테고리별 지출</h3>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((category, index) => (
                    <CategoryCard key={index} {...category} />
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="mb-5 flex items-center justify-between">
                <h3>최근 내역</h3>
                <button className="rounded-lg px-4 py-2 text-sm text-[#0A3D5C] transition-colors hover:bg-secondary">
                  전체보기 →
                </button>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {transactions.map((transaction, index) => (
                    <RecentTransaction key={index} {...transaction} />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
  );
}