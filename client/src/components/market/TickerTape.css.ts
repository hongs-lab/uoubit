import { style, keyframes } from '@vanilla-extract/css';
import { theme, space, text, numeric } from '@/styles';

const scroll = keyframes({
  '0%': { transform: 'translateX(0)' },
  '100%': { transform: 'translateX(-50%)' },
});

export const tape = style({
  backgroundColor: theme.inkSurface,
  overflow: 'hidden',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
});

export const track = style({
  display: 'flex',
  width: 'max-content',
  animation: `${scroll} 90s linear infinite`,
  ':hover': { animationPlayState: 'paused' },
  '@media': {
    '(prefers-reduced-motion: reduce)': { animation: 'none' },
  },
});

export const item = style({
  display: 'flex',
  alignItems: 'center',
  gap: space.sm,
  padding: `0 ${space.md}`,
  ...text.cell,
  ...numeric,
  color: theme.border,
  whiteSpace: 'nowrap',
  borderRight: `1px solid rgba(255, 255, 255, 0.08)`,
});

export const itemName = style({ color: theme.surface, fontWeight: 700 });
