import { useId } from 'react';
import * as s from './PriceChart.css';
import { theme } from '@/styles';

interface Props {
  values: number[];
  baseline: number;
  height?: number;
  format: (v: number) => string;
  axisWidth?: number;
  gridLines?: number;
}

const VW = 1000;

export default function PriceChart({
  values,
  baseline,
  height = 200,
  format,
  axisWidth = 60,
  gridLines = 4,
}: Props) {
  const id = useId();
  const last = values[values.length - 1] ?? baseline;

  const rawMin = Math.min(...values, baseline);
  const rawMax = Math.max(...values, baseline);
  const rawSpan = rawMax - rawMin || Math.max(rawMax * 0.001, 1);
  const pad = rawSpan * 0.15;
  const min = rawMin - pad;
  const span = rawSpan + pad * 2;

  const stepX = values.length > 1 ? VW / (values.length - 1) : VW;
  const toY = (v: number) => height - ((v - min) / span) * height;

  const path = values.map((v, i) => `${i * stepX},${toY(v)}`).join(' ');
  const color =
    last > baseline ? theme.rise : last < baseline ? theme.fall : theme.flat;

  const ticks = Array.from({ length: gridLines + 1 }, (_, i) => {
    const v = min + (span / gridLines) * i;
    return { v, y: toY(v) };
  });

  const lastY = toY(last);

  return (
    <div className={s.frame} style={{ paddingRight: axisWidth }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${VW} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`시세 차트, 현재 ${format(last)}`}
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <line
            key={t.v}
            x1={0}
            y1={t.y}
            x2={VW}
            y2={t.y}
            stroke={theme.grid}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <line
          x1={0}
          y1={toY(baseline)}
          x2={VW}
          y2={toY(baseline)}
          stroke={theme.disabled}
          strokeWidth={1}
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />

        <polygon
          points={`0,${height} ${path} ${VW},${height}`}
          fill={`url(#${id})`}
        />
        <polyline
          points={path}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        <line
          x1={0}
          y1={lastY}
          x2={VW}
          y2={lastY}
          stroke={color}
          strokeWidth={1}
          strokeDasharray="2 2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className={s.axis} style={{ width: axisWidth }} aria-hidden="true">
        {ticks.map((t) => (
          <span key={t.v} className={s.tick} style={{ top: t.y }}>
            {format(t.v)}
          </span>
        ))}
        <span
          className={s.lastTick}
          style={{ top: lastY, backgroundColor: color }}
        >
          {format(last)}
        </span>
      </div>
    </div>
  );
}
