import { style } from '@vanilla-extract/css';
import { theme, space, text } from '@/styles';

export const list = style({
  margin: 0,
  paddingLeft: '1.3em',
  display: 'grid',
  gap: space.xs,
  ...text.label,
  lineHeight: 1.6,
  color: theme.muted,
});

export const term = style({ color: theme.ink, fontWeight: 700 });

export const link = style({
  color: theme.accent,
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
});
