import { calculateTip } from './calculateTip';
import type { TipResult } from './types';

function expectOk(result: TipResult) {
  if (!result.ok) {
    throw new Error(`expected success but got errors ${JSON.stringify(result.errors)}`);
  }
  return result;
}

describe('calculateTip', () => {
  describe('valid input', () => {
    it('computes a normal case in whole cents', () => {
      const result = expectOk(calculateTip({ amount: '50', tipPercent: '10', partySize: '2' }));
      expect(result.tipCents).toBe(500);
      expect(result.totalCents).toBe(5500);
      expect(result.perPersonCents).toBe(2750);
    });

    it('accepts a comma as the decimal separator', () => {
      const result = expectOk(calculateTip({ amount: '42,50', tipPercent: '10', partySize: '2' }));
      expect(result.tipCents).toBe(425);
      expect(result.totalCents).toBe(4675);
      expect(result.perPersonCents).toBe(2338);
    });

    it('accepts a dot as the decimal separator and trims surrounding whitespace', () => {
      const result = expectOk(
        calculateTip({ amount: '  42.50 ', tipPercent: ' 10 ', partySize: ' 2 ' }),
      );
      expect(result.tipCents).toBe(425);
      expect(result.totalCents).toBe(4675);
      expect(result.perPersonCents).toBe(2338);
    });

    it('treats a zero amount and a zero percent as valid', () => {
      const result = expectOk(calculateTip({ amount: '0', tipPercent: '0', partySize: '1' }));
      expect(result.tipCents).toBe(0);
      expect(result.totalCents).toBe(0);
      expect(result.perPersonCents).toBe(0);
    });

    it('accepts the inclusive percent boundaries 0 and 100', () => {
      const zero = expectOk(calculateTip({ amount: '10', tipPercent: '0', partySize: '1' }));
      expect(zero.tipCents).toBe(0);
      expect(zero.totalCents).toBe(1000);

      const hundred = expectOk(calculateTip({ amount: '10', tipPercent: '100', partySize: '1' }));
      expect(hundred.tipCents).toBe(1000);
      expect(hundred.totalCents).toBe(2000);
      expect(hundred.perPersonCents).toBe(2000);
    });
  });

  describe('zero tip', () => {
    it('leaves the total equal to the amount when the tip is zero', () => {
      const result = expectOk(calculateTip({ amount: '80', tipPercent: '0', partySize: '4' }));
      expect(result.tipCents).toBe(0);
      expect(result.totalCents).toBe(8000);
      expect(result.perPersonCents).toBe(2000);
    });
  });

  describe('a single person', () => {
    it('splits the whole total onto the single person', () => {
      const result = expectOk(calculateTip({ amount: '42.50', tipPercent: '15', partySize: '1' }));
      expect(result.tipCents).toBe(638);
      expect(result.totalCents).toBe(4888);
      expect(result.perPersonCents).toBe(4888);
    });
  });

  describe('commercial rounding to full cents', () => {
    it('rounds a half cent up for the tip and the total', () => {
      const result = expectOk(calculateTip({ amount: '0.05', tipPercent: '10', partySize: '1' }));
      expect(result.tipCents).toBe(1);
      expect(result.totalCents).toBe(6);
      expect(result.perPersonCents).toBe(6);
    });

    it('rounds the per-person share at the half-cent boundary', () => {
      const result = expectOk(calculateTip({ amount: '10.05', tipPercent: '10', partySize: '2' }));
      expect(result.tipCents).toBe(101);
      expect(result.totalCents).toBe(1106);
      expect(result.perPersonCents).toBe(553);
    });

    it('rounds an amount ending in .005 half a cent up', () => {
      const result = expectOk(calculateTip({ amount: '0.005', tipPercent: '100', partySize: '1' }));
      expect(result.tipCents).toBe(1);
      expect(result.totalCents).toBe(1);
      expect(result.perPersonCents).toBe(1);
    });

    it('rounds a value below the half cent down', () => {
      const result = expectOk(calculateTip({ amount: '0.04', tipPercent: '10', partySize: '1' }));
      expect(result.tipCents).toBe(0);
      expect(result.totalCents).toBe(4);
      expect(result.perPersonCents).toBe(4);
    });
  });

  describe('invalid amount', () => {
    it('reports an empty amount as required', () => {
      const result = calculateTip({ amount: '', tipPercent: '10', partySize: '2' });
      expect(result).toEqual({ ok: false, errors: { amount: 'required' } });
    });

    it('reports a whitespace-only amount as required', () => {
      const result = calculateTip({ amount: '   ', tipPercent: '10', partySize: '2' });
      expect(result).toEqual({ ok: false, errors: { amount: 'required' } });
    });

    it('reports a non-numeric amount as not-a-number', () => {
      const result = calculateTip({ amount: 'abc', tipPercent: '10', partySize: '2' });
      expect(result).toEqual({ ok: false, errors: { amount: 'not-a-number' } });
    });

    it('reports a negative amount as negative', () => {
      const result = calculateTip({ amount: '-5', tipPercent: '10', partySize: '2' });
      expect(result).toEqual({ ok: false, errors: { amount: 'negative' } });
    });
  });

  describe('invalid tip percent', () => {
    it('reports an empty percent as required', () => {
      const result = calculateTip({ amount: '50', tipPercent: '', partySize: '2' });
      expect(result).toEqual({ ok: false, errors: { tipPercent: 'required' } });
    });

    it('reports a non-numeric percent as not-a-number', () => {
      const result = calculateTip({ amount: '50', tipPercent: 'abc', partySize: '2' });
      expect(result).toEqual({ ok: false, errors: { tipPercent: 'not-a-number' } });
    });

    it('reports a negative percent as out-of-range', () => {
      const result = calculateTip({ amount: '50', tipPercent: '-1', partySize: '2' });
      expect(result).toEqual({ ok: false, errors: { tipPercent: 'out-of-range' } });
    });

    it('reports a percent above 100 as out-of-range', () => {
      const result = calculateTip({ amount: '50', tipPercent: '101', partySize: '2' });
      expect(result).toEqual({ ok: false, errors: { tipPercent: 'out-of-range' } });
    });
  });

  describe('invalid party size', () => {
    it('reports an empty party size as required', () => {
      const result = calculateTip({ amount: '50', tipPercent: '10', partySize: '' });
      expect(result).toEqual({ ok: false, errors: { partySize: 'required' } });
    });

    it('reports a non-numeric party size as not-a-number', () => {
      const result = calculateTip({ amount: '50', tipPercent: '10', partySize: 'abc' });
      expect(result).toEqual({ ok: false, errors: { partySize: 'not-a-number' } });
    });

    it('reports a fractional party size as not-an-integer', () => {
      const result = calculateTip({ amount: '50', tipPercent: '10', partySize: '2.5' });
      expect(result).toEqual({ ok: false, errors: { partySize: 'not-an-integer' } });
    });

    it('reports zero as below-one', () => {
      const result = calculateTip({ amount: '50', tipPercent: '10', partySize: '0' });
      expect(result).toEqual({ ok: false, errors: { partySize: 'below-one' } });
    });

    it('reports a negative party size as below-one', () => {
      const result = calculateTip({ amount: '50', tipPercent: '10', partySize: '-1' });
      expect(result).toEqual({ ok: false, errors: { partySize: 'below-one' } });
    });
  });

  describe('collecting errors', () => {
    it('reports every invalid field at once', () => {
      const result = calculateTip({ amount: '', tipPercent: '', partySize: '' });
      expect(result).toEqual({
        ok: false,
        errors: { amount: 'required', tipPercent: 'required', partySize: 'required' },
      });
    });

    it('mixes different codes across the fields', () => {
      const result = calculateTip({ amount: 'abc', tipPercent: '200', partySize: '2.5' });
      expect(result).toEqual({
        ok: false,
        errors: {
          amount: 'not-a-number',
          tipPercent: 'out-of-range',
          partySize: 'not-an-integer',
        },
      });
    });
  });

  describe('purity', () => {
    it('does not throw for malformed input', () => {
      expect(() => calculateTip({ amount: '-', tipPercent: '..', partySize: '1e3' })).not.toThrow();
    });

    it('returns the same result for the same input', () => {
      const input = { amount: '19.99', tipPercent: '18', partySize: '3' };
      expect(calculateTip(input)).toEqual(calculateTip(input));
    });
  });
});
