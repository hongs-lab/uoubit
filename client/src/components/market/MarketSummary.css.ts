import { style } from '@vanilla-extract/css';
import { theme, space, text, numeric } from '@/styles';

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 260px) minmax(0, 1fr)',
  '@media': {
    '(max-width: 900px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
  },
});

export const left = style({
  padding: space.md,
  borderRight: `1px solid ${theme.border}`,
  '@media': {
    '(max-width: 900px)': {
      borderRight: 'none',
      borderBottom: `1px solid ${theme.border}`,
    },
  },
});

export const name = style({ ...text.label, color: theme.muted });

export const value = style({
  ...text.quote,
  ...numeric,
  marginTop: space.xs,
});

export const change = style({
  display: 'flex',
  gap: space.sm,
  ...text.body,
  fontWeight: 700,
  ...numeric,
});

export const breadth = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '1px',
  marginTop: space.md,
  backgroundColor: theme.border,
  border: `1px solid ${theme.border}`,
});

export const breadthCell = style({
  backgroundColor: theme.surface,
  padding: `${space.xs} ${space.sm}`,
  display: 'grid',
  gap: '1px',
});

export const breadthLabel = style({ ...text.label, color: theme.muted });

export const breadthValue = style({
  ...text.cellStrong,
  ...numeric,
  fontSize: '1.4rem',
});

export const right = style({ padding: space.md, minWidth: 0 });

export const chartHead = style({
  display: 'flex',
  justifyContent: 'space-between',
  ...text.label,
  color: theme.disabled,
  marginBottom: space.sm,
});
