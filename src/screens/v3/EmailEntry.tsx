import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import Icon from '../../components/Icon';
import { fonts, serifHeading, SIZE, uiLeading, bodyLeading } from '../../theme/type';
import { colors } from '../../theme/v3/colors';
import { space, radius } from '../../theme/v3/tokens';
import { startEmail } from '../../data/authFlow';
import { authErrorText } from '../../data/authCopy';

const WELCOME_BG = require('../../../design-assets/v3/img_bg_welcome.png');

export default function EmailEntry({ navigation }: any) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSubmit = /\S+@\S+\.\S+/.test(email.trim()) && !sending;

  const sendCode = async () => {
    if (!canSubmit) return;
    setSending(true);
    setError(null);
    const address = email.trim().toLowerCase();
    const res = await startEmail(address);
    setSending(false);
    if (res.ok) {
      navigation.navigate('CodeEntry', { email: address, firstName: firstName.trim() || undefined, challengeId: res.value.challengeId });
      return;
    }
    setError(authErrorText(res.error));
  };

  return (
    <View style={styles.root}>
      <Image source={WELCOME_BG} style={styles.bg} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(10,21,18,0)', 'rgba(10,21,18,0.5)', colors.bgRoot]}
        locations={[0, 0.45, 0.85]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Header title="" onBack={() => navigation.goBack()} />
        <View style={styles.content}>
          <Text style={styles.title}>What is your email?</Text>
          <Text style={styles.sub}>We send a six-digit code. There is no password to create.</Text>

          <View style={styles.field}>
            <Icon name="account-outline" set="community" size={18} color={colors.textMuted} />
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Amina"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
            />
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalBadgeText}>Optional</Text>
            </View>
          </View>
          <Text style={styles.helper}>First name only, used for the greeting on your dashboard.</Text>

          <View style={[styles.field, { marginTop: space.xs }]}>
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

          <Text style={styles.legal}>By continuing you agree to Wasīla's Terms and Privacy Policy.</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  bg: { position: 'absolute', top: 0, left: 0, right: 0, height: 320 },
  safe: { flex: 1 },
  content: { paddingHorizontal: space.lg, paddingTop: space.md, gap: space.sm + 2 },
  title: { ...serifHeading(SIZE.display), color: colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: bodyLeading(SIZE.body), color: colors.textMuted, marginBottom: space.xs },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: space.xs,
    backgroundColor: colors.bgCard, borderRadius: radius.card, borderWidth: 1, borderColor: colors.outlineBorder,
    paddingHorizontal: space.sm + 2, height: 52,
  },
  input: { flex: 1, fontFamily: fonts.semibold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.textPrimary },
  optionalBadge: { backgroundColor: colors.bgCardMuted, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8 },
  optionalBadgeText: { fontFamily: fonts.semibold, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.textMuted },
  helper: { fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.textFaint, marginTop: -space.xxs },
  primaryBtn: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: space.sm + 2, alignItems: 'center', marginTop: space.xxs },
  primaryBtnDisabled: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.outlineBorder },
  primaryBtnText: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.onMintText },
  primaryBtnTextDisabled: { color: colors.textDisabled },
  error: { fontFamily: fonts.semibold, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.gold },
  legal: { fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.textFaint, textAlign: 'center', marginTop: space.sm },
});
