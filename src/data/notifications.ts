import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const ADHAN_SOUND_ANDROID = 'adhan_notification';
export const ADHAN_SOUND_IOS = 'adhan_notification.caf';

export const PRAYER_CHANNEL_ID = 'prayer-adhan-v2';

const RETIRED_PRAYER_CHANNEL_IDS = ['prayer-adhan-v1'];

const ADHAN_AUDIO_ATTRIBUTES = {
  usage: Notifications.AndroidAudioUsage.ALARM,
  contentType: Notifications.AndroidAudioContentType.SONIFICATION,
} as const;

export const REMINDER_CHANNEL_ID = 'prayer-reminder-v1';

export const REMINDER_MINUTES_BEFORE = 5;

const DAYS_AHEAD = 6;

const MAX_PENDING = 60;

export type ScheduledPrayer = { name: string; date: Date };

export async function ensurePermissions(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(PRAYER_CHANNEL_ID, {
    name: 'Prayer times',
    importance: Notifications.AndroidImportance.HIGH,
    sound: ADHAN_SOUND_ANDROID,
    audioAttributes: ADHAN_AUDIO_ATTRIBUTES,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
  for (const retired of RETIRED_PRAYER_CHANNEL_IDS) {
    await Notifications.deleteNotificationChannelAsync(retired).catch(() => {});
  }
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Prayer reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 150],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

type NotificationEvent = { name: string; date: Date; kind: 'reminder' | 'adhan' };

export type ScheduleOutcome =
  | { status: 'scheduled'; count: number }
  | { status: 'superseded' }
  | { status: 'permission-denied' };

let scheduleQueue: Promise<unknown> = Promise.resolve();
let scheduleGeneration = 0;

export function scheduleAllPrayerNotifications(upcoming: ScheduledPrayer[]): Promise<ScheduleOutcome> {
  const generation = ++scheduleGeneration;
  const run = scheduleQueue.then(() => performSchedule(upcoming, generation));
  scheduleQueue = run.catch(() => undefined);
  return run;
}

async function performSchedule(upcoming: ScheduledPrayer[], generation: number): Promise<ScheduleOutcome> {
  const current = () => generation === scheduleGeneration;

  if (!current()) return { status: 'superseded' };
  if (!(await ensurePermissions())) return { status: 'permission-denied' };
  if (!current()) return { status: 'superseded' };

  await ensureChannel();
  if (!current()) return { status: 'superseded' };

  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = Date.now();
  const events: NotificationEvent[] = upcoming.flatMap((p) => [
    { name: p.name, date: new Date(p.date.getTime() - REMINDER_MINUTES_BEFORE * 60_000), kind: 'reminder' as const },
    { name: p.name, date: p.date, kind: 'adhan' as const },
  ]);

  const future = events
    .filter((e) => e.date.getTime() > now + 60_000)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, MAX_PENDING);

  let written = 0;
  for (const e of future) {
    if (!current()) return { status: 'superseded' };

    if (e.kind === 'reminder') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${e.name} soon`,
          body: `${e.name} begins in ${REMINDER_MINUTES_BEFORE} minutes.`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: e.date,
          channelId: REMINDER_CHANNEL_ID,
        },
      });
    } else {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${e.name}`,
          body: `It is time for ${e.name}.`,
          sound: Platform.OS === 'ios' ? ADHAN_SOUND_IOS : undefined,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: e.date,
          channelId: PRAYER_CHANNEL_ID,
        },
      });
    }
    written++;
  }
  return { status: 'scheduled', count: written };
}

export async function cancelAllPrayerNotifications(): Promise<void> {
  scheduleGeneration++;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export const SCHEDULING_WINDOW_DAYS = DAYS_AHEAD;

export type AdhanDiagnostics = {
  permitted: boolean;
  channelExists: boolean;
  channelSilenced: boolean;
  channelHasAdhan: boolean;
  pending: number;
  nextAt: Date | null;
};

export async function getAdhanDiagnostics(): Promise<AdhanDiagnostics> {
  const perms = await Notifications.getPermissionsAsync();

  let channelExists = false;
  let channelSilenced = false;
  let channelHasAdhan = Platform.OS !== 'android';
  if (Platform.OS === 'android') {
    const channel = await Notifications.getNotificationChannelAsync(PRAYER_CHANNEL_ID);
    channelExists = channel != null;
    channelHasAdhan = channel?.sound === 'custom';
    channelSilenced =
      channel != null && channel.importance <= Notifications.AndroidImportance.MIN;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const dates = scheduled
    .map((n) => {
      const t = n.trigger as { type?: string; value?: number; date?: number } | null;
      const raw = t?.value ?? t?.date;
      return typeof raw === 'number' ? new Date(raw) : null;
    })
    .filter((d): d is Date => d != null && !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  return {
    permitted: perms.granted,
    channelExists,
    channelSilenced,
    channelHasAdhan,
    pending: scheduled.length,
    nextAt: dates[0] ?? null,
  };
}

export async function sendTestAdhan(): Promise<boolean> {
  if (!(await ensurePermissions())) return false;
  await ensureChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Adhan test',
      body: 'This is how the call to prayer will sound.',
      sound: Platform.OS === 'ios' ? ADHAN_SOUND_IOS : undefined,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(Date.now() + 2_000),
      channelId: PRAYER_CHANNEL_ID,
    },
  });
  return true;
}
