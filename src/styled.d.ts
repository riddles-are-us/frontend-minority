import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    // Primary colors
    primary: string;
    primaryLight: string;
    primaryDark: string;
    
    // Secondary colors
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    
    // Accent colors
    accent: string;
    accentLight: string;
    accentDark: string;
    
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textLight: string;
    
    // Background colors
    bgPrimary: string;
    bgSecondary: string;
    bgDark: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
  }
} 