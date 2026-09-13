const brand = {
  mark: '#009358',
  deep: '#006540',
} as const;

const palette = {
  accent: brand.deep,
  accentHover: '#004d31',
  brandMark: brand.mark,

  canvas: '#f2f3f5',
  surface: '#ffffff',
  control: '#f7f8f9',
  border: '#dcdee2',

  ink: '#1a1d21',
  body: '#333333',
  muted: '#5c6169',
  disabled: '#8c9199',

  rise: '#dd3c44',
  fall: '#1375ec',
} as const;

const extension = {
  rowHover: '#fafbfc',
  riseWeak: '#fdf3f4',
  fallWeak: '#f0f5fd',
  flat: '#5c6169',
  grid: '#eff0f2',
  inkSurface: '#111111',
  onInk: '#ffffff',
} as const;

const theme = { ...palette, ...extension } as const;

export default theme;
