import { style, styleVariants } from '@vanilla-extract/css';
import { theme, space, radius, text } from '@/styles';

const base = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: space.xs,
  height: '22px',
  padding: `0 ${space.sm}`,
  borderRadius: radius.control,
  border: `1px solid ${theme.border}`,
  whiteSpace: 'nowrap',
  ...text.label,
});

export const badge = styleVariants({
  quiet: [base, { backgroundColor: theme.surface, color: theme.ink }],
  accent: [
    base,
    {
      backgroundColor: theme.surface,
      color: theme.accent,
      borderColor: theme.accent,
    },
  ],
  warn: [
    base,
    {
      backgroundColor: theme.riseWeak,
      color: theme.rise,
      borderColor: theme.rise,
    },
  ],
  fill: [
    base,
    {
      backgroundColor: theme.control,
      color: theme.muted,
      borderColor: 'transparent',
    },
  ],
});
