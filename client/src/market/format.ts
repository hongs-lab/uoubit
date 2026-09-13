const won = new Intl.NumberFormat('ko-KR');

export const formatPrice = (v: number) => won.format(Math.round(v));

export const formatIndex = (v: number) =>
  v.toLocaleString('ko-KR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatSigned = (v: number, digits = 0) => {
  const sign = v > 0 ? '+' : v < 0 ? '−' : '';
  return `${sign}${Math.abs(v).toLocaleString('ko-KR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
};

export const formatRate = (v: number) => `${formatSigned(v, 2)}%`;

export const formatRating = (v: number) => v.toFixed(1);

export const formatCap = (v: number) => {
  if (v >= 100_000_000) return `${(v / 100_000_000).toFixed(1)}억`;
  if (v >= 10_000) return `${Math.round(v / 10_000).toLocaleString('ko-KR')}만`;
  return won.format(v);
};

export const direction = (v: number): 'rise' | 'fall' | 'flat' =>
  v > 0 ? 'rise' : v < 0 ? 'fall' : 'flat';

export const CONFIDENCE_LABEL = {
  high: '표본 충분',
  mid: '표본 보통',
  low: '표본 부족',
} as const;
