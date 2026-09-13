import { globalStyle, globalFontFace, keyframes } from '@vanilla-extract/css';
import theme from './theme';
import { sans } from './font';

export const pretendard = 'Pretendard';

globalFontFace(pretendard, {
  src: 'url("https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/woff2/PretendardVariable.woff2") format("woff2-variations")',
  fontWeight: '45 920',
  fontStyle: 'normal',
  fontDisplay: 'swap',
});

globalStyle('*, *::before, *::after', {
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
});

globalStyle('dialog', {
  margin: 'auto',
});

globalStyle('html, body, #root', {
  width: '100%',
  minHeight: '100dvh',
});

globalStyle('html', {
  fontSize: '62.5%',
  WebkitTextSizeAdjust: '100%',
});

globalStyle('body', {
  fontFamily: sans,
  fontSize: '1.4rem',
  lineHeight: 1.5,
  color: theme.body,
  backgroundColor: theme.canvas,
  WebkitFontSmoothing: 'antialiased',
});

globalStyle('button, input, select', {
  font: 'inherit',
  color: 'inherit',
});

globalStyle('button', {
  border: 'none',
  background: 'none',
  cursor: 'pointer',
});

globalStyle('a', {
  color: 'inherit',
  textDecoration: 'none',
});

globalStyle('table', {
  borderCollapse: 'collapse',
  width: '100%',
});

globalStyle(':focus-visible', {
  outline: `2px solid ${theme.accent}`,
  outlineOffset: '1px',
});

globalStyle('.sr-only', {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

globalStyle('*', {
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animationDuration: '0.01ms !important',
      transitionDuration: '0.01ms !important',
      scrollBehavior: 'auto',
    },
  },
});

export const flashRise = keyframes({
  '0%': { backgroundColor: theme.riseWeak },
  '60%': { backgroundColor: theme.riseWeak },
  '100%': { backgroundColor: 'transparent' },
});

export const flashFall = keyframes({
  '0%': { backgroundColor: theme.fallWeak },
  '60%': { backgroundColor: theme.fallWeak },
  '100%': { backgroundColor: 'transparent' },
});
