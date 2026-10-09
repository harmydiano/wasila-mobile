export const NISAB = {
  asOf: '5 September 2026',
  currency: '£',
  silver: { grams: 595, value: 498 },
  gold: { grams: 87.5, value: 5410 },
};

export const ZAKAT_RATE = 0.025;

export function nisabValue(threshold: 'silver' | 'gold'): number {
  return threshold === 'silver' ? NISAB.silver.value : NISAB.gold.value;
}

export function money(n: number, decimals = 0): string {
  return `${NISAB.currency}${n.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
