import type { TipInput, TipResult } from './types';

export function calculateTip(_input: TipInput): TipResult {
  return { ok: false, errors: {} };
}

export default calculateTip;
