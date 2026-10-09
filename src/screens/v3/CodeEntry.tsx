import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Animated, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import Icon from '../../components/Icon';
import { fonts, serifHeading, tabular, SIZE, uiLeading, bodyLeading } from '../../theme/type';
import { colors } from '../../theme/v3/colors';
import { space, radius } from '../../theme/v3/tokens';
import { useAppState } from '../../state/AppState';
import { hasLiveWindow } from '../../utils/practice';
import { markOnboardingCompleted } from '../../data/prefs';
import { startEmail, verifyEmail } from '../../data/authFlow';
import { authErrorText } from '../../data/authCopy';

const CODE_LEN = 6;
const RESEND_SECONDS = 30;

export default function CodeEntry({ navigation, route }: any) {
  const { email, firstName, challengeId: firstChallenge } = route.params as { email: string; firstName?: string; challengeId: string };
  const { practice } = useAppState();

  const [challengeId, setChallengeId] = useState(firstChallenge);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'entering' | 'verifying' | 'wrong' | 'success'>('entering');
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);
  const shake = useRef(new Animated.Value(0)).current;
  const cellsOpacity = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const runShake = () => {
    Animated.sequence([
      Animated.timing(shake, { toValue: -7, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 7, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -5, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const onChangeCode = (text: string) => {
    if (status !== 'entering') return;
    const digits = text.replace(/\D/g, '').slice(0, CODE_LEN);
    setCode(digits);
    if (digits.length === CODE_LEN) verify(digits);
  };

  const verify = async (digits: string) => {
    setStatus('verifying');
    setMessage(null);
    const res = await verifyEmail(challengeId, digits, firstName);
    if (res.ok) {
      setStatus('success');
      Animated.timing(cellsOpacity, { toValue: 0, duration: 180, useNativeDriver: true }).start();
      setTimeout(() => {
        Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      }, 400);
      setTimeout(() => {
        markOnboardingCompleted();
        navigation.replace(hasLiveWindow(practice) ? 'Restore' : 'Home');
      }, 1300);
      return;
    }

    if (res.error.kind === 'expired') {
      setTimeout(() => navigation.replace('LinkExpired', { email, firstName }), 320);
      runShake();
      return;
    }
    runShake();
    setMessage(authErrorText(res.error));
    setStatus(res.error.kind === 'wrong_code' ? 'wrong' : 'entering');
    setTimeout(() => {
      setCode((c) => (res.error.kind === 'wrong_code' ? c.slice(0, -1) : c));
      setStatus('entering');
    }, 320);
  };

  const resend = async () => {
    if (resendIn > 0) return;
    setResendIn(RESEND_SECONDS);
    setCode('');
    setStatus('entering');
    const res = await startEmail(email);
    if (res.ok) {
      setChallengeId(res.value.challengeId);
      setMessage('A new code is on its way. The old one no longer works.');
    } else {
      setMessage(authErrorText(res.error));
      if (res.error.kind === 'too_soon') setResendIn(res.error.retryAfter);
    }
  };

  const openMailApp = () => {
    Linking.openURL(Platform.OS === 'ios' ? 'message://' : 'mailto:').catch(() => {});
  };

  const mm = String(Math.floor(resendIn / 60)).padStart(1, '0');
  const ss = String(resendIn % 60).padStart(2, '0');

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <Header title="" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Icon name="mark_email_unread" size={30} color={colors.accent} />
        </View>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.sub}>
          Sent to {email}. Type the six digits below.
        </Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.wrongAddress}>Wrong address?</Text>
        </Pressable>

        <Pressable
          style={{ minHeight: 60, justifyContent: 'center' }}
          onPress={() => inputRef.current?.focus()}
          accessibilityRole="button"
          accessibilityLabel={`Code, ${code.length} of ${CODE_LEN} digits entered`}
        >
          <Animated.View
            style={[styles.cellsRow, { opacity: cellsOpacity, transform: [{ translateX: shake }] }]}
            pointerEvents={status === 'success' ? 'none' : 'auto'}
          >
            {Array.from({ length: CODE_LEN }).map((_, i) => {
              const filled = i < code.length;
              const active = i === code.length;
              return (
                <View
                  key={i}
                  style={[
                    styles.cell,
                    filled && styles.cellFilled,
                    active && status === 'entering' && styles.cellActive,
                    status === 'wrong' && styles.cellWrong,
                  ]}
                >
                  <Text style={styles.cellText} maxFontSizeMultiplier={1.15}>{code[i] ?? ''}</Text>
                </View>
              );
            })}
          </Animated.View>
          <Animated.View style={[styles.successRow, { opacity: successOpacity }]} pointerEvents="none">
            <Icon name="check-circle" set="community" size={18} color={colors.accent} />
            <Text style={styles.successText}>Signed in.</Text>
          </Animated.View>
        </Pressable>

        {!!message && <Text style={styles.wrongHint}>{message}</Text>}

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={onChangeCode}
          keyboardType="number-pad"
          maxLength={CODE_LEN}
          style={styles.hiddenInput}
          editable={status === 'entering'}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
        />

        <Pressable style={styles.mailBtn} onPress={openMailApp}>
          <Icon name="open-in-new" set="community" size={16} color={colors.textPrimary} />
          <Text style={styles.mailBtnText}>Open my mail app</Text>
        </Pressable>

        <Pressable style={styles.resendRow} onPress={resend} disabled={resendIn > 0}>
          <Icon name="clock-outline" set="community" size={15} color={colors.textMuted} />
          <Text style={styles.resendText}>
            {resendIn > 0 ? `Send it again in ${mm}:${ss}` : 'Send it again'}
          </Text>
        </Pressable>

        <Text style={styles.info}>
          Nothing yet? Look in spam, and check the address above. The code works for 10 minutes.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  content: { paddingHorizontal: space.lg, paddingTop: space.md, alignItems: 'center', gap: space.xs },
  iconWrap: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.iconChipBg,
    alignItems: 'center', justifyContent: 'center', marginBottom: space.xxs,
  },
  title: { ...serifHeading(SIZE.display), color: colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: bodyLeading(SIZE.body), color: colors.textMuted, textAlign: 'center' },
  wrongAddress: { fontFamily: fonts.bold, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.accent, marginTop: space.xxs },
  cellsRow: { flexDirection: 'row', gap: space.xs, marginTop: space.md },
  cell: {
    width: 44, height: 54, borderRadius: 12, backgroundColor: colors.surfaceRaised,
    borderWidth: 1, borderColor: colors.outlineBorder, alignItems: 'center', justifyContent: 'center',
  },
  cellFilled: { backgroundColor: colors.bgCard, borderColor: colors.borderStrong },
  cellActive: { backgroundColor: 'rgba(123,224,190,0.06)', borderWidth: 1.5, borderColor: colors.accent },
  cellWrong: { borderColor: colors.gold },
  cellText: { fontFamily: fonts.bold, fontSize: SIZE.heading, lineHeight: uiLeading(SIZE.heading), ...tabular, color: colors.textPrimary },
  successRow: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: space.xs, alignSelf: 'center' },
  successText: { fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textPrimary },
  wrongHint: { fontFamily: fonts.semibold, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.gold, textAlign: 'center' },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  mailBtn: {
    flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: space.md,
    borderWidth: 1, borderColor: colors.outlineBorder, borderRadius: radius.pill,
    paddingVertical: space.xs + 2, paddingHorizontal: space.md,
  },
  mailBtnText: { fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textPrimary },
  resendRow: { flexDirection: 'row', alignItems: 'center', gap: space.xxs, marginTop: space.sm },
  resendText: { fontFamily: fonts.semibold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textMuted },
  info: { fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.textFaint, textAlign: 'center', marginTop: space.md },
});
