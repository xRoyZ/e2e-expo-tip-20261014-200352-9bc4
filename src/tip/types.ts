export type TipInput = {
  amount: string;
  tipPercent: string;
  partySize: string;
};

export type TipErrorCode =
  | 'required'
  | 'not-a-number'
  | 'negative'
  | 'out-of-range'
  | 'not-an-integer'
  | 'below-one';

export type FieldErrors = {
  amount?: TipErrorCode;
  tipPercent?: TipErrorCode;
  partySize?: TipErrorCode;
};

export type TipResult =
  | {
      ok: true;
      tipCents: number;
      totalCents: number;
      perPersonCents: number;
    }
  | {
      ok: false;
      errors: FieldErrors;
    };
