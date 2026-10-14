export const colors = {
  bg: '#FFFFFF',
  surface: '#F6F7F9',
  fg: '#0F172A',
  muted: '#64748B',
  accent: '#0E9F6E',
  accentHover: '#0B8557',
  accentActive: '#096B45',
  accentSoft: '#E7F6EF',
  border: '#E2E8F0',
  borderFocus: '#0E9F6E',
  divider: '#EEF1F4',
  error: '#D64545',
  errorSoft: '#FDF2F2',
  onAccent: '#FFFFFF',
} as const;

export const spacing = {
  space0: 4,
  space1: 8,
  space2: 12,
  space3: 16,
  space4: 24,
  space5: 32,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  family: undefined,
  headingWeight: '600' as const,
  bodyWeight: '400' as const,
  labelWeight: '500' as const,
  sizeDisplay: 34,
  sizeH1: 26,
  sizeResult: 24,
  sizeBody: 16,
  sizeLabel: 13,
  sizeCaption: 12,
  lineHeight: 1.4,
} as const;

export const theme = { colors, spacing, radii, typography } as const;

export default theme;
