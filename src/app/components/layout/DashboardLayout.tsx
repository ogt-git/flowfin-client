import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Home, PieChart, PlusCircle, TrendingUp, LayoutGrid, Users, User, LogOut, Bell, BarChart2, Menu, X } from 'lucide-react';
import { BottomNav } from '../BottomNav';

interface DashboardLayoutProps {
  userName: string;
  onLogout: () => void;
}

const navItems = [
  { icon: Home,        label: '홈',            path: '/dashboard'    },
  { icon: PlusCircle,  label: '카드 연동',      path: '/card/link'    },
  { icon: PieChart,    label: '지출 분석',      path: '/expenses'     },
  { icon: TrendingUp,  label: '자산 연동',      path: '/asset/link'   },
  { icon: BarChart2,   label: '증권 자산 현황', path: '/stocks'       },
  { icon: LayoutGrid,  label: 'AI 포트폴리오',  path: '/portfolio/link'},
  { icon: Users,       label: '커뮤니티',       path: '/community'    },
  { icon: User,        label: '마이페이지',     path: '/mypage'       },
];

export default function DashboardLayout({ userName, onLogout }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/community') return location.pathname.startsWith('/community');
    if (path === '/expenses')  return location.pathname === '/expenses';
    return location.pathname === path;
  };

  const handleNav = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="border-b border-border px-6 py-6 cursor-pointer" onClick={() => handleNav('/dashboard')}>
        <h2 className="text-2xl" style={{ fontFamily: 'var(--font-family-display)' }}>
          💰 FlowFin
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">스마트 자산관리</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNav(item.path)}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all ${
              isActive(item.path)
                ? 'bg-primary text-white shadow-lg'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>로그아웃</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* 데스크톱 사이드바 */}
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-64 flex-col border-r border-border bg-white lg:flex">
        <SidebarContent />
      </aside>

      {/* 모바일 드로어 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 모바일 드로어 */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-white transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* 메인 */}
      <main className="flex min-h-screen flex-1 flex-col lg:ml-64">
        {/* 헤더 */}
        <header className="sticky top-0 z-10 border-b border-border bg-white/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3 lg:px-8 lg:py-5">
            <div className="flex items-center gap-3">
              {/* 모바일 햄버거 */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-secondary lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="hidden text-sm text-muted-foreground lg:block">안녕하세요 👋</p>
                <h1 className="text-base lg:text-xl" style={{ fontFamily: 'var(--font-family-display)' }}>
                  오늘도 잘 살아볼까요?
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white transition-colors hover:bg-secondary lg:h-11 lg:w-11">
                <Bell className="h-4 w-4 text-muted-foreground lg:h-5 lg:w-5" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-success lg:h-2 lg:w-2 lg:right-2.5 lg:top-2.5" />
              </button>
              <button
                onClick={() => navigate('/mypage')}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-success text-white shadow-md transition-opacity hover:opacity-80 lg:h-11 lg:w-11"
              >
                <span className="text-sm" style={{ fontFamily: 'var(--font-family-display)' }}>
                  {userName.charAt(0) || 'U'}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* 콘텐츠 — 모바일에서 하단 네비 높이만큼 여백 */}
        <div className="flex-1 pb-16 lg:pb-0">
          <Outlet />
        </div>

        {/* 모바일 하단 네비 */}
        <BottomNav />
      </main>
    </div>
  );
}
