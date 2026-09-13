import { style } from '@vanilla-extract/css';
import { space } from '@/styles';

export const page = style({
  maxWidth: '1440px',
  margin: '0 auto',
  padding: space.md,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 300px',
  gap: space.md,
  alignItems: 'start',
  '@media': {
    '(max-width: 1080px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
  },
});

export const main = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: space.md,
});

export const rail = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: space.md,
  position: 'sticky',
  top: '68px',
  '@media': {
    '(max-width: 1080px)': {
      position: 'static',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    },
  },
});
