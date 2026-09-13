import { style } from '@vanilla-extract/css';
import { theme, space, radius, control, text, numeric } from '@/styles';

export const page = style({
  maxWidth: '1440px',
  margin: '0 auto',
  padding: space.md,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 300px',
  gap: space.md,
  alignItems: 'start',
  '@media': {
    '(max-width: 1080px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
  },
});

export const main = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: space.md,
});

export const rail = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: space.md,
  '@media': {
    '(max-width: 1080px)': {
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    },
  },
});

export const back = style({
  ...text.label,
  color: theme.muted,
  gridColumn: '1 / -1',
  ':hover': { color: theme.accent },
});

export const identity = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: space.sm,
  flexWrap: 'wrap',
  padding: space.md,
  borderBottom: `1px solid ${theme.border}`,
});

export const name = style({ ...text.headline, color: theme.ink });

export const code = style({ ...text.label, ...numeric, color: theme.disabled });

export const quoteRow = style({
  display: 'flex',
  alignItems: 'flex-end',
  gap: space.md,
  flexWrap: 'wrap',
  padding: `${space.md} ${space.md} 0`,
});

export const price = style({ ...text.quote, ...numeric, fontSize: '3.6rem' });

export const change = style({
  display: 'flex',
  gap: space.sm,
  ...text.body,
  fontWeight: 700,
  ...numeric,
  paddingBottom: '4px',
});

export const basis = style({
  ...text.label,
  color: theme.disabled,
  padding: `${space.xs} ${space.md} ${space.md}`,
});

export const chartWrap = style({ padding: `0 ${space.md} ${space.md}` });

export const stats = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: '1px',
  backgroundColor: theme.border,
  borderTop: `1px solid ${theme.border}`,
});

export const stat = style({
  backgroundColor: theme.surface,
  padding: `${space.sm} ${space.md}`,
  display: 'grid',
  gap: '2px',
});

export const statLabel = style({ ...text.label, color: theme.muted });

export const statValue = style({
  ...text.cellStrong,
  ...numeric,
  fontSize: '1.4rem',
  color: theme.ink,
});

export const gauge = style({
  display: 'grid',
  gap: space.sm,
});

export const gaugeRow = style({ display: 'grid', gap: space.xxs });

export const gaugeHead = style({
  display: 'flex',
  justifyContent: 'space-between',
  ...text.label,
  color: theme.muted,
  ...numeric,
});

export const gaugeTrack = style({
  display: 'block',
  height: '6px',
  borderRadius: radius.control,
  backgroundColor: theme.control,
  overflow: 'hidden',
});

export const gaugeFill = style({ display: 'block', height: '100%' });

export const badges = style({
  display: 'flex',
  gap: space.xs,
  flexWrap: 'wrap',
  padding: `0 ${space.md} ${space.md}`,
});

export const cta = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: control.md,
  borderRadius: radius.control,
  backgroundColor: theme.accent,
  color: theme.onInk,
  ...text.cellStrong,
  transition: 'background-color 120ms ease',
  ':hover': { backgroundColor: theme.accentHover },
});

export const notFound = style({
  display: 'grid',
  gap: space.md,
  justifyItems: 'center',
  padding: space.xxl,
  ...text.body,
  color: theme.muted,
});
