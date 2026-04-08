import type { BuilderTextEmphasis } from '~/types/order';

export interface BuilderTextStyle {
  fontWeight: '400' | '700';
  fontStyle: 'normal' | 'italic';
}

export function styleFromTextEmphasis(emphasis: BuilderTextEmphasis): BuilderTextStyle {
  if (emphasis === 'bold') {
    return { fontWeight: '700', fontStyle: 'normal' };
  }
  if (emphasis === 'italic') {
    return { fontWeight: '400', fontStyle: 'italic' };
  }
  return { fontWeight: '400', fontStyle: 'normal' };
}
