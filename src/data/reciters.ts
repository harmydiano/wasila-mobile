export type Reciter = { id: string; name: string; bitrate: number };

export const RECITERS: Reciter[] = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', bitrate: 128 },
  { id: 'ar.abdulsamad', name: 'Abdul Basit "Abdul Samad"', bitrate: 64 },
  { id: 'ar.abdurrahmaansudais', name: 'Abdur-Rahman As-Sudais', bitrate: 64 },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', bitrate: 128 },
  { id: 'ar.saoodshuraym', name: 'Saood Ash-Shuraym', bitrate: 64 },
  { id: 'ar.ahmedajamy', name: 'Ahmed Al-Ajamy', bitrate: 128 },
  { id: 'ar.shaatree', name: 'Abu Bakr Ash-Shaatree', bitrate: 128 },
  { id: 'ar.hudhaify', name: 'Ali Al-Hudhaify', bitrate: 128 },
  { id: 'ar.muhammadayyoub', name: 'Muhammad Ayyoub', bitrate: 128 },
  { id: 'ar.mahermuaiqly', name: 'Maher Al Muaiqly', bitrate: 128 },
];

export const DEFAULT_RECITER = 'ar.alafasy';

export function getReciterName(id: string): string {
  return RECITERS.find((r) => r.id === id)?.name ?? RECITERS[0].name;
}

export function getReciterBitrate(id: string): number {
  return RECITERS.find((r) => r.id === id)?.bitrate ?? 128;
}
