import { style } from '@vanilla-extract/css';
import { theme, space, radius, text } from '@/styles';

export const panel = style({
  backgroundColor: theme.surface,
  border: `1px solid ${theme.border}`,
  borderRadius: radius.control,
  minWidth: 0,
  overflow: 'hidden',
});

export const head = style({
  display: 'flex',
  alignItems: 'center',
  gap: space.sm,
  height: '36px',
  padding: `0 ${space.md}`,
  borderBottom: `1px solid ${theme.border}`,
  backgroundColor: theme.control,
});

export const title = style({
  ...text.cellStrong,
  color: theme.ink,
  whiteSpace: 'nowrap',
});

export const note = style({
  ...text.label,
  color: theme.disabled,
  marginLeft: 'auto',
  whiteSpace: 'nowrap',
});

export const bodyPad = style({ padding: space.md });
