import type { ReactNode } from 'react';
import { badge } from './Badge.css';
import type { Confidence } from '@/types/market';
import { CONFIDENCE_LABEL } from '@/market/format';

type Tone = keyof typeof badge;

export default function Badge({
  tone = 'quiet',
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return <span className={badge[tone]}>{children}</span>;
}

const TONE_BY_CONFIDENCE: Record<Confidence, Tone> = {
  high: 'accent',
  mid: 'quiet',
  low: 'warn',
};

export function ConfidenceBadge({
  confidence,
  reviewCount,
}: {
  confidence: Confidence;
  reviewCount: number;
}) {
  return (
    <Badge tone={TONE_BY_CONFIDENCE[confidence]}>
      {CONFIDENCE_LABEL[confidence]} · {reviewCount}
    </Badge>
  );
}
