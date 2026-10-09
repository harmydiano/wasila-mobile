import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { AppState as RNAppState } from 'react-native';
import * as Location from 'expo-location';
import { Coordinates, PrayerTimes as AdhanPrayerTimes, Qibla } from 'adhan';
import { ASR_LABEL, methodOf, paramsFor, type PrayerMethod } from '../data/prayerMethods';
import { formatClock, formatCountdown, formatTimeUntil, formatQibla, timezoneMismatchHours } from '../utils/prayerTime';
import { useAppState } from './AppState';
import { scheduleAllPrayerNotifications, cancelAllPrayerNotifications, SCHEDULING_WINDOW_DAYS, type ScheduledPrayer } from '../data/notifications';

const FALLBACK = { latitude: 6.5244, longitude: 3.3792, city: 'Lagos', country: 'Nigeria', isoCountryCode: 'NG' };

export type PrayerRow = {
  key: 'Fajr' | 'Sunrise' | 'Zuhr' | 'Asr' | 'Maghrib' | 'Isha';
  name: string;
  icon: string;
  time: Date;
  label: string;
  next: boolean;
  current: boolean;
  past: boolean;
  note?: string;
};

type PrayerCtxValue = {
  loading: boolean;
  usingFallback: boolean;
  permissionDenied: boolean;
  city: string;
  placeLabel: string;
  country: string;
  isoCountryCode: string;
  locationShort: string;
  locationLong: string;
  calculationMethod: string;
  asrLabel: string;
  qiblaDeg: number | null;
  qiblaLabel: string | null;
  timezoneMismatch: number;
  rows: PrayerRow[];
  currentName: string | null;
  currentLabel: string | null;
  timeToNext: string | null;
  currentProgress: number | null;
  nextName: string | null;
  nextLabel: string | null;
  nextCountdown: string | null;
  refresh: (ask?: boolean) => void;
};

const Ctx = createContext<PrayerCtxValue | null>(null);

const ROW_META: { key: PrayerRow['key']; name: string; icon: string }[] = [
  { key: 'Fajr', name: 'Fajr', icon: 'wb-twilight' },
  { key: 'Sunrise', name: 'Sunrise', icon: 'light-mode' },
  { key: 'Zuhr', name: 'Zuhr', icon: 'mosque' },
  { key: 'Asr', name: 'Asr', icon: 'mosque' },
  { key: 'Maghrib', name: 'Maghrib', icon: 'nights-stay' },
  { key: 'Isha', name: 'Isha', icon: 'bedtime' },
];

const PRAYER_KEY_MAP: Record<string, PrayerRow['key']> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Zuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

function timesFor(coords: Coordinates, date: Date, pm: PrayerMethod) {
  return new AdhanPrayerTimes(coords, date, paramsFor(pm));
}

const ADHAN_PRAYERS: { key: Exclude<PrayerRow['key'], 'Sunrise'>; field: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' }[] = [
  { key: 'Fajr', field: 'fajr' },
  { key: 'Zuhr', field: 'dhuhr' },
  { key: 'Asr', field: 'asr' },
  { key: 'Maghrib', field: 'maghrib' },
  { key: 'Isha', field: 'isha' },
];

function upcomingPrayers(
  coords: Coordinates,
  from: Date,
  days: number,
  enabled: Record<string, boolean>,
  pm: PrayerMethod
): ScheduledPrayer[] {
  const out: ScheduledPrayer[] = [];
  for (let d = 0; d < days; d++) {
    const day = new Date(from.getTime() + d * 24 * 60 * 60 * 1000);
    const t = timesFor(coords, day, pm);
    for (const p of ADHAN_PRAYERS) {
      if (enabled[p.key] === false) continue;
      const date = t[p.field] as Date;
      if (date instanceof Date && !Number.isNaN(date.getTime())) out.push({ name: p.key, date });
    }
  }
  return out;
}

export function PrayerProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({ latitude: FALLBACK.latitude, longitude: FALLBACK.longitude });
  const [place, setPlace] = useState<{ city: string; country: string; isoCountryCode: string }>({
    city: FALLBACK.city,
    country: FALLBACK.country,
    isoCountryCode: FALLBACK.isoCountryCode,
  });
  const { prayerMethod } = useAppState();
  const [usingFallback, setUsingFallback] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(() => new Date());
  const mounted = useRef(true);

  const locate = useCallback(async (ask: boolean = false) => {
    setLoading(true);
    try {
      const { status } = ask
        ? await Location.requestForegroundPermissionsAsync()
        : await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!mounted.current) return;
        setPermissionDenied(status === 'denied');
        setCoords({ latitude: FALLBACK.latitude, longitude: FALLBACK.longitude });
        setPlace({ city: FALLBACK.city, country: FALLBACK.country, isoCountryCode: FALLBACK.isoCountryCode });
        setUsingFallback(true);
        return;
      }
      setPermissionDenied(false);
      const pos =
        (await Location.getLastKnownPositionAsync({ maxAge: 60 * 60 * 1000 })) ??
        (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }));
      if (!mounted.current) return;
      setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      setUsingFallback(false);
      setPlace((p) => (p.city === FALLBACK.city && p.country === FALLBACK.country ? { city: 'Current location', country: '', isoCountryCode: '' } : p));

      try {
        const [addr] = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        if (!mounted.current) return;
        if (addr) {
          setPlace({
            city: addr.city || addr.subregion || addr.region || 'Current location',
            country: addr.country || '',
            isoCountryCode: addr.isoCountryCode || '',
          });
        }
      } catch {
      }
    } catch {
      if (!mounted.current) return;
      setPermissionDenied(true);
      setCoords({ latitude: FALLBACK.latitude, longitude: FALLBACK.longitude });
      setPlace({ city: FALLBACK.city, country: FALLBACK.country, isoCountryCode: FALLBACK.isoCountryCode });
      setUsingFallback(true);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    locate();
    const sub = RNAppState.addEventListener('change', (st) => {
      if (st === 'active') locate();
    });
    return () => {
      mounted.current = false;
      sub.remove();
    };
  }, [locate]);

  useEffect(() => {
    const id = setInterval(() => setTick(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const computed = useMemo(() => {
    const c = new Coordinates(coords.latitude, coords.longitude);
    const today = timesFor(c, tick, prayerMethod);
    const nextKey = today.nextPrayer(tick);

    const currentKey = today.currentPrayer(tick);

    let nextTime: Date;
    let nextRowKey: PrayerRow['key'];
    if (nextKey === 'none') {
      const tomorrow = timesFor(c, new Date(tick.getTime() + 24 * 60 * 60 * 1000), prayerMethod);
      nextTime = tomorrow.fajr;
      nextRowKey = 'Fajr';
    } else {
      nextRowKey = PRAYER_KEY_MAP[nextKey];
      nextTime = today.timeForPrayer(nextKey as any) as Date;
    }

    const currentRowKey: PrayerRow['key'] | null =
      currentKey === 'none' || currentKey === 'sunrise' ? null : PRAYER_KEY_MAP[currentKey];

    const timeByKey: Record<PrayerRow['key'], Date> = {
      Fajr: today.fajr,
      Sunrise: today.sunrise,
      Zuhr: today.dhuhr,
      Asr: today.asr,
      Maghrib: today.maghrib,
      Isha: today.isha,
    };

    const rows: PrayerRow[] = ROW_META.map((m) => {
      const isNext = m.key === nextRowKey;
      const isCurrent = m.key === currentRowKey;
      return {
        key: m.key,
        name: m.name,
        icon: m.icon,
        time: timeByKey[m.key],
        label: formatClock(timeByKey[m.key]),
        next: isNext,
        current: isCurrent,
        past: !isCurrent && timeByKey[m.key].getTime() <= tick.getTime(),
        note: isCurrent ? 'Now' : isNext ? formatCountdown(tick.getTime(), nextTime.getTime()) : undefined,
      };
    });

    const currentStart = currentRowKey ? timeByKey[currentRowKey].getTime() : null;
    const currentProgressValue =
      currentStart != null && nextTime.getTime() > currentStart
        ? Math.min(1, Math.max(0, (tick.getTime() - currentStart) / (nextTime.getTime() - currentStart)))
        : null;

    const qiblaDeg = Qibla(c);

    return {
      rows,
      currentName: rows.find((r) => r.current)?.name ?? null,
      currentLabel: rows.find((r) => r.current)?.label ?? null,
      timeToNext: formatTimeUntil(tick.getTime(), nextTime.getTime()),
      currentProgress: currentProgressValue,
      nextName: rows.find((r) => r.next)?.name ?? null,
      nextLabel: rows.find((r) => r.next)?.label ?? formatClock(nextTime),
      nextCountdown: formatCountdown(tick.getTime(), nextTime.getTime()),
      qiblaDeg,
      qiblaLabel: formatQibla(qiblaDeg),
      timezoneMismatch: timezoneMismatchHours(coords.longitude, tick),
    };
  }, [coords, tick, prayerMethod]);

  const { adhanEnabled, adhanPrayers, hydrated } = useAppState();
  const lastScheduleKey = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;

    if (!adhanEnabled) {
      cancelAllPrayerNotifications().catch(() => {});
      lastScheduleKey.current = null;
      return;
    }

    const selection = ADHAN_PRAYERS.map((p) => (adhanPrayers[p.key] === false ? '0' : '1')).join('');
    const key = `${coords.latitude.toFixed(2)},${coords.longitude.toFixed(2)},${new Date().toDateString()},${selection},${prayerMethod.method}:${prayerMethod.asr}`;
    if (lastScheduleKey.current === key) return;
    lastScheduleKey.current = key;

    const c = new Coordinates(coords.latitude, coords.longitude);
    const releaseKey = () => {
      if (lastScheduleKey.current === key) lastScheduleKey.current = null;
    };
    scheduleAllPrayerNotifications(upcomingPrayers(c, new Date(), SCHEDULING_WINDOW_DAYS, adhanPrayers, prayerMethod))
      .then((outcome) => {
        if (outcome.status === 'permission-denied') {
          releaseKey();
        }
      })
      .catch(() => {
        releaseKey();
      });
  }, [adhanEnabled, adhanPrayers, hydrated, coords, tick, prayerMethod]);

  const value = useMemo<PrayerCtxValue>(
    () => ({
      loading,
      usingFallback,
      permissionDenied,
      city: place.city,
      placeLabel: usingFallback ? (loading ? '' : `${place.city} (default)`) : place.city,
      country: place.country,
      isoCountryCode: place.isoCountryCode,
      locationShort: place.isoCountryCode ? `${place.city}, ${place.isoCountryCode}` : place.city,
      locationLong: place.country ? `${place.city}, ${place.country}` : place.city,
      calculationMethod: methodOf(prayerMethod.method).label,
      asrLabel: ASR_LABEL[prayerMethod.asr],
      qiblaDeg: computed.qiblaDeg,
      qiblaLabel: computed.qiblaLabel,
      timezoneMismatch: computed.timezoneMismatch,
      rows: computed.rows,
      currentName: computed.currentName,
      currentLabel: computed.currentLabel,
      timeToNext: computed.timeToNext,
      currentProgress: computed.currentProgress,
      nextName: computed.nextName,
      nextLabel: computed.nextLabel,
      nextCountdown: computed.nextCountdown,
      refresh: locate,
    }),
    [loading, usingFallback, permissionDenied, place, computed, locate, prayerMethod]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrayer() {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePrayer must be used within PrayerProvider');
  return v;
}
