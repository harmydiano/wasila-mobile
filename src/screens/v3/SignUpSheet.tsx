import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import { fonts, serifHeading, SIZE, uiLeading, bodyLeading, eyebrow } from '../../theme/type';
import { colors } from '../../theme/v3/colors';
import { space, radius } from '../../theme/v3/tokens';
import ProviderButtons from '../../components/v3/ProviderButtons';
import { markOnboardingCompleted } from '../../data/prefs';

const WELCOME_BG = require('../../../design-assets/v3/img_bg_welcome.png');

const BENEFITS = [
  { icon: 'lock-open-variant-outline', label: 'Needed to subscribe to Wasīla Plus' },
  { icon: 'key-outline', label: 'No password: a code by email, or your Apple or Google account' },
];

export default function SignUpSheet({ navigation }: any) {
  const done = () => {
    markOnboardingCompleted();
    navigation.goBack();
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
        <View style={styles.topRow}>
          <View style={{ flex: 1 }} />
          <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()} hitSlop={10}>
            <Icon name="close" size={22} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={styles.eyebrow}>Salam.</Text>
          <Text style={styles.title}>Create a free account</Text>
          <Text style={styles.sub}>Free to make, and it stays free. It is what a subscription attaches to.</Text>

          <View style={{ gap: space.sm, marginVertical: space.sm }}>
            {BENEFITS.map((b) => (
              <View key={b.label} style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <Icon name={b.icon} set="community" size={16} color={colors.accent} />
                </View>
                <Text style={styles.benefitLabel}>{b.label}</Text>
              </View>
            ))}
          </View>

          <ProviderButtons onSignedIn={done} />
          <Pressable style={styles.oauthBtn} onPress={() => navigation.navigate('EmailEntry')}>
            <Icon name="email-outline" set="community" size={18} color={colors.textPrimary} />
            <Text style={styles.oauthText}>Continue with email</Text>
          </Pressable>

          <Text style={styles.legal}>By continuing you agree to Wasīla's Terms and Privacy Policy.</Text>

          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.notNow}>Not now, keep practising as a guest</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  bg: { position: 'absolute', top: 0, left: 0, right: 0, height: 320 },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', paddingHorizontal: space.lg },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: space.lg, paddingTop: space.md, gap: space.xs },
  eyebrow: { fontFamily: fonts.semibold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.textSecondary },
  title: { ...serifHeading(SIZE.display), color: colors.textPrimary, marginTop: -4 },
  sub: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: bodyLeading(SIZE.body), color: colors.textMuted },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  benefitIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.iconChipBg, alignItems: 'center', justifyContent: 'center' },
  benefitLabel: { flex: 1, fontFamily: fonts.semibold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textPrimary },
  oauthBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs,
    borderWidth: 1, borderColor: colors.outlineBorder, borderRadius: radius.pill, paddingVertical: space.sm + 2,
    marginTop: space.xxs,
  },
  oauthText: { fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textPrimary },
  legal: { fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.textFaint, textAlign: 'center', marginTop: space.sm },
  notNow: { fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textMuted, textAlign: 'center', marginTop: space.sm },
});
