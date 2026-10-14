import { formatCents } from './formatCents';

describe('formatCents', () => {
  it('formats zero', () => {
    expect(formatCents(0)).toBe('0,00 €');
  });

  it('formats whole euros with two decimals', () => {
    expect(formatCents(1000)).toBe('10,00 €');
  });

  it('formats a value with cents', () => {
    expect(formatCents(505)).toBe('5,05 €');
  });

  it('formats the acceptance example values', () => {
    expect(formatCents(1000)).toBe('10,00 €');
    expect(formatCents(11000)).toBe('110,00 €');
    expect(formatCents(5500)).toBe('55,00 €');
  });

  it('groups thousands with a dot, German style', () => {
    expect(formatCents(123456)).toBe('1.234,56 €');
  });

  it('rounds to whole cents', () => {
    expect(formatCents(199.6)).toBe('2,00 €');
  });

  it('formats a negative value with a leading minus', () => {
    expect(formatCents(-505)).toBe('-5,05 €');
  });
});
