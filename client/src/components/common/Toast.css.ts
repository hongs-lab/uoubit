import { style, styleVariants, keyframes } from '@vanilla-extract/css';
import { theme, space, radius, text } from '@/styles';

const rise = keyframes({
  from: { opacity: 0, transform: 'translateY(8px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});

export const layer = style({
  position: 'fixed',
  inset: 'auto 0 0 0',
  margin: `0 auto ${space.xl} auto`,
  width: 'fit-content',
  maxWidth: `calc(100vw - ${space.xl})`,
  padding: 0,
  border: 'none',
  background: 'none',
  overflow: 'visible',
  display: 'grid',
  gap: space.sm,
  justifyItems: 'center',
  pointerEvents: 'none',
});

const itemBase = style({
  display: 'flex',
  alignItems: 'center',
  gap: space.sm,
  minHeight: '38px',
  padding: `0 ${space.lg}`,
  borderRadius: radius.control,
  backgroundColor: theme.inkSurface,
  color: theme.onInk,
  ...text.body,
  fontWeight: 500,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.22)',
  animation: `${rise} 160ms ease-out`,
  whiteSpace: 'nowrap',
  maxWidth: '100%',
});

export const item = styleVariants({
  ok: [itemBase, { borderLeft: `3px solid ${theme.brandMark}` }],
  error: [itemBase, { borderLeft: `3px solid ${theme.rise}` }],
});

export const textWrap = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});
