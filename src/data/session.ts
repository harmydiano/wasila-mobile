import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import { useSyncExternalStore } from 'react';
import { apiSend, setAccessProvider } from './api';

export type Account = {
  id: string;
  email: string | null;
  name: string | null;
  plus: boolean;
  providers: string[];
};

export type Session = { access: string; accessExpiresAt: number; refresh: string; account: Account };

const REFRESH_KEY = 'wasila.refresh';
const ACCOUNT_KEY = 'wasila.account';
const EARLY_MS = 60 * 1000;

let access: string | null = null;
let accessExpiresAt = 0;
let refresh: string | null = null;
let account: Account | null = null;

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function useAccount(): Account | null {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => account
  );
}

export function currentAccount(): Account | null {
  return account;
}

export function deviceName(): string {
  return [Device.manufacturer, Device.modelName].filter(Boolean).join(' ') || 'Phone';
}

export async function loadSession(): Promise<Account | null> {
  try {
    const [r, a] = await Promise.all([SecureStore.getItemAsync(REFRESH_KEY), SecureStore.getItemAsync(ACCOUNT_KEY)]);
    refresh = r;
    account = r && a ? (JSON.parse(a) as Account) : null;
  } catch {
    refresh = null;
    account = null;
  }
  notify();
  return account;
}

export async function saveSession(s: Session): Promise<void> {
  access = s.access;
  accessExpiresAt = s.accessExpiresAt;
  refresh = s.refresh;
  account = s.account;
  notify();
  await Promise.all([
    SecureStore.setItemAsync(REFRESH_KEY, s.refresh),
    SecureStore.setItemAsync(ACCOUNT_KEY, JSON.stringify(s.account)),
  ]);
}

export async function updateAccount(next: Account): Promise<void> {
  account = next;
  notify();
  await SecureStore.setItemAsync(ACCOUNT_KEY, JSON.stringify(next));
}

export async function clearSession(): Promise<void> {
  access = null;
  accessExpiresAt = 0;
  refresh = null;
  account = null;
  notify();
  await Promise.all([SecureStore.deleteItemAsync(REFRESH_KEY), SecureStore.deleteItemAsync(ACCOUNT_KEY)]).catch(() => {});
}

let inflight: Promise<string | null> | null = null;

async function accessToken(): Promise<string | null> {
  if (!refresh) return null;
  if (access && Date.now() < accessExpiresAt - EARLY_MS) return access;
  inflight ??= (async () => {
    const presented = refresh;
    try {
      const res = await apiSend<Session>('POST', '/v1/auth/refresh', { refresh: presented }, { anonymous: true });
      if (res.status === 200) {
        await saveSession(res.body);
        return res.body.access;
      }
      if (res.status === 401 && refresh === presented) await clearSession();
      return null;
    } catch {
      return null;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

setAccessProvider(accessToken);

export function currentRefresh(): string | null {
  return refresh;
}
