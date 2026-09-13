import { style, styleVariants } from '@vanilla-extract/css';
import { theme, space, radius, control, text, numeric } from '@/styles';

export const book = style({ ...numeric });

export const level = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  alignItems: 'center',
  height: '22px',
  padding: `0 ${space.sm}`,
  ...text.cell,
  position: 'relative',
});

export const levelPrice = styleVariants({
  ask: [style({ color: theme.rise, fontWeight: 700 })],
  bid: [style({ color: theme.fall, fontWeight: 700 })],
});

export const levelQty = style({
  textAlign: 'right',
  color: theme.muted,
  position: 'relative',
});

export const depth = style({
  position: 'absolute',
  top: '2px',
  bottom: '2px',
  right: 0,
  opacity: 0.14,
  pointerEvents: 'none',
});

export const spread = style({
  display: 'flex',
  justifyContent: 'space-between',
  padding: `${space.xs} ${space.sm}`,
  borderTop: `1px solid ${theme.border}`,
  borderBottom: `1px solid ${theme.border}`,
  backgroundColor: theme.control,
  ...text.cellStrong,
  ...numeric,
});

export const stats = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1px',
  backgroundColor: theme.border,
  borderTop: `1px solid ${theme.border}`,
});

export const stat = style({
  backgroundColor: theme.surface,
  padding: `${space.xs} ${space.sm}`,
});

export const statLabel = style({ ...text.label, color: theme.muted });

export const statValue = style({
  ...text.cellStrong,
  ...numeric,
  color: theme.ink,
  display: 'block',
});

export const form = style({
  display: 'grid',
  gap: space.sm,
  padding: space.md,
  borderTop: `1px solid ${theme.border}`,
});

export const row = style({
  display: 'flex',
  alignItems: 'center',
  gap: space.sm,
  ...text.cell,
});

export const label = style({
  color: theme.muted,
  width: '48px',
  flexShrink: 0,
});

export const qtyInput = style({
  flex: 1,
  minWidth: 0,
  height: control.sm,
  padding: `0 ${space.sm}`,
  borderRadius: radius.control,
  border: `1px solid ${theme.border}`,
  textAlign: 'right',
  ...text.body,
  ...numeric,
  color: theme.ink,
  ':focus': { outline: 'none', borderColor: theme.accent },
});

export const quick = style({
  height: control.xs,
  padding: `0 ${space.sm}`,
  borderRadius: radius.control,
  border: `1px solid ${theme.border}`,
  backgroundColor: theme.surface,
  color: theme.ink,
  ...text.cell,
  ':hover': { backgroundColor: theme.control },
});

export const quickRow = style({ display: 'flex', gap: space.xs });

export const estimate = style({
  display: 'flex',
  justifyContent: 'space-between',
  ...text.label,
  ...numeric,
  color: theme.muted,
});

export const actions = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: space.sm,
});

const actionBase = style({
  height: control.lg,
  borderRadius: radius.control,
  ...text.body,
  fontWeight: 700,
  color: theme.surface,
  transition: 'opacity 120ms ease',
  ':disabled': { opacity: 0.4, cursor: 'not-allowed' },
});

export const action = styleVariants({
  buy: [actionBase, { backgroundColor: theme.rise }],
  sell: [actionBase, { backgroundColor: theme.fall }],
});

export const message = styleVariants({
  ok: [style({ ...text.label, color: theme.accent, minHeight: '1.5em' })],
  error: [style({ ...text.label, color: theme.rise, minHeight: '1.5em' })],
});

export const position = style({
  display: 'flex',
  justifyContent: 'space-between',
  padding: `${space.xs} ${space.sm}`,
  backgroundColor: theme.control,
  borderRadius: radius.control,
  ...text.cell,
  ...numeric,
});

export const guest = style({
  padding: space.md,
  textAlign: 'center',
  ...text.cell,
  color: theme.muted,
  borderTop: `1px solid ${theme.border}`,
});
