'use client';

interface PriceCardProps {
  price: number | null;
  previousPrice: number | null;
}

export function PriceCard({ price, previousPrice }: PriceCardProps) {
  const formatPrice = (p: number) => p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const hasPrices = price !== null && previousPrice !== null;
  const delta = hasPrices ? price - previousPrice : 0;
  const pct = hasPrices && previousPrice !== 0 ? ((delta / previousPrice) * 100).toFixed(2) : '0.00';
  const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
  const changeColor = delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-red-600' : 'text-slate-500';

  return (
    <section
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-epilot-sm"
      aria-live="polite"
      aria-label="Current BTC to USD price"
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">BTC/USD</span>
        <span className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-xl font-mono">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          LIVE
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl text-slate-500 font-medium">$</span>
        <span className="text-3xl font-bold font-mono tracking-tight">
          {price ? formatPrice(price) : '--,---.--'}
        </span>
      </div>
      <div className={`flex items-center gap-2 mt-2 text-sm font-mono ${changeColor}`} aria-label="Price change indicator">
        <span>{arrow}</span>
        <span>{delta > 0 ? '+' : ''}{pct}%</span>
        <span className="sr-only">
          {delta > 0 && 'Price increased'}
          {delta < 0 && 'Price decreased'}
          {delta === 0 && 'No price change'}
        </span>
      </div>
    </section>
  );
}

