export const Colors = {
  background: '#FFFFFF',
  surface: '#F4F4F4',
  border: '#E8E8E8',
  accent: '#E8FF47',
  accentForeground: '#0F0F0F',
  textPrimary: '#0F0F0F',
  textSecondary: '#6B7280',
  textDisabled: '#AAAAAA',
  success: '#22C55E',
  error: '#EF4444',
  tags: {
    KIDS: '#C4B5FD',
    YOGA: '#FCA5A5',
    MMA: '#FED7AA',
    BJJ: '#BFDBFE',
  } as Record<string, string>,
} as const;

export const Typography = {
  fontFamily: {
    regular: 'Geist-Regular',
    medium: 'Geist-Medium',
    semibold: 'Geist-SemiBold',
    bold: 'Geist-Bold',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 40,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;
