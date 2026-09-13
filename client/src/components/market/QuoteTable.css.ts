import { style, styleVariants } from '@vanilla-extract/css';
import { theme, space, radius, text, numeric, rowHeight } from '@/styles';
import { flashRise, flashFall } from '@/styles/global.css';

export const scroll = style({
  minWidth: 0,
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
});

export const table = style({
  minWidth: '760px',
  ...numeric,
  '@media': {
    '(max-width: 720px)': { minWidth: 0 },
  },
});

export const optional = style({
  '@media': {
    '(max-width: 720px)': { display: 'none' },
  },
});

export const th = style({
  ...text.cell,
  fontWeight: 600,
  color: theme.ink,
  textAlign: 'right',
  height: '34px',
  padding: `0 ${space.sm}`,
  borderBottom: `1px solid ${theme.border}`,
  whiteSpace: 'nowrap',
  backgroundColor: theme.control,
  position: 'sticky',
  top: 0,
  zIndex: 1,
});

export const sortButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2px',
  font: 'inherit',
  color: 'inherit',
  padding: 0,
  ':hover': { color: theme.accent },
});

export const arrow = styleVariants({
  off: [style({ ...text.label, color: theme.border })],
  on: [style({ ...text.label, color: theme.accent })],
});

export const thLeft = style([th, { textAlign: 'left' }]);

export const row = style({
  height: rowHeight,
  borderBottom: `1px solid ${theme.grid}`,
  cursor: 'pointer',
  ':hover': { backgroundColor: theme.rowHover },
  selectors: { '&:last-child': { borderBottom: 'none' } },
});

export const td = style({
  padding: `0 ${space.sm}`,
  textAlign: 'right',
  whiteSpace: 'nowrap',
  ...text.cell,
  color: theme.body,
});

export const tdLeft = style([td, { textAlign: 'left' }]);

export const rank = style([
  td,
  { ...text.label, color: theme.disabled, width: '40px' },
]);

export const nameCell = style([tdLeft, { width: '30%', minWidth: '164px' }]);

export const nameStack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1px',
  alignItems: 'flex-start',
});

export const name = style({
  ...text.cellStrong,
  color: theme.ink,
  ':hover': { textDecoration: 'underline' },
});

export const sector = style({ ...text.label, color: theme.disabled });

const priceBase = style([td, { ...text.cellStrong, color: theme.ink }]);

export const priceCell = styleVariants({
  flat: [priceBase],
  rise: [priceBase, { animation: `${flashRise} 420ms ease-out` }],
  fall: [priceBase, { animation: `${flashFall} 420ms ease-out` }],
});

export const chartCell = style([td, { width: '80px' }]);

export const chartInner = style({
  display: 'flex',
  justifyContent: 'flex-end',
});

export const volumeCell = style([td, { width: '92px' }]);

export const volumeBar = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: space.xs,
});

export const volumeTrack = style({
  display: 'block',
  flexShrink: 0,
  width: '38px',
  height: '4px',
  borderRadius: radius.control,
  backgroundColor: theme.control,
  overflow: 'hidden',
});

export const volumeFill = style({
  display: 'block',
  height: '100%',
  backgroundColor: theme.disabled,
});

export const capCell = style([td, { width: '84px', color: theme.muted }]);

export const empty = style({
  padding: `${space.xxl} ${space.md}`,
  textAlign: 'center',
  ...text.cell,
  color: theme.disabled,
});

export const more = style({
  width: '100%',
  height: '36px',
  ...text.cell,
  fontWeight: 700,
  color: theme.muted,
  backgroundColor: theme.control,
  borderTop: `1px solid ${theme.border}`,
  ':hover': { color: theme.accent },
});
