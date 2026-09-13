import { style } from '@vanilla-extract/css';
import { theme, text, numeric } from '@/styles';

export const frame = style({
  position: 'relative',
  minWidth: 0,
});

export const axis = style({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
});

export const tick = style({
  position: 'absolute',
  right: 0,
  transform: 'translateY(-50%)',
  ...text.label,
  ...numeric,
  color: theme.disabled,
  whiteSpace: 'nowrap',
});

export const lastTick = style([
  tick,
  {
    padding: '1px 4px',
    color: theme.surface,
    fontWeight: 700,
    borderRadius: '2px',
  },
]);
