import { keyframes, style } from '@vanilla-extract/css';
import { theme, space, radius, control, text } from '@/styles';

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

export const overlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 100,
  background: 'rgba(18, 32, 26, 0.78)',
  animation: `${fadeIn} 200ms ease-out both`,
  '@media': { '(prefers-reduced-motion: reduce)': { animation: 'none' } },
});

export const highlight = style({
  position: 'fixed',
  border: `1px dashed ${theme.brandMark}`,
  borderRadius: radius.control,
  pointerEvents: 'none',
});

export const highlightFilled = style({
  background: 'rgba(0, 147, 88, 0.24)',
});

export const connector = style({
  position: 'fixed',
  color: theme.brandMark,
  pointerEvents: 'none',
});

export const dot = style({
  position: 'fixed',
  width: '5px',
  height: '5px',
  borderRadius: '50%',
  background: theme.brandMark,
  pointerEvents: 'none',
});

export const callout = style({
  position: 'fixed',
  width: 'max-content',
  padding: `${space.sm} ${space.md}`,
  borderRadius: radius.control,
  background: 'rgba(10, 14, 12, 0.92)',
  color: theme.onInk,
  pointerEvents: 'none',
});

export const calloutTitle = style({
  ...text.headline,
  color: theme.onInk,
  wordBreak: 'keep-all',
});

export const calloutBody = style({
  marginTop: '2px',
  ...text.cell,
  lineHeight: 1.5,
  color: theme.border,
  wordBreak: 'keep-all',
  textWrap: 'pretty',
});

export const mascot = style({
  position: 'fixed',
  left: space.xl,
  bottom: space.xl,
  display: 'flex',
  alignItems: 'flex-end',
  gap: space.lg,
  pointerEvents: 'none',
  '@media': { '(max-width: 720px)': { left: space.md, bottom: space.md } },
});

export const mascotImage = style({
  height: '104px',
  width: 'auto',
  '@media': { '(max-width: 720px)': { height: '76px' } },
});

export const bubble = style({
  position: 'relative',
  maxWidth: '340px',
  padding: `${space.sm} ${space.md}`,
  marginBottom: space.lg,
  borderRadius: radius.control,
  background: theme.surface,
  color: theme.ink,
  ...text.cell,
  lineHeight: 1.5,
  wordBreak: 'keep-all',
  textWrap: 'pretty',
  '::after': {
    content: '""',
    position: 'absolute',
    left: '-5px',
    bottom: '10px',
    width: 0,
    height: 0,
    borderTop: '5px solid transparent',
    borderBottom: '5px solid transparent',
    borderRight: `6px solid ${theme.surface}`,
  },
});

export const bubbleStrong = style({ fontWeight: 700 });

export const close = style({
  position: 'fixed',
  right: space.xl,
  bottom: space.xl,
  height: control.lg,
  padding: `0 ${space.xl}`,
  borderRadius: radius.control,
  background: theme.accent,
  color: theme.surface,
  ...text.body,
  fontWeight: 700,
  ':hover': { background: theme.accentHover },
  '@media': { '(max-width: 720px)': { right: space.md, bottom: space.md } },
});

export const hint = style({
  position: 'fixed',
  right: space.xl,
  bottom: `calc(${space.xl} + ${control.lg} + ${space.sm})`,
  ...text.label,
  color: theme.disabled,
  '@media': { '(max-width: 720px)': { display: 'none' } },
});
