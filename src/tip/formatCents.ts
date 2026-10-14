function groupThousands(value: number): string {
  const digits = Math.trunc(value).toString();
  let grouped = '';
  for (let i = 0; i < digits.length; i += 1) {
    const remaining = digits.length - i;
    if (i > 0 && remaining % 3 === 0) {
      grouped += '.';
    }
    grouped += digits[i];
  }
  return grouped;
}

export function formatCents(cents: number): string {
  const rounded = Number.isFinite(cents) ? Math.round(cents) : 0;
  const negative = rounded < 0;
  const absolute = Math.abs(rounded);

  const euros = Math.floor(absolute / 100);
  const remainder = absolute % 100;

  const euroPart = groupThousands(euros);
  const centPart = remainder.toString().padStart(2, '0');

  return `${negative ? '-' : ''}${euroPart},${centPart} €`;
}

export default formatCents;
