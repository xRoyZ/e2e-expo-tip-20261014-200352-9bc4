import type { FieldErrors, TipErrorCode, TipInput, TipResult } from './types';

type ParsedNumber = {
  value: bigint;
  scale: number;
};

type FieldResult =
  | { ok: true; parsed: ParsedNumber }
  | { ok: false; code: TipErrorCode };

const DECIMAL_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

function isBlank(raw: string): boolean {
  return raw.trim() === '';
}

function parseNumber(raw: string): ParsedNumber | null {
  const normalized = raw.trim().replace(/,/g, '.');
  if (!DECIMAL_PATTERN.test(normalized)) {
    return null;
  }

  let body = normalized;
  let negative = false;
  if (body[0] === '+' || body[0] === '-') {
    negative = body[0] === '-';
    body = body.slice(1);
  }

  const dot = body.indexOf('.');
  let integerPart = dot >= 0 ? body.slice(0, dot) : body;
  const fractionPart = dot >= 0 ? body.slice(dot + 1) : '';
  if (integerPart === '') {
    integerPart = '0';
  }

  const digits = integerPart + fractionPart;
  const magnitude = digits === '' ? 0n : BigInt(digits);
  return { value: negative ? -magnitude : magnitude, scale: fractionPart.length };
}

function parseAmount(raw: string): FieldResult {
  if (isBlank(raw)) {
    return { ok: false, code: 'required' };
  }
  const parsed = parseNumber(raw);
  if (parsed === null) {
    return { ok: false, code: 'not-a-number' };
  }
  if (parsed.value < 0n) {
    return { ok: false, code: 'negative' };
  }
  return { ok: true, parsed };
}

function parseTipPercent(raw: string): FieldResult {
  if (isBlank(raw)) {
    return { ok: false, code: 'required' };
  }
  const parsed = parseNumber(raw);
  if (parsed === null) {
    return { ok: false, code: 'not-a-number' };
  }
  const upperBound = 100n * 10n ** BigInt(parsed.scale);
  if (parsed.value < 0n || parsed.value > upperBound) {
    return { ok: false, code: 'out-of-range' };
  }
  return { ok: true, parsed };
}

function parsePartySize(raw: string): FieldResult {
  if (isBlank(raw)) {
    return { ok: false, code: 'required' };
  }
  const parsed = parseNumber(raw);
  if (parsed === null) {
    return { ok: false, code: 'not-a-number' };
  }
  const factor = 10n ** BigInt(parsed.scale);
  if (factor !== 1n && parsed.value % factor !== 0n) {
    return { ok: false, code: 'not-an-integer' };
  }
  if (parsed.value / factor < 1n) {
    return { ok: false, code: 'below-one' };
  }
  return { ok: true, parsed };
}

function roundHalfUp(numerator: bigint, denominator: bigint): number {
  if (numerator < 0n) {
    return -roundHalfUp(-numerator, denominator);
  }
  const rounded = (2n * numerator + denominator) / (2n * denominator);
  return Number(rounded);
}

export function calculateTip(input: TipInput): TipResult {
  const errors: FieldErrors = {};

  const amount = parseAmount(input.amount);
  if (!amount.ok) {
    errors.amount = amount.code;
  }

  const tipPercent = parseTipPercent(input.tipPercent);
  if (!tipPercent.ok) {
    errors.tipPercent = tipPercent.code;
  }

  const partySize = parsePartySize(input.partySize);
  if (!partySize.ok) {
    errors.partySize = partySize.code;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const amountParsed = (amount as { ok: true; parsed: ParsedNumber }).parsed;
  const percentParsed = (tipPercent as { ok: true; parsed: ParsedNumber }).parsed;
  const partyParsed = (partySize as { ok: true; parsed: ParsedNumber }).parsed;

  const amountValue = amountParsed.value;
  const percentValue = percentParsed.value;
  const amountScale = amountParsed.scale;
  const percentScale = percentParsed.scale;
  const partyCount = partyParsed.value / 10n ** BigInt(partyParsed.scale);

  const denominator = 10n ** BigInt(amountScale + percentScale);

  const tipNumerator = amountValue * percentValue;
  const totalNumerator = amountValue * (100n * 10n ** BigInt(percentScale) + percentValue);

  const tipCents = roundHalfUp(tipNumerator, denominator);
  const totalCents = roundHalfUp(totalNumerator, denominator);
  const perPersonCents = roundHalfUp(totalNumerator, denominator * partyCount);

  return { ok: true, tipCents, totalCents, perPersonCents };
}

export default calculateTip;
