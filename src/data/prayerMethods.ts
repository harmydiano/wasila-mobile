import { CalculationMethod, Madhab, type CalculationParameters } from 'adhan';

export type MethodId =
  | 'mwl'
  | 'egyptian'
  | 'karachi'
  | 'ummAlQura'
  | 'dubai'
  | 'qatar'
  | 'kuwait'
  | 'moonsighting'
  | 'singapore'
  | 'turkey'
  | 'tehran'
  | 'northAmerica';

export type AsrRule = 'shafi' | 'hanafi';

export type PrayerMethod = { method: MethodId; asr: AsrRule };

export const DEFAULT_PRAYER_METHOD: PrayerMethod = { method: 'mwl', asr: 'shafi' };

export const METHODS: { id: MethodId; label: string; short: string; where: string; make: () => CalculationParameters }[] = [
  { id: 'mwl', label: 'Muslim World League', short: 'MWL', where: 'Europe, the Far East, parts of Africa', make: () => CalculationMethod.MuslimWorldLeague() },
  { id: 'egyptian', label: 'Egyptian General Authority', short: 'Egypt', where: 'Egypt, much of Africa, Syria, Lebanon', make: () => CalculationMethod.Egyptian() },
  { id: 'karachi', label: 'University of Islamic Sciences, Karachi', short: 'Karachi', where: 'Pakistan, India, Bangladesh, Afghanistan', make: () => CalculationMethod.Karachi() },
  { id: 'ummAlQura', label: 'Umm al-Qura, Makkah', short: 'Umm al-Qura', where: 'Saudi Arabia', make: () => CalculationMethod.UmmAlQura() },
  { id: 'dubai', label: 'Dubai', short: 'Dubai', where: 'United Arab Emirates', make: () => CalculationMethod.Dubai() },
  { id: 'qatar', label: 'Qatar', short: 'Qatar', where: 'Qatar', make: () => CalculationMethod.Qatar() },
  { id: 'kuwait', label: 'Kuwait', short: 'Kuwait', where: 'Kuwait', make: () => CalculationMethod.Kuwait() },
  { id: 'moonsighting', label: 'Moonsighting Committee', short: 'Moonsighting', where: 'North America, the UK', make: () => CalculationMethod.MoonsightingCommittee() },
  { id: 'northAmerica', label: 'ISNA', short: 'ISNA', where: 'North America', make: () => CalculationMethod.NorthAmerica() },
  { id: 'singapore', label: 'Singapore', short: 'Singapore', where: 'Singapore, Malaysia, Indonesia', make: () => CalculationMethod.Singapore() },
  { id: 'turkey', label: 'Diyanet, Turkey', short: 'Turkey', where: 'Turkey', make: () => CalculationMethod.Turkey() },
  { id: 'tehran', label: 'Institute of Geophysics, Tehran', short: 'Tehran', where: 'Iran', make: () => CalculationMethod.Tehran() },
];

export function methodOf(id: MethodId) {
  return METHODS.find((m) => m.id === id) ?? METHODS[0];
}

export function paramsFor(pm: PrayerMethod): CalculationParameters {
  const params = methodOf(pm.method).make();
  params.madhab = pm.asr === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  return params;
}

export const ASR_LABEL: Record<AsrRule, string> = { shafi: 'Standard Asr', hanafi: 'Hanafi Asr' };
