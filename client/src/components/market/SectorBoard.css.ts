import { style } from '@vanilla-extract/css';
import { theme, space, text, numeric } from '@/styles';

export const list = style({ ...numeric });

const rowBase = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 44px 52px',
  alignItems: 'center',
  gap: space.sm,
  width: '100%',
  height: '32px',
  padding: `0 ${space.md}`,
  textAlign: 'left',
  borderBottom: `1px solid ${theme.grid}`,
  ':hover': { backgroundColor: theme.rowHover },
  selectors: { '&:last-child': { borderBottom: 'none' } },
});

export const row = rowBase;

export const rowActive = style([
  rowBase,
  {
    backgroundColor: theme.control,
    boxShadow: `inset 2px 0 0 ${theme.accent}`,
  },
]);

export const name = style({
  ...text.cell,
  color: theme.ink,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const count = style({ ...text.label, color: theme.disabled });

export const avg = style({
  ...text.cell,
  color: theme.body,
  textAlign: 'right',
});

export const rate = style({ ...text.cellStrong, textAlign: 'right' });
