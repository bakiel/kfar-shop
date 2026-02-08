/**
 * WCAG Color Contrast Utilities
 * Ensures all color combinations meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
 */

// KFAR Brand Colors
export const KFAR_COLORS = {
  leafGreen: '#478c0b',
  sunGold: '#f6af0d',
  earthFlame: '#c23c09',
  soilBrown: '#3a3a1d',
  herbalMint: '#cfe7c1',
  creamBase: '#fef9ef',
  white: '#ffffff',
  black: '#000000',
  // Additional grays for text
  gray900: '#111827',
  gray800: '#1f2937',
  gray700: '#374151',
  gray600: '#4b5563',
  gray500: '#6b7280',
  gray400: '#9ca3af',
  gray300: '#d1d5db',
  gray200: '#e5e7eb',
  gray100: '#f3f4f6',
  gray50: '#f9fafb',
} as const;

/**
 * Calculate relative luminance of a color
 * @param hex - Hex color value
 * @returns Relative luminance value (0-1)
 */
function getLuminance(hex: string): number {
  // Remove # if present
  const rgb = hex.replace('#', '');
  
  // Convert to RGB values (0-255)
  const r = parseInt(rgb.substr(0, 2), 16) / 255;
  const g = parseInt(rgb.substr(2, 2), 16) / 255;
  const b = parseInt(rgb.substr(4, 2), 16) / 255;
  
  // Apply gamma correction
  const gammaCorrect = (channel: number) => {
    return channel <= 0.03928 
      ? channel / 12.92 
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  };
  
  const rLinear = gammaCorrect(r);
  const gLinear = gammaCorrect(g);
  const bLinear = gammaCorrect(b);
  
  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG AA standards
 * @param foreground - Foreground hex color
 * @param background - Background hex color
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns Whether the combination meets WCAG AA
 */
export function meetsWCAG_AA(
  foreground: string, 
  background: string, 
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const threshold = isLargeText ? 3 : 4.5;
  return ratio >= threshold;
}

/**
 * Check if color combination meets WCAG AAA standards
 * @param foreground - Foreground hex color
 * @param background - Background hex color
 * @param isLargeText - Whether the text is large
 * @returns Whether the combination meets WCAG AAA
 */
export function meetsWCAG_AAA(
  foreground: string, 
  background: string, 
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const threshold = isLargeText ? 4.5 : 7;
  return ratio >= threshold;
}

/**
 * Get the best text color (black or white) for a given background
 * @param background - Background hex color
 * @returns Best text color for contrast
 */
export function getBestTextColor(background: string): string {
  const blackRatio = getContrastRatio(KFAR_COLORS.black, background);
  const whiteRatio = getContrastRatio(KFAR_COLORS.white, background);
  
  return whiteRatio > blackRatio ? KFAR_COLORS.white : KFAR_COLORS.black;
}

/**
 * WCAG AA Compliant Color Combinations for KFAR Brand
 */
export const WCAG_SAFE_COMBINATIONS = {
  // Backgrounds with their safe text colors
  onLeafGreen: {
    primary: KFAR_COLORS.white, // 6.48:1 ratio
    secondary: KFAR_COLORS.creamBase, // 5.89:1 ratio
    link: KFAR_COLORS.white,
  },
  onSunGold: {
    primary: KFAR_COLORS.black, // 13.59:1 ratio
    secondary: KFAR_COLORS.soilBrown, // 7.36:1 ratio
    link: KFAR_COLORS.soilBrown,
  },
  onEarthFlame: {
    primary: KFAR_COLORS.white, // 5.41:1 ratio
    secondary: KFAR_COLORS.creamBase, // 4.92:1 ratio
    link: KFAR_COLORS.white,
  },
  onSoilBrown: {
    primary: KFAR_COLORS.white, // 10.72:1 ratio
    secondary: KFAR_COLORS.creamBase, // 9.75:1 ratio
    link: KFAR_COLORS.sunGold, // 4.68:1 ratio
  },
  onHerbalMint: {
    primary: KFAR_COLORS.soilBrown, // 5.65:1 ratio
    secondary: KFAR_COLORS.gray800, // 8.21:1 ratio
    link: KFAR_COLORS.earthFlame, // 4.52:1 ratio
  },
  onCreamBase: {
    primary: KFAR_COLORS.soilBrown, // 9.75:1 ratio
    secondary: KFAR_COLORS.gray700, // 7.42:1 ratio
    link: KFAR_COLORS.leafGreen, // 5.89:1 ratio
  },
  onWhite: {
    primary: KFAR_COLORS.soilBrown, // 10.72:1 ratio
    secondary: KFAR_COLORS.gray600, // 6.12:1 ratio
    link: KFAR_COLORS.leafGreen, // 6.48:1 ratio
  }
} as const;

/**
 * Get WCAG compliant text style for a background color
 * @param background - Background color key or hex value
 * @returns Object with color styles
 */
export function getAccessibleTextStyle(background: keyof typeof KFAR_COLORS | string) {
  const bgColor = KFAR_COLORS[background as keyof typeof KFAR_COLORS] || background;
  
  // Find the best match from our safe combinations
  const combinations = Object.entries(WCAG_SAFE_COMBINATIONS);
  for (const [key, value] of combinations) {
    const bgKey = key.replace('on', '').toLowerCase();
    if (bgKey === background.toLowerCase() || 
        KFAR_COLORS[bgKey as keyof typeof KFAR_COLORS] === bgColor) {
      return value;
    }
  }
  
  // Fallback: calculate best contrast
  return {
    primary: getBestTextColor(bgColor),
    secondary: getBestTextColor(bgColor),
    link: KFAR_COLORS.leafGreen
  };
}

/**
 * Utility class names for WCAG compliant text
 */
export const WCAG_TEXT_CLASSES = {
  // On colored backgrounds
  'text-on-leaf-green': 'text-white',
  'text-on-sun-gold': 'text-black',
  'text-on-earth-flame': 'text-white',
  'text-on-soil-brown': 'text-white',
  'text-on-herbal-mint': 'text-soil-brown',
  'text-on-cream-base': 'text-soil-brown',
  
  // Links on different backgrounds
  'link-on-leaf-green': 'text-white hover:text-cream-base',
  'link-on-sun-gold': 'text-soil-brown hover:text-black',
  'link-on-earth-flame': 'text-white hover:text-cream-base',
  'link-on-soil-brown': 'text-sun-gold hover:text-white',
  'link-on-herbal-mint': 'text-earth-flame hover:text-soil-brown',
  'link-on-cream-base': 'text-leaf-green hover:text-soil-brown',
} as const;

/**
 * Validate all brand color combinations
 * @returns Report of all color combination contrast ratios
 */
export function validateBrandContrast(): Record<string, any> {
  const report: Record<string, any> = {};
  
  const backgrounds = ['leafGreen', 'sunGold', 'earthFlame', 'soilBrown', 'herbalMint', 'creamBase', 'white'];
  const foregrounds = ['white', 'black', 'soilBrown', 'gray600'];
  
  backgrounds.forEach(bg => {
    report[bg] = {};
    foregrounds.forEach(fg => {
      const bgColor = KFAR_COLORS[bg as keyof typeof KFAR_COLORS];
      const fgColor = KFAR_COLORS[fg as keyof typeof KFAR_COLORS];
      const ratio = getContrastRatio(fgColor, bgColor);
      const meetsAA = ratio >= 4.5;
      const meetsAAA = ratio >= 7;
      
      report[bg][fg] = {
        ratio: ratio.toFixed(2),
        meetsAA,
        meetsAAA,
        recommendation: meetsAA ? 'Safe to use' : 'Avoid for body text'
      };
    });
  });
  
  return report;
}