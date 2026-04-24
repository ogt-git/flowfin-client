import { Home, PieChart, Users, User } from 'lucide-react';

interface NavItem {
  icon: typeof Home;
  label: string;
  active: boolean;
}

export function BottomNav() {
  const navItems: NavItem[] = [
    { icon: Home, label: '홈', active: true },
    { icon: PieChart, label: '지출 분석', active: false },
    { icon: Users, label: '커뮤니티', active: false },
    { icon: User, label: '마이페이지', active: false },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-sm items-center justify-around px-4 py-3">
        {navItems.map((item, index) => (
          <button
            key={index}
            className={`flex flex-col items-center gap-1 px-4 py-2 transition-all ${
              item.active
                ? 'text-[#0A3D5C]'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <item.icon className={`h-6 w-6 transition-transform ${
              item.active ? 'scale-110' : ''
            }`} />
            <span className="text-xs">{item.label}</span>
            {item.active && (
              <div className="absolute -bottom-0.5 h-1 w-12 rounded-full bg-[#0A3D5C]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
