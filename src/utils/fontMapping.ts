// Font mapping utilities for consistent font handling across the app

export const fontFamilies = [
  'Arial',
  'Georgia', 
  'Times New Roman',
  'Helvetica',
  'Verdana',
  'Comic Sans MS'
] as const;

export type FontFamily = typeof fontFamilies[number];

// Font URLs compatible with troika-three-text (3D text rendering)
export const fontUrlMap: Record<FontFamily, string> = {
  'Arial': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap',
  'Georgia': 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;700&display=swap',
  'Times New Roman': 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap',
  'Helvetica': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap',
  'Verdana': 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap',
  'Comic Sans MS': 'https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap'
};

// CSS font families for HTML preview consistency
export const cssFontMap: Record<FontFamily, string> = {
  'Arial': 'Arial, sans-serif',
  'Georgia': 'Georgia, serif', 
  'Times New Roman': 'Times, "Times New Roman", serif',
  'Helvetica': 'Helvetica, Arial, sans-serif',
  'Verdana': 'Verdana, sans-serif',
  'Comic Sans MS': '"Comic Sans MS", cursive'
};

export const getFontUrl = (fontFamily: string): string | undefined => {
  return fontUrlMap[fontFamily as FontFamily];
};

export const getCssFont = (fontFamily: string): string => {
  return cssFontMap[fontFamily as FontFamily] || fontFamily;
};