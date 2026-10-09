import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import Icon from '../Icon';
import { fonts, SIZE, uiLeading } from '../../theme/type';
import { colors } from '../../theme/v3/colors';
import { space, radius } from '../../theme/v3/tokens';
import { availableProviders, signInWithApple, signInWithGoogle } from '../../data/authFlow';
import { authErrorText } from '../../data/authCopy';

export default function ProviderButtons({ onSignedIn }: { onSignedIn: () => void }) {
  const [providers, setProviders] = useState<{ google: boolean; apple: boolean } | null>(null);
  const [busy, setBusy] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    availableProviders().then((p) => alive && setProviders(p));
    return () => {
      alive = false;
    };
  }, []);

  const run = async (which: 'google' | 'apple') => {
    if (busy) return;
    setBusy(which);
    setError(null);
    const res = which === 'google' ? await signInWithGoogle() : await signInWithApple();
    setBusy(null);
    if (res.ok) onSignedIn();
    else if (res.error.kind !== 'cancelled') setError(authErrorText(res.error));
  };

  if (!providers || (!providers.google && !providers.apple)) return null;

  return (
    <View style={styles.wrap}>
      {providers.apple && (
        <Pressable style={styles.btn} onPress={() => run('apple')} accessibilityRole="button" disabled={!!busy}>
          {busy === 'apple' ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <>
              <Icon name="apple" set="community" size={18} color={colors.textPrimary} />
              <Text style={styles.text}>Continue with Apple</Text>
            </>
          )}
        </Pressable>
      )}
      {providers.google && (
        <Pressable style={styles.btn} onPress={() => run('google')} accessibilityRole="button" disabled={!!busy}>
          {busy === 'google' ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <>
              <Icon name="google" set="community" size={18} color={colors.textPrimary} />
              <Text style={styles.text}>Continue with Google</Text>
            </>
          )}
        </Pressable>
      )}
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xxs },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs,
    borderWidth: 1, borderColor: colors.outlineBorder, borderRadius: radius.pill, paddingVertical: space.sm + 2,
    marginTop: space.xxs, minHeight: 48,
  },
  text: { fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textPrimary },
  error: { fontFamily: fonts.semibold, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.gold, textAlign: 'center' },
});
