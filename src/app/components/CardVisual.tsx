import { Wifi } from 'lucide-react';

interface CardVisualProps {
  organizationName: string;
  organizationColor: string;
}

export function CardVisual({ organizationName, organizationColor }: CardVisualProps) {
  return (
    <div
      className="relative mx-auto h-48 w-80 rounded-2xl p-6 text-white shadow-2xl"
      style={{ background: `linear-gradient(135deg, ${organizationColor}dd, ${organizationColor}88)` }}
    >
      <div className="mb-6 flex items-start justify-between">
        <span className="text-lg font-semibold">{organizationName}</span>
        <Wifi className="h-5 w-5 rotate-90 opacity-80" />
      </div>

      <div className="mb-6 font-mono text-base tracking-widest opacity-90">
        **** **** **** ****
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs opacity-60">유효기간</p>
          <p className="font-mono text-sm">MM / YY</p>
        </div>
        <div className="flex h-8 items-center">
          <div className="h-8 w-8 rounded-full bg-white/30" />
          <div className="-ml-3 h-8 w-8 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}
