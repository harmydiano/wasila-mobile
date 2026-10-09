import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import Icon from '../../components/Icon';
import WelcomePlate from '../../components/v3/WelcomePlate';
import { fonts, serifHeading, SIZE, uiLeading, bodyLeading } from '../../theme/type';
import { colors } from '../../theme/v3/colors';
import { space, radius } from '../../theme/v3/tokens';
import { useAppState } from '../../state/AppState';
import { hasLiveWindow } from '../../utils/practice';
import { markOnboardingCompleted } from '../../data/prefs';
import { startEmail } from '../../data/authFlow';
import { authErrorText } from '../../data/authCopy';
import ProviderButtons from '../../components/v3/ProviderButtons';

export default function SignIn({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { practice } = useAppState();
  const canSubmit = /\S+@\S+\.\S+/.test(email.trim()) && !sending;

  const sendCode = async () => {
    if (!canSubmit) return;
    setSending(true);
    setError(null);
    const address = email.trim().toLowerCase();
    const res = await startEmail(address);
    setSending(false);
    if (res.ok) navigation.navigate('CodeEntry', { email: address, challengeId: res.value.challengeId });
    else setError(authErrorText(res.error));
  };

  const done = () => {
    markOnboardingCompleted();
    navigation.replace(hasLiveWindow(practice) ? 'Restore' : 'Home');
  };

  return (
    <View style={styles.root}>
      <WelcomePlate heightFactor={0.8} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Header title="" onBack={() => navigation.goBack()} />
        <View style={styles.spacer} />
        <View style={styles.content}>
          <Text style={styles.title}>Pick up where you left off</Text>
          <Text style={styles.sub}>
            Enter the email you signed up with. We send a six-digit code. There is no password to remember.
          </Text>

          <View style={styles.field}>
            <Icon name="email-outline" set="community" size={18} color={colors.textMuted} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textFaint}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="send"
              onSubmitEditing={sendCode}
              style={styles.input}
            />
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
            disabled={!canSubmit}
            onPress={sendCode}
            accessibilityRole="button"
          >
            {sending ? (
              <ActivityIndicator color={colors.onMintText} />
            ) : (
              <Text style={[styles.primaryBtnText, !canSubmit && styles.primaryBtnTextDisabled]}>Send me a code</Text>
            )}
          </Pressable>

          <ProviderButtons onSignedIn={done} />

          <Pressable onPress={() => navigation.replace('NeedsPicker')}>
            <Text style={styles.footer}>New here? <Text style={styles.footerLink}>Choose what you need instead.</Text></Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  safe: { flex: 1 },
  spacer: { flex: 1 },
  content: { paddingHorizontal: space.lg, paddingBottom: space.lg, gap: space.sm + 2 },
  title: { ...serifHeading(SIZE.display), color: colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: bodyLeading(SIZE.body), color: colors.textMuted, marginBottom: space.xs },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: space.xs,
    backgroundColor: colors.bgCard, borderRadius: radius.card, borderWidth: 1, borderColor: colors.outlineBorder,
    paddingHorizontal: space.sm + 2, height: 52,
  },
  input: { flex: 1, fontFamily: fonts.semibold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.textPrimary },
  error: { fontFamily: fonts.semibold, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.gold },
  primaryBtn: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: space.sm + 2, alignItems: 'center', marginTop: space.xxs },
  primaryBtnDisabled: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.outlineBorder },
  primaryBtnText: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.onMintText },
  primaryBtnTextDisabled: { color: colors.textDisabled },
  footer: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textMuted, textAlign: 'center', marginTop: space.sm },
  footerLink: { fontFamily: fonts.bold, color: colors.accent },
});
