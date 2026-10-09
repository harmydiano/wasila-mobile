import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import { fonts, serifHeading, SIZE, uiLeading, bodyLeading } from '../../theme/type';
import { colors } from '../../theme/v3/colors';
import { space, radius } from '../../theme/v3/tokens';
import { startEmail } from '../../data/authFlow';
import { authErrorText } from '../../data/authCopy';

export default function LinkExpired({ navigation, route }: any) {
  const { email, firstName } = (route.params ?? {}) as { email?: string; firstName?: string };

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendNewCode = async () => {
    if (!email || sending) return;
    setSending(true);
    setError(null);
    const res = await startEmail(email);
    setSending(false);
    if (res.ok) navigation.replace('CodeEntry', { email, firstName, challengeId: res.value.challengeId });
    else setError(authErrorText(res.error));
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.closeBtn} onPress={() => navigation.replace('Home')} hitSlop={10}>
          <Icon name="close" size={22} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Icon name="link-off" set="community" size={30} color={colors.gold} />
        </View>
        <Text style={styles.title}>That code has expired</Text>
        <Text style={styles.sub}>
          Codes work for 10 minutes and five tries. Your practice and your count are untouched.
        </Text>
        {!!email && <Text style={styles.email}>{email}</Text>}

        {!!error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={styles.primaryBtn} onPress={sendNewCode} disabled={sending} accessibilityRole="button">
          {sending ? <ActivityIndicator color={colors.onMintText} /> : <Text style={styles.primaryBtnText}>Send a new code</Text>}
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={() => navigation.replace('EmailEntry')}>
          <Text style={styles.secondaryBtnText}>Use a different address</Text>
        </Pressable>

        <Text style={styles.footnote}>
          An account is only needed to subscribe. You can close this and keep practising as a guest.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  error: { fontFamily: fonts.semibold, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.gold, textAlign: 'center' },
  root: { flex: 1, backgroundColor: colors.bgRoot },
  topRow: { flexDirection: 'row', paddingHorizontal: space.lg, paddingTop: space.xs },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: space.lg, paddingTop: space.lg, alignItems: 'center', gap: space.xs },
  iconWrap: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.amberCardBg,
    alignItems: 'center', justifyContent: 'center', marginBottom: space.xxs,
  },
  title: { ...serifHeading(SIZE.display), color: colors.textPrimary, textAlign: 'center' },
  sub: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: bodyLeading(SIZE.body), color: colors.textMuted, textAlign: 'center' },
  email: { fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textSecondary, marginTop: space.xxs },
  primaryBtn: {
    width: '100%', backgroundColor: colors.accent, borderRadius: radius.pill,
    paddingVertical: space.sm + 2, alignItems: 'center', marginTop: space.lg,
  },
  primaryBtnText: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.onMintText },
  secondaryBtn: { paddingVertical: space.sm, alignItems: 'center' },
  secondaryBtnText: { fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textSecondary },
  footnote: { fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.textFaint, textAlign: 'center', marginTop: space.md },
});
