import { style, styleVariants } from '@vanilla-extract/css';
import { theme, numeric } from '@/styles';

const base = style({ ...numeric, fontWeight: 500 });

export const delta = styleVariants({
  rise: [base, { color: theme.rise }],
  fall: [base, { color: theme.fall }],
  flat: [base, { color: theme.flat }],
});
