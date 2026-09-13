import { useId } from 'react';
import { theme } from '@/styles';

interface Props {
  values: number[];
  baseline?: number;
  width?: number;
  height?: number;
  filled?: boolean;
  strokeWidth?: number;
  fluid?: boolean;
}

export default function Sparkline({
  values,
  baseline,
  width = 72,
  height = 24,
  filled = false,
  strokeWidth = 1.5,
  fluid = false,
}: Props) {
  const id = useId();
  const base = baseline ?? values[0] ?? 0;
  const last = values[values.length - 1] ?? base;

  const rawMin = Math.min(...values, base);
  const rawMax = Math.max(...values, base);
  const rawSpan = rawMax - rawMin || 1;

  const pad = rawSpan * 0.12;
  const min = rawMin - pad;
  const span = rawSpan + pad * 2;

  const stepX = values.length > 1 ? width / (values.length - 1) : width;
  const toY = (v: number) =>
    height - ((v - min) / span) * (height - strokeWidth) - strokeWidth / 2;

  const points = values.map((v, i) => `${i * stepX},${toY(v)}`).join(' ');
  const color =
    last > base ? theme.rise : last < base ? theme.fall : theme.flat;

  return (
    <svg
      width={fluid ? '100%' : width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={fluid ? 'none' : 'xMidYMid meet'}
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', overflow: fluid ? 'hidden' : 'visible' }}
    >
      {filled && (
        <>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <polygon
            points={`0,${height} ${points} ${width},${height}`}
            fill={`url(#${id})`}
          />
        </>
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect={fluid ? 'non-scaling-stroke' : undefined}
      />
    </svg>
  );
}
