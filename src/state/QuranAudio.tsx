import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import {
  clearPreloadedSource,
  createAudioPlayer,
  preload,
  requestNotificationPermissionsAsync,
  type AudioPlayer,
} from 'expo-audio';
import { getSuraMeta, getSuraNames } from '../data/db';
import {
  NO_HEADER_BISMILLAH,
  getGlobalAyahNumber,
  resolveAyahAudioUri,
  resolveBismillahAudioUri,
} from '../data/audio';
import {
  bismillahUri,
  ensureBismillahDownloaded,
  ensureSurahDownloaded,
  getSurahAudio,
  hasContinuousAudio,
  timingFor,
  verseAt,
  type SurahAudio,
} from '../data/surahAudio';
import { getReciterName } from '../data/reciters';
import { ensureSuraDownloaded, holdDownloads } from '../data/audioDownloads';
import { useAppState } from './AppState';
import { KEYS, getJSON, setJSON } from '../data/prefs';

export type NowPlaying = {
  suraId: number;
  suraName: string;
  reciter: string;
  trackCount: number;
  hasBismillah: boolean;
  index: number;
  verseId: number | null;
  continuous: boolean;
};

export type RepeatMode = 'off' | 'ayah' | 'range' | 'sura';

export type Repeat = {
  mode: RepeatMode;
  times: number;
  from: number;
  to: number;
};

export const REPEAT_OFF: Repeat = { mode: 'off', times: 3, from: 1, to: 5 };

export const SPEEDS = [0.75, 1, 1.25, 1.5] as const;

type QuranAudioValue = {
  now: NowPlaying | null;
  playing: boolean;
  trackIndexFor: (suraId: number, verseId: number) => number;
  playSura: (suraId: number, trackIndex?: number) => void;
  playVerse: (suraId: number, verseId: number) => void;
  playRange: (suraId: number, from: number, to: number, times?: number) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  stop: () => void;

  repeat: Repeat;
  setRepeat: (r: Partial<Repeat>) => void;
  speed: number;
  setSpeed: (n: number) => void;
  autoContinue: boolean;
  setAutoContinue: (v: boolean) => void;
  sleepMinutes: number;
  setSleepMinutes: (n: number) => void;
  sleepAt: number | null;
};

type Position = { position: number; duration: number };
let positionState: Position = { position: 0, duration: 0 };
const positionListeners = new Set<() => void>();

function publishPosition(p: Position) {
  const rounded = { position: Math.round(p.position * 10) / 10, duration: Math.round(p.duration * 10) / 10 };
  if (rounded.position === positionState.position && rounded.duration === positionState.duration) return;
  positionState = rounded;
  for (const l of positionListeners) l();
}

export function useAudioPosition(): Position {
  return useSyncExternalStore(
    (fn) => {
      positionListeners.add(fn);
      return () => positionListeners.delete(fn);
    },
    () => positionState,
    () => positionState
  );
}

const Ctx = createContext<QuranAudioValue | null>(null);

function verseIdForIndex(hasBismillah: boolean, index: number): number | null {
  if (!hasBismillah) return index + 1;
  return index === 0 ? null : index;
}

function trackLabel(q: NowPlaying, verseId: number | null): string {
  return verseId == null ? `${q.suraName}, Bismillah` : `${q.suraName}, Aya ${verseId}`;
}

export function QuranAudioProvider({ children }: { children: React.ReactNode }) {
  const { reciter } = useAppState();

  const playerRef = useRef<AudioPlayer | null>(null);
  const getPlayer = useCallback(() => {
    if (!playerRef.current) {
      playerRef.current = createAudioPlayer(null, { updateInterval: 250 });
    }
    return playerRef.current;
  }, []);

  const [now, setNowState] = useState<NowPlaying | null>(null);
  const [playing, setPlaying] = useState(false);

  const [repeat, setRepeatState] = useState<Repeat>(REPEAT_OFF);
  const [speed, setSpeedState] = useState(1);
  const [autoContinue, setAutoContinueState] = useState(true);
  const [sleepMinutes, setSleepMinutesState] = useState(0);
  const [sleepAt, setSleepAt] = useState<number | null>(null);
  const repeatRef = useRef(repeat);
  repeatRef.current = repeat;
  const autoContinueRef = useRef(autoContinue);
  autoContinueRef.current = autoContinue;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const playCount = useRef(0);

  const intent = useRef(false);

  const nowRef = useRef<NowPlaying | null>(null);
  const setNow = useCallback((q: NowPlaying | null) => {
    nowRef.current = q;
    setNowState(q);
  }, []);

  const lockScreenClaimed = useRef(false);

  const timingsRef = useRef<SurahAudio | null>(null);
  type PendingSura = { token: number; audio: SurahAudio; queue: NowPlaying; startAt: number };
  const pendingSura = useRef<PendingSura | null>(null);
  const openContinuousRef = useRef<((p: PendingSura) => void) | null>(null);
  const loopGuardUntil = useRef(0);

  const consecutiveErrors = useRef(0);

  const WARM_AHEAD = 3;
  const warmed = useRef(new Map<string, Promise<void>>());
  const ready = useRef(new Set<string>());

  const warmOne = useCallback((uri: string): Promise<void> => {
    const existing = warmed.current.get(uri);
    if (existing) return existing;
    const release = holdDownloads();
    const timer = setTimeout(release, 15_000);
    const done = () => {
      clearTimeout(timer);
      release();
    };
    const p = preload({ uri }, { preferredForwardBufferDuration: 10 }).then(
      () => {
        done();
        ready.current.add(uri);
      },
      () => {
        done();
        warmed.current.delete(uri);
      }
    );
    warmed.current.set(uri, p);
    return p;
  }, []);

  const warmAhead = useCallback(
    (uris: string[]) => {
      const wanted = uris.filter((u) => u.startsWith('http'));
      const keep = new Set(wanted);
      for (const uri of Array.from(warmed.current.keys())) {
        if (keep.has(uri)) continue;
        warmed.current.delete(uri);
        ready.current.delete(uri);
        clearPreloadedSource({ uri }).catch(() => {});
      }
      for (const uri of wanted) warmOne(uri);
    },
    [warmOne]
  );

  const isReady = useCallback((uri: string) => !uri.startsWith('http') || ready.current.has(uri), []);

  const COLD_WAIT_MS = 6000;
  const ensureWarm = useCallback(
    (uri: string): Promise<void> =>
      Promise.race([
        warmOne(uri).catch(() => {}),
        new Promise<void>((resolve) => setTimeout(resolve, COLD_WAIT_MS)),
      ]),
    [warmOne]
  );

  const upcomingUris = useCallback((q: NowPlaying, fromIndex: number, count: number): string[] => {
    const suras = getSuraNames();
    const out: string[] = [];
    let suraId = q.suraId;
    let hasBismillah = q.hasBismillah;
    let trackCount = q.trackCount;
    let i = fromIndex;
    while (out.length < count) {
      if (i >= trackCount) {
        if (!autoContinueRef.current || suraId >= suras.length) break;
        const meta = getSuraMeta(suraId + 1);
        if (!meta) break;
        suraId += 1;
        hasBismillah = !NO_HEADER_BISMILLAH.has(suraId);
        trackCount = meta.verseCount + (hasBismillah ? 1 : 0);
        i = 0;
        continue;
      }
      const verseId = verseIdForIndex(hasBismillah, i);
      out.push(
        verseId == null
          ? resolveBismillahAudioUri(suraId, q.reciter)
          : resolveAyahAudioUri(suraId, verseId, getGlobalAyahNumber(suraId, verseId, suras), q.reciter)
      );
      i += 1;
    }
    return out;
  }, []);

  const loadToken = useRef(0);

  const loadTrack = useCallback(
    (index: number, autoplay: boolean) => {
      const q = nowRef.current;
      if (!q) return;
      if (index < 0 || index >= q.trackCount) return;

      const token = ++loadToken.current;

      const player = getPlayer();
      const suras = getSuraNames();
      const verseId = verseIdForIndex(q.hasBismillah, index);
      const uri =
        verseId == null
          ? resolveBismillahAudioUri(q.suraId, q.reciter)
          : resolveAyahAudioUri(q.suraId, verseId, getGlobalAyahNumber(q.suraId, verseId, suras), q.reciter);

      if (autoplay) intent.current = true;

      const commit = () => {
        if (loadToken.current !== token) return;
        player.replace({ uri });
        try {
          player.setPlaybackRate(speedRef.current, 'high');
        } catch {}
        if (intent.current) player.play();
      };

      const nextQueue = { ...q, index, verseId };

      const warm = isReady(uri);
      if (warm) commit();

      setNow(nextQueue);

      const metadata = {
        title: trackLabel(nextQueue, verseId),
        artist: getReciterName(q.reciter),
        albumTitle: 'Wasīla',
      };
      try {
        if (!lockScreenClaimed.current) {
          player.setActiveForLockScreen(true, metadata, { showSeekForward: false, showSeekBackward: false });
          lockScreenClaimed.current = true;
        } else {
          player.updateLockScreenMetadata(metadata);
        }
      } catch {}

      warmAhead([uri, ...upcomingUris(nextQueue, index + 1, WARM_AHEAD)]);

      if (!warm) ensureWarm(uri).then(commit, commit);
    },
    [getPlayer, setNow, warmAhead, upcomingUris, isReady, ensureWarm]
  );

  const stop = useCallback(() => {
    const player = playerRef.current;
    if (player) {
      try {
        player.pause();
        player.clearLockScreenControls();
      } catch {}
    }
    lockScreenClaimed.current = false;
    intent.current = false;
    playCount.current = 0;
    loadToken.current += 1;
    timingsRef.current = null;
    pendingSura.current = null;
    loopGuardUntil.current = 0;
    warmAhead([]);
    setNow(null);
    setPlaying(false);
  }, [setNow, warmAhead]);

  const playSuraRef = useRef<((suraId: number, trackIndex?: number) => void) | null>(null);

  const advance = useCallback(() => {
    const q = nowRef.current;
    if (!q) return;
    const r = repeatRef.current;

    if (q.continuous) {
      playCount.current = 0;
      if (r.mode === 'sura') {
        getPlayer()
          .seekTo(0)
          .catch(() => {});
        intent.current = true;
        getPlayer().play();
        return;
      }
      if (autoContinueRef.current && q.suraId < getSuraNames().length) {
        playSuraRef.current?.(q.suraId + 1);
        return;
      }
      stop();
      return;
    }

    if (r.mode === 'ayah' && q.verseId != null) {
      playCount.current += 1;
      if (playCount.current < Math.max(1, r.times)) {
        loadTrack(q.index, true);
        return;
      }
      playCount.current = 0;
    }

    if (r.mode === 'range' && q.verseId != null && q.verseId >= r.to) {
      playCount.current += 1;
      if (playCount.current < Math.max(1, r.times)) {
        loadTrack(NO_HEADER_BISMILLAH.has(q.suraId) ? r.from - 1 : r.from, true);
        return;
      }
      playCount.current = 0;
    }

    if (q.index + 1 >= q.trackCount) {
      if (r.mode === 'sura') {
        playCount.current = 0;
        loadTrack(0, true);
        return;
      }
      if (autoContinueRef.current && q.suraId < getSuraNames().length) {
        playCount.current = 0;
        playSuraRef.current?.(q.suraId + 1);
        return;
      }
      stop();
      return;
    }
    loadTrack(q.index + 1, true);
  }, [loadTrack, stop, getPlayer]);

  useEffect(() => {
    const player = getPlayer();
    const sub = player.addListener('playbackStatusUpdate', (status) => {
      setPlaying(status.playing || intent.current);
      publishPosition({ position: status.currentTime ?? 0, duration: status.duration ?? 0 });
      if (status.playing) consecutiveErrors.current = 0;

      const waiting = pendingSura.current;
      if (waiting && (status.didJustFinish || (status as { error?: string }).error)) {
        pendingSura.current = null;
        consecutiveErrors.current = 0;
        openContinuousRef.current?.(waiting);
        return;
      }

      if ((status as { error?: string }).error) {
        consecutiveErrors.current += 1;
        if (consecutiveErrors.current >= 3) {
          consecutiveErrors.current = 0;
          stop();
        } else {
          advance();
        }
        return;
      }

      const q = nowRef.current;
      const audio = timingsRef.current;
      if (q?.continuous && audio) {
        const ms = (status.currentTime ?? 0) * 1000;
        const r = repeatRef.current;

        if (Date.now() >= loopGuardUntil.current) {
          const loop =
            r.mode === 'ayah' && q.verseId != null
              ? timingFor(audio.timings, q.verseId)
              : r.mode === 'range'
                ? (() => {
                    const lo = timingFor(audio.timings, r.from);
                    const hi = timingFor(audio.timings, r.to);
                    return lo && hi ? { fromMs: lo.fromMs, toMs: hi.toMs, verseId: r.from } : null;
                  })()
                : null;

          if (loop && ms >= loop.toMs) {
            playCount.current += 1;
            if (playCount.current < Math.max(1, r.times)) {
              loopGuardUntil.current = Date.now() + 500;
              getPlayer()
                .seekTo(loop.fromMs / 1000)
                .catch(() => {});
              return;
            }
            playCount.current = 0;
          }
        }

        const v = verseAt(audio.timings, ms);
        if (v !== q.verseId) {
          if (r.mode === 'ayah') playCount.current = 0;
          const nextNow = { ...q, verseId: v, index: v - 1 };
          setNow(nextNow);
          try {
            getPlayer().updateLockScreenMetadata({
              title: trackLabel(nextNow, v),
              artist: getReciterName(q.reciter),
              albumTitle: 'Wasīla',
            });
          } catch {}
        }
        if (status.didJustFinish) advance();
        return;
      }

      if (status.didJustFinish) advance();
    });
    return () => sub.remove();
  }, [getPlayer, advance, stop, setNow]);

  const applyLockScreen = useCallback(
    (q: NowPlaying, verseId: number | null) => {
      const player = getPlayer();
      const metadata = {
        title: trackLabel(q, verseId),
        artist: getReciterName(q.reciter),
        albumTitle: 'Wasīla',
      };
      try {
        if (!lockScreenClaimed.current) {
          player.setActiveForLockScreen(true, metadata, { showSeekForward: false, showSeekBackward: false });
          lockScreenClaimed.current = true;
        } else {
          player.updateLockScreenMetadata(metadata);
        }
      } catch {}
    },
    [getPlayer]
  );

  const openContinuous = useCallback(
    (p: PendingSura) => {
      if (loadToken.current !== p.token) return;
      timingsRef.current = p.audio;
      loopGuardUntil.current = 0;
      const player = getPlayer();
      player.replace({ uri: p.audio.url });
      try {
        player.setPlaybackRate(speedRef.current, 'high');
      } catch {}
      const t = timingFor(p.audio.timings, p.startAt);
      if (t && t.fromMs > 0) {
        player.seekTo(t.fromMs / 1000).catch(() => {});
      }
      if (intent.current) player.play();
      const q = { ...p.queue, verseId: p.startAt, index: p.startAt - 1 };
      setNow(q);
      applyLockScreen(q, p.startAt);
      ensureSurahDownloaded(q.reciter, q.suraId);
    },
    [getPlayer, setNow, applyLockScreen]
  );
  openContinuousRef.current = openContinuous;

  const startContinuous = useCallback(
    (
      suraId: number,
      meta: { transliterate: string; verseCount: number },
      fromVerse: number,
      autoplay: boolean,
      onFallback: () => void
    ) => {
      const token = ++loadToken.current;
      const startAt = Math.max(1, Math.min(fromVerse, meta.verseCount));
      const withBismillah = startAt === 1 && !NO_HEADER_BISMILLAH.has(suraId);
      const queue: NowPlaying = {
        suraId,
        suraName: meta.transliterate,
        reciter,
        trackCount: meta.verseCount,
        hasBismillah: withBismillah,
        index: startAt - 1,
        verseId: startAt,
        continuous: true,
      };
      timingsRef.current = null;
      pendingSura.current = null;
      loopGuardUntil.current = 0;
      playCount.current = 0;
      if (autoplay) intent.current = true;
      setNow(queue);

      getSurahAudio(reciter, suraId).then((audio) => {
        if (loadToken.current !== token) return;
        if (!audio) {
          onFallback();
          return;
        }
        if (!withBismillah) {
          openContinuous({ token, audio, queue, startAt });
          return;
        }

        pendingSura.current = { token, audio, queue, startAt };
        const opening = { ...queue, verseId: null, index: 0 };
        setNow(opening);
        const player = getPlayer();
        player.replace({ uri: bismillahUri(reciter) });
        try {
          player.setPlaybackRate(speedRef.current, 'high');
        } catch {}
        if (intent.current) player.play();
        applyLockScreen(opening, null);
        ensureBismillahDownloaded(reciter);
        ensureSurahDownloaded(reciter, suraId);
      });
    },
    [reciter, setNow, getPlayer, applyLockScreen, openContinuous]
  );

  const startClips = useCallback(
    (suraId: number, meta: { transliterate: string; verseCount: number }, fromVerse: number, autoplay: boolean) => {
      const hasBismillah = !NO_HEADER_BISMILLAH.has(suraId);
      const trackIndex = hasBismillah ? Math.max(0, fromVerse) : Math.max(0, fromVerse - 1);
      const queue: NowPlaying = {
        suraId,
        suraName: meta.transliterate,
        reciter,
        trackCount: meta.verseCount + (hasBismillah ? 1 : 0),
        hasBismillah,
        index: trackIndex,
        verseId: verseIdForIndex(hasBismillah, trackIndex),
        continuous: false,
      };
      timingsRef.current = null;
      setNow(queue);
      ensureSuraDownloaded(reciter, suraId, Math.max(1, fromVerse));
      warmAhead(upcomingUris(queue, trackIndex + 1, WARM_AHEAD));
      loadTrack(trackIndex, autoplay);
    },
    [reciter, setNow, loadTrack, warmAhead, upcomingUris]
  );

  const startSura = useCallback(
    (suraId: number, fromVerse: number, autoplay = true) => {
      const meta = getSuraMeta(suraId);
      if (!meta) return;

      if (Platform.OS === 'android') requestNotificationPermissionsAsync().catch(() => {});

      if (hasContinuousAudio(reciter)) {
        startContinuous(suraId, meta, fromVerse, autoplay, () => startClips(suraId, meta, fromVerse, autoplay));
        return;
      }
      startClips(suraId, meta, fromVerse, autoplay);
    },
    [reciter, startContinuous, startClips]
  );

  const trackIndexFor = useCallback((suraId: number, verseId: number) => {
    return NO_HEADER_BISMILLAH.has(suraId) ? verseId - 1 : verseId;
  }, []);

  const playSura = useCallback(
    (suraId: number, fromVerse?: number) => {
      const q = nowRef.current;
      if (q && q.suraId === suraId && q.reciter === reciter) {
        const player = getPlayer();
        intent.current = true;

        if (q.continuous) {
          const audio = timingsRef.current;
          const t = fromVerse != null && audio ? timingFor(audio.timings, fromVerse) : null;
          if (t) {
            loopGuardUntil.current = Date.now() + 500;
            player.seekTo(t.fromMs / 1000).catch(() => {});
          }
          player.play();
          setPlaying(true);
          return;
        }

        ensureSuraDownloaded(reciter, suraId, Math.max(1, fromVerse ?? 1));
        const trackIndex = fromVerse == null ? q.index : trackIndexFor(suraId, fromVerse);
        if (q.index === trackIndex) {
          player.play();
          setPlaying(true);
          return;
        }
        loadTrack(trackIndex, true);
        return;
      }
      startSura(suraId, fromVerse ?? 1);
    },
    [reciter, getPlayer, loadTrack, startSura, trackIndexFor]
  );

  const playVerse = useCallback(
    (suraId: number, verseId: number) => {
      playCount.current = 0;
      playSura(suraId, verseId);
    },
    [playSura]
  );

  playSuraRef.current = playSura;

  const playRange = useCallback(
    (suraId: number, from: number, to: number, times = 3) => {
      const lo = Math.max(1, Math.min(from, to));
      const hi = Math.max(from, to);
      playCount.current = 0;
      setRepeatState((r) => ({ ...r, mode: 'range', from: lo, to: hi, times }));
      playSura(suraId, lo);
    },
    [playSura]
  );

  const toggle = useCallback(() => {
    const q = nowRef.current;
    if (!q) return;
    const player = getPlayer();
    if (intent.current) {
      intent.current = false;
      player.pause();
      setPlaying(false);
    } else {
      intent.current = true;
      player.play();
      setPlaying(true);
    }
  }, [getPlayer]);

  const next = useCallback(() => {
    const q = nowRef.current;
    if (!q || q.suraId >= getSuraNames().length) return;
    playSura(q.suraId + 1);
  }, [playSura]);

  const previous = useCallback(() => {
    const q = nowRef.current;
    if (!q) return;
    const player = getPlayer();
    if (q.continuous) {
      if (player.currentTime <= 3) {
        if (q.suraId > 1) playSura(q.suraId - 1, 1);
        return;
      }
      loopGuardUntil.current = Date.now() + 500;
      player.seekTo(0).catch(() => {});
      return;
    }
    const atOpening = q.index === 0 && player.currentTime <= 3;
    if (atOpening) {
      if (q.suraId > 1) playSura(q.suraId - 1);
      return;
    }
    if (q.index === 0) {
      player.seekTo(0).catch(() => {});
      return;
    }
    loadTrack(0, true);
  }, [getPlayer, loadTrack, playSura]);

  const lastReciter = useRef(reciter);
  useEffect(() => {
    if (lastReciter.current === reciter) return;
    lastReciter.current = reciter;
    const q = nowRef.current;
    if (!q) return;
    const wasPlaying = intent.current;
    try {
      playerRef.current?.pause();
    } catch {}
    startSura(q.suraId, q.verseId ?? 1, wasPlaying);
  }, [reciter, startSura]);

  const setRepeat = useCallback((patch: Partial<Repeat>) => {
    setRepeatState((r) => {
      const next = { ...r, ...patch };
      if (patch.mode !== undefined && patch.mode !== r.mode) playCount.current = 0;
      return next;
    });
  }, []);

  const setSpeed = useCallback(
    (n: number) => {
      setSpeedState(n);
      try {
        playerRef.current?.setPlaybackRate(n, 'high');
      } catch {}
    },
    []
  );

  const setAutoContinue = useCallback((v: boolean) => setAutoContinueState(v), []);

  const setSleepMinutes = useCallback((n: number) => {
    setSleepMinutesState(n);
    setSleepAt(n > 0 ? Date.now() + n * 60_000 : null);
  }, []);

  useEffect(() => {
    if (sleepAt == null) return;
    const ms = Math.max(0, sleepAt - Date.now());
    const t = setTimeout(() => {
      stop();
      setSleepMinutesState(0);
      setSleepAt(null);
    }, ms);
    return () => clearTimeout(t);
  }, [sleepAt, stop]);

  const hydrated = useRef(false);
  useEffect(() => {
    getJSON<{ repeat?: Repeat; speed?: number; autoContinue?: boolean }>(KEYS.quranAudio, {})
      .then((v) => {
        if (v.repeat) setRepeatState({ ...REPEAT_OFF, ...v.repeat });
        if (typeof v.speed === 'number') setSpeedState(v.speed);
        if (typeof v.autoContinue === 'boolean') setAutoContinueState(v.autoContinue);
      })
      .catch(() => {})
      .finally(() => {
        hydrated.current = true;
      });
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    setJSON(KEYS.quranAudio, { repeat, speed, autoContinue }).catch(() => {});
  }, [repeat, speed, autoContinue]);

  const value = useMemo<QuranAudioValue>(
    () => ({
      now, playing, trackIndexFor, playSura, playVerse, playRange, toggle, next, previous, stop,
      repeat, setRepeat, speed, setSpeed, autoContinue, setAutoContinue,
      sleepMinutes, setSleepMinutes, sleepAt,
    }),
    [
      now, playing, trackIndexFor, playSura, playVerse, playRange, toggle, next, previous, stop,
      repeat, setRepeat, speed, setSpeed, autoContinue, setAutoContinue,
      sleepMinutes, setSleepMinutes, sleepAt,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useQuranAudio(): QuranAudioValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useQuranAudio must be used within QuranAudioProvider');
  return v;
}

