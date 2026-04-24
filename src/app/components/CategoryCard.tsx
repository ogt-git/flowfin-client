import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  icon: LucideIcon;
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

export function CategoryCard({ icon: Icon, name, amount, color, percentage }: CategoryCardProps) {
  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>

      <div>
        <p className="mb-1 text-sm text-muted-foreground">{name}</p>
        <p className="text-xl" style={{ fontFamily: 'var(--font-family-display)' }}>
          {amount.toLocaleString('ko-KR')}원
        </p>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              backgroundColor: color,
              width: `${percentage}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}
