import { style, styleVariants } from '@vanilla-extract/css';
import { theme, space, radius, control, text, numeric } from '@/styles';

export const bar = style({
  display: 'flex',
  alignItems: 'center',
  gap: space.sm,
  flexShrink: 0,
  ...numeric,
});

export const account = style({
  display: 'flex',
  alignItems: 'center',
  gap: space.sm,
  height: control.xs,
  padding: `0 ${space.sm}`,
  borderRadius: radius.control,
  border: `1px solid ${theme.border}`,
  backgroundColor: theme.surface,
  flexShrink: 0,
});

export const accountName = style({
  ...text.cell,
  fontWeight: 700,
  color: theme.ink,
  maxWidth: '12ch',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const accountCash = style({
  ...text.cell,
  ...numeric,
  color: theme.muted,
  paddingLeft: space.sm,
  borderLeft: `1px solid ${theme.border}`,
  whiteSpace: 'nowrap',
  '@media': { '(max-width: 860px)': { display: 'none' } },
});

export const logout = style({
  ...text.cell,
  color: theme.disabled,
  whiteSpace: 'nowrap',
  flexShrink: 0,
  padding: `0 ${space.xs}`,
  ':hover': { color: theme.body },
});

const buttonBase = style({
  height: control.xs,
  padding: `0 ${space.md}`,
  borderRadius: radius.control,
  border: `1px solid ${theme.border}`,
  ...text.cell,
  fontWeight: 700,
  whiteSpace: 'nowrap',
  transition: 'background-color 120ms ease',
});

export const button = styleVariants({
  primary: [
    buttonBase,
    {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
      color: theme.surface,
      ':hover': { backgroundColor: theme.accentHover },
    },
  ],
});

export const dialog = style({
  border: `1px solid ${theme.border}`,
  borderRadius: radius.control,
  padding: 0,
  width: 'min(320px, calc(100vw - 32px))',
  backgroundColor: theme.surface,
  color: theme.body,
  '::backdrop': { backgroundColor: 'rgba(26, 36, 52, 0.45)' },
});

export const head = style({
  display: 'flex',
  borderBottom: `1px solid ${theme.border}`,
});

export const tab = styleVariants({
  idle: [
    style({
      flex: 1,
      height: control.md,
      ...text.cell,
      fontWeight: 700,
      color: theme.disabled,
      backgroundColor: theme.control,
    }),
  ],
  active: [
    style({
      flex: 1,
      height: control.md,
      ...text.cell,
      fontWeight: 700,
      color: theme.ink,
      backgroundColor: theme.surface,
    }),
  ],
});

export const form = style({
  display: 'grid',
  gap: space.sm,
  padding: space.md,
});

export const input = style({
  height: control.md,
  padding: `0 ${space.sm}`,
  borderRadius: radius.control,
  border: `1px solid ${theme.border}`,
  backgroundColor: theme.surface,
  ...text.body,
  color: theme.ink,
  ':focus': { outline: 'none', borderColor: theme.accent },
});

export const submit = style([
  button.primary,
  { height: control.lg, width: '100%', ...text.body, fontWeight: 700 },
]);

export const error = style({
  ...text.label,
  color: theme.rise,
  minHeight: '1.5em',
});

export const hint = style({ ...text.label, color: theme.disabled });

export const close = style({
  position: 'absolute',
  top: space.sm,
  right: space.sm,
  ...text.cell,
  color: theme.disabled,
});
