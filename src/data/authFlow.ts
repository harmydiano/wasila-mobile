import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { apiSend } from './api';
import { clearSession, currentAccount, currentRefresh, deviceName, saveSession, updateAccount, type Account, type Session } from './session';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

if (GOOGLE_WEB_CLIENT_ID) {
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, iosClientId: GOOGLE_IOS_CLIENT_ID });
}

export type AuthError =
  | { kind: 'offline' }
  | { kind: 'cancelled' }
  | { kind: 'wrong_code'; attemptsLeft: number }
  | { kind: 'expired' }
  | { kind: 'too_soon'; retryAfter: number }
  | { kind: 'too_many' }
  | { kind: 'invalid_email' }
  | { kind: 'failed' };

type Result<T> = { ok: true; value: T } | { ok: false; error: AuthError };

const fail = (error: AuthError): Result<never> => ({ ok: false, error });

export async function availableProviders(): Promise<{ google: boolean; apple: boolean }> {
  let server = { google: false, apple: false };
  try {
    const res = await apiSend<{ google: boolean; apple: boolean }>('GET', '/v1/auth/providers', undefined, { anonymous: true });
    if (res.status === 200) server = res.body;
  } catch {
  }
  const apple = Platform.OS === 'ios' && server.apple && (await AppleAuthentication.isAvailableAsync().catch(() => false));
  const google = server.google && !!GOOGLE_WEB_CLIENT_ID && (Platform.OS !== 'ios' || !!GOOGLE_IOS_CLIENT_ID);
  return { google, apple };
}

export async function startEmail(email: string): Promise<Result<{ challengeId: string }>> {
  try {
    const res = await apiSend<{ challengeId?: string; error?: string; retryAfter?: number }>(
      'POST', '/v1/auth/start', { email }, { anonymous: true }
    );
    if (res.status === 200 && res.body.challengeId) return { ok: true, value: { challengeId: res.body.challengeId } };
    if (res.body?.error === 'too_soon') return fail({ kind: 'too_soon', retryAfter: res.body.retryAfter ?? 30 });
    if (res.body?.error === 'too_many') return fail({ kind: 'too_many' });
    if (res.body?.error === 'invalid_email') return fail({ kind: 'invalid_email' });
    return fail({ kind: 'failed' });
  } catch {
    return fail({ kind: 'offline' });
  }
}

export async function verifyEmail(challengeId: string, code: string, name?: string): Promise<Result<Account>> {
  try {
    const res = await apiSend<Session & { error?: string; attemptsLeft?: number }>(
      'POST', '/v1/auth/verify', { challengeId, code, name: name || undefined, device: deviceName() }, { anonymous: true }
    );
    if (res.status === 200) {
      await saveSession(res.body);
      return { ok: true, value: res.body.account };
    }
    if (res.body?.error === 'wrong_code') return fail({ kind: 'wrong_code', attemptsLeft: res.body.attemptsLeft ?? 0 });
    if (res.status === 410) return fail({ kind: 'expired' });
    return fail({ kind: 'failed' });
  } catch {
    return fail({ kind: 'offline' });
  }
}

export async function signInWithGoogle(): Promise<Result<Account>> {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const res = await GoogleSignin.signIn();
    if (!isSuccessResponse(res)) return fail({ kind: 'cancelled' });
    const idToken = res.data.idToken;
    if (!idToken) return fail({ kind: 'failed' });
    const api = await apiSend<Session>('POST', '/v1/auth/google', { idToken, device: deviceName() }, { anonymous: true });
    if (api.status !== 200) return fail({ kind: 'failed' });
    await saveSession(api.body);
    return { ok: true, value: api.body.account };
  } catch (e) {
    if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) return fail({ kind: 'cancelled' });
    if (isErrorWithCode(e) && e.code === statusCodes.IN_PROGRESS) return fail({ kind: 'cancelled' });
    return fail({ kind: e instanceof TypeError ? 'offline' : 'failed' });
  }
}

export async function signInWithApple(): Promise<Result<Account>> {
  try {
    const cred = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
    });
    if (!cred.identityToken) return fail({ kind: 'failed' });
    const name = [cred.fullName?.givenName, cred.fullName?.familyName].filter(Boolean).join(' ') || undefined;
    const api = await apiSend<Session>(
      'POST', '/v1/auth/apple', { identityToken: cred.identityToken, name, device: deviceName() }, { anonymous: true }
    );
    if (api.status !== 200) return fail({ kind: 'failed' });
    await saveSession(api.body);
    return { ok: true, value: api.body.account };
  } catch (e: any) {
    if (e?.code === 'ERR_REQUEST_CANCELED') return fail({ kind: 'cancelled' });
    return fail({ kind: 'failed' });
  }
}

export async function refreshAccount(): Promise<Account | null> {
  if (!currentAccount()) return null;
  try {
    const res = await apiSend<Account>('GET', '/v1/account');
    if (res.status === 200) {
      await updateAccount(res.body);
      return res.body;
    }
  } catch {
  }
  return currentAccount();
}

export async function signOut(): Promise<void> {
  const refreshToken = currentRefresh();
  try {
    if (refreshToken) await apiSend('POST', '/v1/auth/signout', { refresh: refreshToken }, { anonymous: true });
  } catch {
  }
  if (GOOGLE_WEB_CLIENT_ID) await GoogleSignin.signOut().catch(() => {});
  await clearSession();
}

export async function deleteAccount(): Promise<Result<true>> {
  try {
    const res = await apiSend('DELETE', '/v1/account');
    if (res.status !== 204 && res.status !== 401) return fail({ kind: 'failed' });
  } catch {
    return fail({ kind: 'offline' });
  }
  if (GOOGLE_WEB_CLIENT_ID) await GoogleSignin.revokeAccess().catch(() => {});
  await clearSession();
  return { ok: true, value: true };
}
