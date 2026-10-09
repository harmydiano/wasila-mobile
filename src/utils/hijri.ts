const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

export type HijriDate = { day: number; month: number; monthName: string; year: number };

export function gregorianToHijri(date: Date): HijriDate {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const jd =
    Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4) +
    Math.floor((367 * (month - 2 - 12 * Math.floor((month - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100)) / 4) +
    day -
    32075;

  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hMonth = Math.floor((24 * l) / 709);
  const hDay = l - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;

  return { day: hDay, month: hMonth, monthName: HIJRI_MONTHS[hMonth - 1], year: hYear };
}

export function formatHijri(date: Date): string {
  const h = gregorianToHijri(date);
  return `${h.day} ${h.monthName} ${h.year}`;
}

export function formatHijriDayMonth(date: Date): string {
  const h = gregorianToHijri(date);
  return `${h.day} ${h.monthName}`;
}

export function formatHijriMonthYear(date: Date): string {
  const h = gregorianToHijri(date);
  return `${h.monthName} ${h.year}`;
}

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatGregorian(date: Date): string {
  return `${WEEKDAY_NAMES[date.getDay()]}, ${date.getDate()} ${MONTH_ABBR[date.getMonth()]} ${date.getFullYear()}`;
}

const HIJRI_EPOCH = Date.UTC(622, 6, 16);
const MEAN_YEAR = 354.367;
const MEAN_MONTH = 29.5305;
const DAY_MS = 86400000;

export function hijriToGregorian(year: number, month: number, day: number): Date {
  const estimate = HIJRI_EPOCH + ((year - 1) * MEAN_YEAR + (month - 1) * MEAN_MONTH + (day - 1)) * DAY_MS;
  const from = new Date(estimate);
  const probe = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 12);
  for (let offset = 0; offset <= 20; offset++) {
    for (const step of offset === 0 ? [0] : [-offset, offset]) {
      const d = new Date(probe.getFullYear(), probe.getMonth(), probe.getDate() + step, 12);
      const h = gregorianToHijri(d);
      if (h.year === year && h.month === month && h.day === day) return d;
    }
  }
  return probe;
}

export function hijriMonthLength(year: number, month: number): number {
  const start = hijriToGregorian(year, month, 1);
  const next = month === 12 ? hijriToGregorian(year + 1, 1, 1) : hijriToGregorian(year, month + 1, 1);
  return Math.round((next.getTime() - start.getTime()) / DAY_MS);
}

export function addHijriMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const zero = year * 12 + (month - 1) + delta;
  return { year: Math.floor(zero / 12), month: (zero % 12) + 1 };
}

export function hijriMonthName(month: number): string {
  return HIJRI_MONTHS[month - 1];
}
