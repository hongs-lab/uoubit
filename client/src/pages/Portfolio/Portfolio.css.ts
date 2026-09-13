import { style } from '@vanilla-extract/css';
import { theme, space, rowHeight, text, numeric } from '@/styles';

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
});

export const summary = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
  gap: '1px',
  backgroundColor: theme.border,
});

export const cell = style({
  backgroundColor: theme.surface,
  padding: space.md,
  display: 'grid',
  gap: space.xxs,
});

export const cellLabel = style({ ...text.label, color: theme.muted });

export const cellValue = style({
  ...text.headline,
  ...numeric,
  color: theme.ink,
});

export const scroll = style({ minWidth: 0, overflowX: 'auto' });

export const table = style({ minWidth: '640px', ...numeric });

export const th = style({
  ...text.label,
  color: theme.muted,
  fontWeight: 400,
  textAlign: 'right',
  padding: `${space.xs} ${space.sm}`,
  borderBottom: `1px solid ${theme.border}`,
  whiteSpace: 'nowrap',
  backgroundColor: theme.control,
});

export const thLeft = style([th, { textAlign: 'left' }]);

export const row = style({
  height: rowHeight,
  borderBottom: `1px solid ${theme.border}`,
  ':hover': { backgroundColor: theme.rowHover },
});

export const td = style({
  padding: `0 ${space.sm}`,
  textAlign: 'right',
  whiteSpace: 'nowrap',
  ...text.cell,
  color: theme.body,
});

export const tdLeft = style([td, { textAlign: 'left' }]);

export const name = style({ ...text.cellStrong, color: theme.ink });

export const empty = style({
  padding: space.xl,
  textAlign: 'center',
  ...text.cell,
  color: theme.disabled,
});
