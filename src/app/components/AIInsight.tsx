import { Sparkles } from 'lucide-react';

interface AIInsightProps {
  message: string;
}

export function AIInsight({ message }: AIInsightProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-success/20 bg-gradient-to-br from-success-light to-success-light/60 p-6 shadow-md">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
           style={{
             backgroundSize: '200% 100%',
             animation: 'shimmer 3s infinite'
           }}
      />

      <div className="relative z-10 flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success shadow-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>

        <div>
          <p className="mb-1 text-sm text-success-foreground/80" style={{ fontFamily: 'var(--font-family-display)' }}>
            AI 인사이트
          </p>
          <p className="text-success-foreground" style={{ lineHeight: '1.6' }}>
            {message}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
