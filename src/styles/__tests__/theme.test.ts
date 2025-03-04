import { describe, it, expect } from 'vitest';
import theme from '../theme';
import { Theme } from '../../types/theme';

describe('Theme', () => {
  it('has the correct color values', () => {
    expect(theme.colors.primary).toBe('#2E7D32');
    expect(theme.colors.primaryLight).toBe('#E8F5E9');
    expect(theme.colors.background).toBe('#D7CCC8');
    expect(theme.colors.backgroundAlt).toBe('#F0ECE0');
    expect(theme.colors.text).toBe('#212121');
    expect(theme.colors.textLight).toBe('#666666');
  });

  it('has the correct typography settings', () => {
    expect(theme.typography.fontFamily).toBe('"Roboto", sans-serif');
    expect(theme.typography.fontSize.body).toBe('16px');
    expect(theme.typography.fontSize.h1).toBe('20px');
    expect(theme.typography.fontSize.small).toBe('14px');
    expect(theme.typography.fontWeight.regular).toBe(400);
    expect(theme.typography.fontWeight.bold).toBe(700);
  });

  it('has the correct spacing scale', () => {
    expect(theme.space).toEqual([0, 4, 8, 16, 24, 32, 48, 64]);
  });

  it('has the correct border radii', () => {
    expect(theme.radii.sm).toBe('4px');
    expect(theme.radii.md).toBe('8px');
    expect(theme.radii.lg).toBe('12px');
  });

  it('has the correct animation settings', () => {
    expect(theme.animations.pulse).toBe('0.5s ease-in-out');
    expect(theme.animations.fade).toBe('0.3s linear');
  });

  it('has the correct layout settings', () => {
    expect(theme.layout.maxWidth).toBe('600px');
    expect(theme.layout.navHeight).toBe('48px');
  });

  it('implements all required theme properties', () => {
    // This test ensures that the theme object implements all properties defined in the Theme interface
    const themeKeys: (keyof Theme)[] = [
      'colors',
      'typography',
      'space',
      'radii',
      'animations',
      'layout'
    ];
    
    themeKeys.forEach(key => {
      expect(theme).toHaveProperty(key);
    });
    
    // Check nested properties
    expect(theme.colors).toHaveProperty('primary');
    expect(theme.colors).toHaveProperty('primaryLight');
    expect(theme.colors).toHaveProperty('background');
    expect(theme.colors).toHaveProperty('backgroundAlt');
    expect(theme.colors).toHaveProperty('text');
    expect(theme.colors).toHaveProperty('textLight');
    
    expect(theme.typography).toHaveProperty('fontFamily');
    expect(theme.typography).toHaveProperty('fontSize');
    expect(theme.typography).toHaveProperty('fontWeight');
    
    expect(theme.typography.fontSize).toHaveProperty('body');
    expect(theme.typography.fontSize).toHaveProperty('h1');
    expect(theme.typography.fontSize).toHaveProperty('small');
    
    expect(theme.typography.fontWeight).toHaveProperty('regular');
    expect(theme.typography.fontWeight).toHaveProperty('bold');
    
    expect(theme.radii).toHaveProperty('sm');
    expect(theme.radii).toHaveProperty('md');
    expect(theme.radii).toHaveProperty('lg');
    
    expect(theme.animations).toHaveProperty('pulse');
    expect(theme.animations).toHaveProperty('fade');
    
    expect(theme.layout).toHaveProperty('maxWidth');
    expect(theme.layout).toHaveProperty('navHeight');
  });
}); 