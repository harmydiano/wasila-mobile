import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { smoothHeading } from '../utils/compass';

export type HeadingState = {
  heading: number | null;
  accuracy: number;
  available: boolean;
};

export function useHeading(enabled = true): HeadingState {
  const [heading, setHeading] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState(0);
  const [available, setAvailable] = useState(true);
  const smoothed = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let sub: Location.LocationSubscription | null = null;
    let alive = true;

    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          const req = await Location.requestForegroundPermissionsAsync();
          if (req.status !== 'granted' && alive) {
            setAvailable(false);
            return;
          }
        }

        sub = await Location.watchHeadingAsync((h) => {
          if (!alive) return;
          const raw = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
          if (raw == null || Number.isNaN(raw) || raw < 0) return;
          smoothed.current = smoothHeading(smoothed.current, raw);
          setHeading(smoothed.current);
          setAccuracy(h.accuracy ?? 0);
        });
      } catch {
        if (alive) setAvailable(false);
      }
    })();

    return () => {
      alive = false;
      sub?.remove();
    };
  }, [enabled]);

  return { heading, accuracy, available };
}
