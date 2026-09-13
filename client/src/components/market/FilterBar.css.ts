import { style, styleVariants } from '@vanilla-extract/css';
import { theme, space, radius, control, text } from '@/styles';

export const bar = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: space.sm,
  padding: space.sm,
  borderBottom: `1px solid ${theme.border}`,
  backgroundColor: theme.surface,
});

const field = style({
  height: control.sm,
  padding: `0 ${space.sm}`,
  borderRadius: radius.control,
  border: `1px solid ${theme.border}`,
  backgroundColor: theme.surface,
  ...text.cell,
  color: theme.ink,
  ':focus': { outline: 'none', borderColor: theme.accent },
});

export const search = style([
  field,
  {
    flex: '1 1 180px',
    minWidth: 0,
    '::placeholder': { color: theme.disabled },
  },
]);

export const select = style([
  field,
  {
    flex: '0 0 auto',
    minWidth: '130px',
    paddingRight: space.xl,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='%238e929b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `right ${space.xs} center`,
  },
]);

const tabBase = style({
  height: control.sm,
  padding: `0 ${space.md}`,
  borderRadius: radius.control,
  ...text.cell,
  fontWeight: 700,
  border: '1px solid transparent',
});

export const tab = styleVariants({
  idle: [
    tabBase,
    { color: theme.muted, ':hover': { backgroundColor: theme.control } },
  ],
  active: [
    tabBase,
    {
      color: theme.accent,
      backgroundColor: theme.surface,
      borderColor: theme.accent,
    },
  ],
});

export const group = style({
  display: 'flex',
  gap: space.xxs,
  flexWrap: 'wrap',
});

export const divider = style({
  width: '1px',
  height: '18px',
  backgroundColor: theme.border,
  '@media': { '(max-width: 720px)': { display: 'none' } },
});

export const count = style({
  ...text.label,
  color: theme.disabled,
  marginLeft: 'auto',
  paddingRight: space.xs,
  whiteSpace: 'nowrap',
});
