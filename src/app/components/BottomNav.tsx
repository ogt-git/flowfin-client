import { useNavigate, useLocation } from 'react-router';
import { Home, PieChart, TrendingUp, Users, User } from 'lucide-react';

const navItems = [
  { icon: Home,       label: '홈',        path: '/dashboard' },
  { icon: PieChart,   label: '지출',      path: '/expenses'  },
  { icon: TrendingUp, label: '자산',      path: '/stocks'    },
  { icon: Users,      label: '커뮤니티',  path: '/community' },
  { icon: User,       label: '마이페이지',path: '/mypage'    },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/community') return location.pathname.startsWith('/community');
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-white/90 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className={`h-5 w-5 transition-transform ${active ? 'scale-110' : ''}`} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
