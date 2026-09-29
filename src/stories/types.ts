/** Color tone shared by Alert, Badge, Toast and Progress Bar. Maps to the .tone-* classes in theme.css */
export type Tone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export const TONES: Tone[] = ['info', 'success', 'warning', 'danger', 'neutral'];

/** Icon glyph shown for each tone by Alert and Toast */
export const TONE_ICONS: Record<Tone, string> = {
  info: 'i',
  success: '✓',
  warning: '!',
  danger: '✕',
  neutral: '•',
};

export type Size = 'small' | 'medium' | 'large';

export const SIZES: Size[] = ['small', 'medium', 'large'];

export interface User {
  name: string;
}
