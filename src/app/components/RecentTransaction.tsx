interface TransactionProps {
  merchant: string;
  date: string;
  amount: number;
  category: string;
}

export function RecentTransaction({ merchant, date, amount, category }: TransactionProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
          <span className="text-lg">{getCategoryEmoji(category)}</span>
        </div>

        <div>
          <p className="mb-0.5">{merchant}</p>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
      </div>

      <p className={`text-lg ${amount < 0 ? 'text-emerald-600' : 'text-red-500'}`} style={{ fontFamily: 'var(--font-family-display)' }}>
        {amount < 0
          ? `+${Math.abs(amount).toLocaleString('ko-KR')}원`
          : `-${amount.toLocaleString('ko-KR')}원`}
      </p>
    </div>
  );
}

function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    '식비': '🍽️',
    '카페': '☕',
    '교통': '🚇',
    '쇼핑': '🛍️',
    '문화': '🎬',
    '공과금': '💡',
  };
  return emojiMap[category] || '💳';
}
