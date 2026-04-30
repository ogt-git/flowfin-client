import { useNavigate, useLocation } from 'react-router';
import { Home, PieChart, Users, User, Settings, LogOut,BarChart3, LayoutGrid } from 'lucide-react';

interface SidebarProps {
    onLogout: () => void;
}

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: Home,     label: '홈',       path: '/dashboard' },
  { icon: PieChart, label: '지출 분석', path: '/card/link' },
  { icon: BarChart3, label: '자산 분석', path: '/asset/link' },
  { icon: LayoutGrid, label: 'AI 포트폴리오 추천', path: '/portfolio/link' },
  { icon: Users,    label: '커뮤니티',  path: '/community' },
  { icon: User,     label: '마이페이지', path: '/mypage' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) =>
    path === '/dashboard' ? ['/', '/dashboard'].includes(location.pathname) : location.pathname.startsWith(path);

    return (
        <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-border bg-white">
            <div className="border-b border-border px-6 py-6">
                <h2 className="text-2xl" style={{ fontFamily: 'var(--font-family-display)' }}>
                    💰 갓생Money
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">스마트 자산관리</p>
            </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        {NAV_ITEMS.map((item) => (
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
                <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground">
                    <Settings className="h-5 w-5" />
                    <span>설정</span>
                </button>
                <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                >
                    <LogOut className="h-5 w-5" />
                    <span>로그아웃</span>
                </button>
            </div>
        </aside>
    );
}