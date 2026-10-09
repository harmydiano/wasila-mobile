export function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function angleDelta(from: number, to: number): number {
  let d = normalizeDeg(to) - normalizeDeg(from);
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

export function smoothHeading(previous: number | null, next: number, alpha = 0.18): number {
  if (previous == null || Number.isNaN(previous)) return normalizeDeg(next);
  return normalizeDeg(previous + angleDelta(previous, next) * alpha);
}

export function needleRotation(qiblaDeg: number, heading: number): number {
  return normalizeDeg(qiblaDeg - heading);
}

export const ALIGNED_THRESHOLD_DEG = 5;

export function isAligned(qiblaDeg: number, heading: number, threshold = ALIGNED_THRESHOLD_DEG): boolean {
  return Math.abs(angleDelta(heading, qiblaDeg)) <= threshold;
}

export function accuracyLabel(accuracy: number): string | null {
  if (accuracy >= 3) return null;
  if (accuracy === 2) return 'Compass accuracy is moderate.';
  return 'Compass needs calibrating — move the phone in a figure of eight.';
}

export function accuracyPill(
  compassAvailable: boolean,
  hasHeading: boolean,
  accuracy: number
): { label: string; warn: boolean } {
  if (!compassAvailable) return { label: 'No compass on this device', warn: false };
  if (!hasHeading) return { label: 'Finding north…', warn: false };
  if (accuracy >= 3) return { label: 'High accuracy', warn: false };
  if (accuracy === 2) return { label: 'Moderate accuracy', warn: false };
  return { label: 'Needs calibration', warn: true };
}
