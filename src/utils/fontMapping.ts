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

// Google Fonts URLs for troika-three-text (3D text rendering)
export const fontUrlMap: Record<FontFamily, string> = {
  'Arial': 'https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4taVIGxA.woff2',
  'Georgia': 'https://fonts.gstatic.com/s/crimsontext/v19/wlp2gwHKFkZgtmSR3NB0oRJX8A.woff2',
  'Times New Roman': 'https://fonts.gstatic.com/s/librebaskerville/v14/kmKnZrc3Hgbbcjq75U4uslyuy4kn0pNeYRI4CN2V.woff2',
  'Helvetica': 'https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4taVIGxA.woff2',
  'Verdana': 'https://fonts.gstatic.com/s/nunito/v26/XRXI3I6Li01BKofiOc5wtlZ2di8HDLshdTQ3j6zbXWjgevT.woff2',
  'Comic Sans MS': 'https://fonts.gstatic.com/s/comicsneue/v8/F0_gfi6x8LO_TUWl4k31JYiIMGCpWjfr.woff2'
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