import { Platform } from 'react-native';

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000')
).replace(/\/+$/, '');

const TIMEOUT_MS = 8000;

export type ApiResult<T> = { status: number; body: T };

let accessProvider: () => Promise<string | null> = async () => null;
export function setAccessProvider(fn: () => Promise<string | null>) {
  accessProvider = fn;
}

export async function apiSend<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  opts: { anonymous?: boolean } = {}
): Promise<ApiResult<T>> {
  const token = opts.anonymous ? null : await accessProvider();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      signal: ctrl.signal,
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    return { status: res.status, body: (text ? JSON.parse(text) : null) as T };
  } finally {
    clearTimeout(timer);
  }
}

export function apiGet<T>(path: string): Promise<ApiResult<T>> {
  return apiSend<T>('GET', path);
}
