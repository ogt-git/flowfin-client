import { Home, PieChart, Users, User, Settings, LogOut } from 'lucide-react';

interface NavItem {
  icon: typeof Home;
  label: string;
  active: boolean;
}

export function Sidebar() {
  const navItems: NavItem[] = [
    { icon: Home, label: '홈', active: true },
    { icon: PieChart, label: '지출 분석', active: false },
    { icon: Users, label: '커뮤니티', active: false },
    { icon: User, label: '마이페이지', active: false },
  ];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-border bg-white">
      {/* Logo */}
      <div className="border-b border-border px-6 py-6">
        <h2 className="text-2xl" style={{ fontFamily: 'var(--font-family-display)' }}>
          💰 갓생Money
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">스마트 자산관리</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        {navItems.map((item, index) => (
          <button
            key={index}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all ${
              item.active
                ? 'bg-[#0A3D5C] text-white shadow-lg'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-border px-3 py-4 space-y-1">
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground">
          <Settings className="h-5 w-5" />
          <span>설정</span>
        </button>
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground">
          <LogOut className="h-5 w-5" />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
}
