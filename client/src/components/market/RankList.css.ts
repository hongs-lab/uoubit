import { style } from '@vanilla-extract/css';
import { theme, space, text, numeric } from '@/styles';

export const list = style({ ...numeric });

export const item = style({
  display: 'grid',
  gridTemplateColumns: '18px minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: space.sm,
  height: '32px',
  padding: `0 ${space.md}`,
  borderBottom: `1px solid ${theme.grid}`,
  ':hover': { backgroundColor: theme.rowHover },
  selectors: { '&:last-child': { borderBottom: 'none' } },
});

export const order = style({ ...text.label, color: theme.disabled });

export const name = style({
  ...text.cell,
  color: theme.ink,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const sector = style({ color: theme.disabled, marginLeft: space.xs });

export const rate = style({ ...text.cellStrong });

export const empty = style({
  padding: space.md,
  ...text.label,
  color: theme.disabled,
});
