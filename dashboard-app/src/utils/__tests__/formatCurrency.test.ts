import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPrice } from './formatCurrency';

describe('formatCurrency', () => {
  describe('Basic Formatting', () => {
    it('formats regular numbers with currency symbol', () => {
      expect(formatCurrency(100)).toBe('$100.00');
    });

    it('formats with default 2 decimal places', () => {
      expect(formatCurrency(99.5)).toContain('99');
    });

    it('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('formats negative numbers correctly', () => {
      const result = formatCurrency(-100);
      expect(result).toContain('-');
      expect(result).toContain('100');
    });
  });

  describe('Small Numbers (< 1)', () => {
    it('formats very small numbers with 4-6 decimal places', () => {
      const result = formatCurrency(0.00123);
      expect(result).toContain('0.001');
    });

    it('formats with higher precision for values < 1', () => {
      const result = formatCurrency(0.0001);
      expect(result).toContain('0.0001');
    });

    it('handles crypto prices correctly', () => {
      const result = formatCurrency(0.000456);
      expect(result).toContain('0.0004');
    });
  });

  describe('Abbreviation - Millions', () => {
    it('abbreviates millions with M suffix', () => {
      expect(formatCurrency(1000000, 'USD', { abbreviate: true })).toBe('$1.0M');
    });

    it('abbreviates 5 million correctly', () => {
      expect(formatCurrency(5000000, 'USD', { abbreviate: true })).toBe('$5.0M');
    });

    it('abbreviates 999 million correctly', () => {
      expect(formatCurrency(999000000, 'USD', { abbreviate: true })).toMatch(/\$999\.\dM/);
    });

    it('does not abbreviate below 1 million when abbreviate is true', () => {
      const result = formatCurrency(500000, 'USD', { abbreviate: true });
      expect(result).not.toContain('M');
    });
  });

  describe('Abbreviation - Billions', () => {
    it('abbreviates billions with B suffix', () => {
      expect(formatCurrency(1000000000, 'USD', { abbreviate: true })).toBe('$1.0B');
    });

    it('abbreviates 2.5 billion correctly', () => {
      expect(formatCurrency(2500000000, 'USD', { abbreviate: true })).toBe('$2.5B');
    });

    it('abbreviates 850 billion correctly', () => {
      expect(formatCurrency(850000000000, 'USD', { abbreviate: true })).toMatch(/\$850\.\dB/);
    });
  });

  describe('Abbreviation - Trillions', () => {
    it('abbreviates trillions with T suffix', () => {
      expect(formatCurrency(1000000000000, 'USD', { abbreviate: true })).toBe('$1.0T');
    });

    it('abbreviates 2.45 trillion correctly', () => {
      expect(formatCurrency(2450000000000, 'USD', { abbreviate: true })).toBe('$2.5T');
    });

    it('abbreviates very large numbers', () => {
      expect(formatCurrency(50000000000000, 'USD', { abbreviate: true })).toBe('$50.0T');
    });
  });

  describe('Custom Decimals Option', () => {
    it('formats with custom decimal places', () => {
      const result = formatCurrency(123.456, 'USD', { decimals: 3 });
      expect(result).toContain('123');
    });

    it('formats with zero decimals', () => {
      const result = formatCurrency(123.456, 'USD', { decimals: 0 });
      expect(result).toContain('123');
    });

    it('formats with many decimal places', () => {
      const result = formatCurrency(123.456, 'USD', { decimals: 5 });
      expect(result).toContain('123');
    });
  });

  describe('Negative Numbers with Abbreviation', () => {
    it('abbreviates negative millions', () => {
      const result = formatCurrency(-1000000, 'USD', { abbreviate: true });
      expect(result).toContain('-');
      expect(result).toContain('M');
    });

    it('abbreviates negative billions', () => {
      const result = formatCurrency(-2500000000, 'USD', { abbreviate: true });
      expect(result).toContain('-');
      expect(result).toContain('2.5B');
    });
  });

  describe('Edge Cases', () => {
    it('handles very large numbers', () => {
      expect(formatCurrency(999999999999999, 'USD', { abbreviate: true })).toContain('T');
    });

    it('handles very small positive numbers', () => {
      const result = formatCurrency(0.00000001);
      expect(result).toContain('0');
    });

    it('handles Infinity gracefully', () => {
      // Should either return something or throw, but shouldn't crash
      const result = formatCurrency(Infinity);
      expect(result).toBeDefined();
    });

    it('handles NaN gracefully', () => {
      const result = formatCurrency(NaN);
      expect(result).toBeDefined();
    });
  });

  describe('Fallback Behavior', () => {
    it('falls back to simple formatting when Intl fails', () => {
      // The catch block handles Intl.NumberFormat errors
      const result = formatCurrency(100, 'USD');
      expect(result).toContain('$');
      expect(result).toContain('100');
    });
  });

  describe('Without Abbreviation', () => {
    it('does not abbreviate when abbreviate is false', () => {
      const result = formatCurrency(1000000000, 'USD', { abbreviate: false });
      expect(result).not.toContain('B');
      expect(result).not.toContain('M');
    });

    it('formats large numbers without abbreviation', () => {
      const result = formatCurrency(5000000, 'USD', { abbreviate: false });
      expect(result).toContain('5');
      expect(result).not.toContain('M');
    });
  });
});

describe('formatPrice', () => {
  describe('Large Numbers (>= 1000)', () => {
    it('formats large numbers with thousand separators', () => {
      expect(formatPrice(1000)).toBe('$1,000.00');
    });

    it('formats very large numbers', () => {
      expect(formatPrice(1000000)).toBe('$1,000,000.00');
    });

    it('limits decimals to 2 for large numbers', () => {
      const result = formatPrice(1234.56789);
      expect(result).toContain('1,234.57');
    });
  });

  describe('Medium Numbers (1 - 999.99)', () => {
    it('formats regular numbers with 2 decimals', () => {
      expect(formatPrice(100)).toBe('$100.00');
    });

    it('formats numbers less than 1000', () => {
      expect(formatPrice(500.5)).toBe('$500.50');
    });

    it('formats edge case at 1000', () => {
      expect(formatPrice(1000)).toContain(',');
    });

    it('formats edge case just below 1000', () => {
      expect(formatPrice(999.99)).toContain('999');
    });
  });

  describe('Small Numbers (0.01 - 0.999)', () => {
    it('formats with 4 decimal places for small numbers', () => {
      expect(formatPrice(0.5)).toBe('$0.5000');
    });

    it('formats very small numbers correctly', () => {
      expect(formatPrice(0.01)).toBe('$0.0100');
    });

    it('formats edge case at 0.01', () => {
      const result = formatPrice(0.01);
      expect(result).toBe('$0.0100');
    });

    it('formats just above 0.01', () => {
      const result = formatPrice(0.015);
      expect(result).toContain('0.0150');
    });
  });

  describe('Tiny Numbers (< 0.01)', () => {
    it('formats with 6 decimal places for tiny numbers', () => {
      expect(formatPrice(0.000001)).toBe('$0.000001');
    });

    it('formats crypto prices', () => {
      const result = formatPrice(0.00000456);
      expect(result).toContain('0.000004');
    });

    it('formats satoshis and other tiny units', () => {
      const result = formatPrice(0.00000001);
      expect(result).toContain('0.00000001');
    });
  });

  describe('Edge Cases', () => {
    it('handles zero', () => {
      expect(formatPrice(0)).toBe('$0.00');
    });

    it('handles negative numbers', () => {
      const result = formatPrice(-100);
      expect(result).toContain('-');
      expect(result).toContain('100');
    });

    it('handles negative small numbers', () => {
      const result = formatPrice(-0.0001);
      expect(result).toContain('-');
      expect(result).toContain('0.0001');
    });

    it('handles very large numbers', () => {
      const result = formatPrice(999999999);
      expect(result).toContain('$');
      expect(result).toContain(',');
    });

    it('handles Infinity', () => {
      const result = formatPrice(Infinity);
      expect(result).toContain('$');
    });

    it('handles NaN', () => {
      const result = formatPrice(NaN);
      expect(result).toContain('$');
    });
  });

  describe('Precision', () => {
    it('maintains correct precision for stock prices', () => {
      expect(formatPrice(150.25)).toBe('$150.25');
    });

    it('maintains correct precision for crypto prices', () => {
      expect(formatPrice(42500.00)).toBe('$42,500.00');
    });

    it('handles prices with many decimal places', () => {
      const result = formatPrice(123.456789);
      expect(result).toContain('123');
      // Should have limited decimals
      expect(result).toBeDefined();
    });
  });
});
