import { style, styleVariants } from '@vanilla-extract/css';
import { theme, space, radius, control, text, numeric } from '@/styles';

export const header = style({
  position: 'sticky',
  top: 0,
  zIndex: 20,
  backgroundColor: theme.surface,
  borderBottom: `1px solid ${theme.border}`,
});

export const inner = style({
  maxWidth: '1440px',
  margin: '0 auto',
  height: '52px',
  padding: `0 ${space.lg}`,
  '@media': { '(max-width: 380px)': { padding: `0 ${space.sm}`, gap: space.xs } },
  display: 'flex',
  alignItems: 'center',
  gap: space.md,
});

export const brand = style({
  display: 'flex',
  alignItems: 'center',
  gap: space.sm,
  minWidth: 0,
  flexShrink: 0,
});

export const logo = style({
  height: '24px',
  '@media': { '(max-width: 400px)': { height: '20px' } },
  width: 'auto',
  display: 'block',
  flexShrink: 0,
});

export const sub = style({
  ...text.cell,
  color: theme.muted,
  whiteSpace: 'nowrap',
  '@media': { '(max-width: 1040px)': { display: 'none' } },
});

export const nav = style({
  display: 'flex',
  alignItems: 'center',
  gap: space.xs,
  marginLeft: space.md,
  minWidth: 0,
  marginRight: 'auto',
  flexShrink: 0,
  '@media': { '(max-width: 560px)': { marginLeft: space.sm } },
});

const navItemBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  height: control.md,
  padding: `0 ${space.md}`,
  borderRadius: radius.control,
  ...text.body,
  whiteSpace: 'nowrap',
  flexShrink: 0,
  transition: 'color 120ms ease, background-color 120ms ease',
  '@media': {
    '(max-width: 560px)': { padding: `0 ${space.sm}` },
    '(max-width: 380px)': { padding: `0 ${space.xs}` },
  },
});

export const navItem = styleVariants({
  idle: [
    navItemBase,
    {
      color: theme.muted,
      fontWeight: 500,
      ':hover': { color: theme.ink, backgroundColor: theme.control },
    },
  ],
  active: [navItemBase, { color: theme.ink, fontWeight: 700 }],
});

export const live = style({
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: space.sm,
  paddingLeft: space.md,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  ...numeric,
  '@media': {
    '(max-width: 680px)': { display: 'none' },
  },
});

export const liveLabel = style({
  ...text.label,
  color: theme.muted,
  whiteSpace: 'nowrap',
  '@media': { '(max-width: 780px)': { display: 'none' } },
});

export const liveValue = style({
  ...text.title,
  ...numeric,
  color: theme.ink,
});

export const liveRate = style({ ...text.cell, fontWeight: 700 });

export const dot = style({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: theme.rise,
  flexShrink: 0,
});

export const clock = style({
  ...text.label,
  ...numeric,
  color: theme.disabled,
  whiteSpace: 'nowrap',
  '@media': { '(max-width: 900px)': { display: 'none' } },
});
