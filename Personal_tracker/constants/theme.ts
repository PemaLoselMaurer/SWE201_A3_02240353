export const Colors = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#EEF2FF',
  secondary: '#F59E0B',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',

  bg: '#F8F9FC',
  surface: '#FFFFFF',
  border: '#EBEBF0',

  text: '#1E1E2D',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  // kept for tab bar compatibility
  light: {
    text: '#1E1E2D',
    background: '#F8F9FC',
    tint: '#6366F1',
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#6366F1',
  },
  dark: {
    text: '#F9FAFB',
    background: '#111827',
    tint: '#818CF8',
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#818CF8',
  },
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};
