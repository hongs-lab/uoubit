export const sans =
  "Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', Roboto, sans-serif";

export const numeric = {
  fontVariantNumeric: 'tabular-nums',
  fontFeatureSettings: '"tnum" 1',
} as const;

export const text = {
  quote: { fontSize: '2.8rem', lineHeight: 1.2, fontWeight: 700 },
  headline: { fontSize: '1.8rem', lineHeight: 1.3, fontWeight: 700 },
  title: { fontSize: '1.5rem', lineHeight: 1.35, fontWeight: 700 },
  body: { fontSize: '1.4rem', lineHeight: '2.1rem', fontWeight: 400 },
  cell: { fontSize: '1.2rem', lineHeight: 1.4, fontWeight: 400 },
  cellStrong: { fontSize: '1.2rem', lineHeight: 1.4, fontWeight: 700 },
  label: { fontSize: '1.1rem', lineHeight: 1.4, fontWeight: 400 },
} as const;
