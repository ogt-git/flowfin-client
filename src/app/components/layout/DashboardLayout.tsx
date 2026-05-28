import { Outlet, useNavigate, useLocation } from 'react-router';
import { Home, PieChart, PlusCircle, TrendingUp, LayoutGrid, Users, User, Settings, LogOut, Bell, Search, BarChart2 } from 'lucide-react';

interface DashboardLayoutProps {
  userName: string;
  onLogout: () => void;
}

const navItems = [
  { icon: Home,        label: '홈',          path: '/dashboard' },
  { icon: PlusCircle,  label: '카드 등록',    path: '/card/link' },
  { icon: PieChart,    label: '지출 분석',    path: '/expenses' },
  { icon: TrendingUp,  label: '자산 연동',    path: '/asset/link' },
  { icon: BarChart2,   label: '증권 현황',    path: '/stocks' },
  { icon: LayoutGrid,  label: 'AI 포트폴리오', path: '/portfolio/link' },
  { icon: Users,       label: '커뮤니티',     path: '/community' },
  { icon: User,        label: '마이페이지',   path: '/mypage' },
];

export default function DashboardLayout({ userName, onLogout }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/community') return location.pathname.startsWith('/community');
    if (path === '/expenses') return location.pathname === '/expenses';
    return location.pathname === path;
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-border bg-white z-20">
        <div className="border-b border-border px-6 py-6 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <h2 className="text-2xl" style={{ fontFamily: 'var(--font-family-display)' }}>
            💰 FlowFin
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">스마트 자산관리</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                isActive(item.path)
                  ? 'bg-[#0A3D5C] text-white shadow-lg'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-border px-3 py-4 space-y-1">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-border bg-white/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-8 py-5">
            <div>
              <p className="mb-0.5 text-sm text-muted-foreground">안녕하세요 👋</p>
              <h1 style={{ fontFamily: 'var(--font-family-display)' }}>오늘도 잘 살아볼까요?</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white transition-colors hover:bg-secondary">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#10B981]" />
              </button>
              <button
                onClick={() => navigate('/mypage')}
                className="ml-2 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A3D5C] to-[#10B981] text-white shadow-md transition-opacity hover:opacity-80"
              >
                <span style={{ fontFamily: 'var(--font-family-display)' }}>
                  {userName.charAt(0) || 'U'}
                </span>
              </button>
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
