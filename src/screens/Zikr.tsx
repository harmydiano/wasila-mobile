import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import Button from '../components/Button';
import Chip from '../components/Chip';
import { colors } from '../theme/colors';
import { fonts } from '../theme/type';
import { useAppState } from '../state/AppState';

const INTENTS = ['Provision', 'Protection', 'Health', 'Marriage', 'Studies', 'Peace of mind'];
const INTENT_LABEL: Record<string, string> = {
  Provision: 'Opening of provision',
  Protection: 'Opening of protection',
  Health: 'Opening of healing',
  Marriage: 'Opening of harmony',
  Studies: 'Opening of understanding',
  'Peace of mind': 'Opening of calm',
};
const RESULT_NAMES = [
  { ar: 'يَا لَطِيف', tr: 'Yā Laṭīf', meaning: 'The Subtle', count: '129×' },
  { ar: 'يَا فَتَّاح', tr: 'Yā Fattāḥ', meaning: 'The Opener', count: '489×' },
  { ar: 'يَا رَزَّاق', tr: 'Yā Razzāq', meaning: 'The Provider', count: '308×' },
];

export default function Zikr({ navigation }: any) {
  const { premium, openPaywall } = useAppState();
  const [step, setStep] = useState<'form' | 'wait' | 'result'>('form');
  const [name, setName] = useState('');
  const [mother, setMother] = useState('');
  const [intent, setIntent] = useState('Provision');

  useEffect(() => {
    if (step === 'wait') {
      const t = setTimeout(() => setStep('result'), 1800);
      return () => clearTimeout(t);
    }
  }, [step]);

  const Header = (
    <View style={styles.header}>
      <Pressable onPress={() => navigation.navigate('Home')} style={styles.iconBtn}>
        <Icon name="arrow_back" size={22} color={colors.textPrimary} />
      </Pressable>
    </View>
  );

  if (!premium) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        {Header}
        <View style={styles.centerPad}>
          <LinearGradient colors={[colors.premiumGradStart, colors.premiumGradEnd]} style={styles.lockedCard}>
            <Icon name="auto_awesome" size={26} color={colors.gold} />
            <Text style={styles.lockedTitle}>Personal zikr is a premium feature</Text>
            <Text style={styles.lockedBody}>One calculation, prepared for you and kept in your account. Included in every premium plan.</Text>
            <Button label="See plans" variant="gold" onPress={openPaywall} />
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'wait') {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        {Header}
        <View style={styles.centerPad}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.waitTitle}>Working it out</Text>
          <Text style={styles.waitBody}>This usually takes a moment. We will notify you if it takes longer.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'result') {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        {Header}
        <View style={{ padding: 20, gap: 18 }}>
          <View>
            <Text style={styles.eyebrow}>Prepared for {name || 'you'}</Text>
            <Text style={styles.resultHeadline}>{INTENT_LABEL[intent]}</Text>
          </View>
          <View style={styles.surahCard}>
            <Text style={styles.surahEyebrow}>Your surah</Text>
            <Text style={styles.surahArabic}>الشَّرْح</Text>
            <Text style={styles.surahName}>Sūrah ash-Sharḥ · 94</Text>
            <View style={styles.divider} />
            <Text style={styles.surahBody}>Verse 5–6, recited seven times after each obligatory prayer.</Text>
          </View>
          <View style={{ gap: 10 }}>
            {RESULT_NAMES.map((n) => (
              <View key={n.tr} style={styles.nameRow}>
                <Text style={styles.nameArabic}>{n.ar}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nameTr}>{n.tr} <Text style={styles.nameCount}>{n.count}</Text></Text>
                  <Text style={styles.nameMeaning}>{n.meaning}</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.scheduleNote}>
            <Icon name="schedule" size={18} color={colors.gold} />
            <Text style={styles.scheduleText}>Begin on a Thursday night. Keep to the same order each day for forty days, then repeat if needed.</Text>
          </View>
          <Button label="Start counting" onPress={() => navigation.navigate('Tasbih')} />
          <Button label="Redo" variant="outline" onPress={() => setStep('form')} />
        </View>
      </SafeAreaView>
    );
  }

  const canSubmit = name.trim().length > 0 && mother.trim().length > 0;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      {Header}
      <View style={{ padding: 20, gap: 18 }}>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text style={styles.zikrArabic}>ذِكْر</Text>
          <Text style={styles.formTitle}>Your personal zikr</Text>
          <Text style={styles.formSub}>A surah, a verse and a set of divine names worked out from your name and your mother’s. Prepared once, yours to keep.</Text>
        </View>
        <View style={{ gap: 12 }}>
          <View>
            <Text style={styles.label}>Your name</Text>
            <TextInput style={styles.input} placeholder="Ibrahim" placeholderTextColor={colors.textFaint} value={name} onChangeText={setName} />
          </View>
          <View>
            <Text style={styles.label}>Your mother's name</Text>
            <TextInput style={styles.input} placeholder="Aisha" placeholderTextColor={colors.textFaint} value={mother} onChangeText={setMother} />
          </View>
        </View>
        <View style={{ gap: 10 }}>
          <Text style={styles.label}>What is this for?</Text>
          <View style={styles.chipWrap}>
            {INTENTS.map((i) => (
              <Chip key={i} label={i} active={intent === i} onPress={() => setIntent(i)} showCheck={false} />
            ))}
          </View>
        </View>
        <View style={styles.privacyNote}>
          <Icon name="lock" size={16} color={colors.textMuted} />
          <Text style={styles.privacyText}>Names are used only for the calculation and are not shared. The result is prepared on our side and returned to your account.</Text>
        </View>
        <Button
          label={canSubmit ? 'Prepare my zikr' : 'Enter both names'}
          variant={canSubmit ? 'primary' : 'disabled'}
          onPress={() => canSubmit && setStep('wait')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  header: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 8 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  centerPad: { flex: 1, padding: 20, justifyContent: 'center', gap: 10 },
  lockedCard: { borderRadius: 22, padding: 24, alignItems: 'center', gap: 10 },
  lockedTitle: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.amberCardText, textAlign: 'center' },
  lockedBody: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.goldBody, textAlign: 'center', marginBottom: 8 },
  waitTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.textPrimary, textAlign: 'center', marginTop: 16 },
  waitBody: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted, textAlign: 'center', marginTop: 6 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 1, textTransform: 'uppercase', color: colors.accent },
  resultHeadline: { fontFamily: fonts.extrabold, fontSize: 22, color: colors.textPrimary, marginTop: 6 },
  surahCard: { backgroundColor: colors.bgCard, borderRadius: 20, padding: 22, alignItems: 'center' },
  surahEyebrow: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.textMuted },
  surahArabic: { fontFamily: fonts.arabic, fontSize: 44, color: colors.accent, marginTop: 8 },
  surahName: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  divider: { height: 1, width: '100%', backgroundColor: colors.divider, marginVertical: 14 },
  surahBody: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted, textAlign: 'center' },
  nameRow: { flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 16, padding: 14 },
  nameArabic: { fontFamily: fonts.arabic, fontSize: 28, color: colors.accent },
  nameTr: { fontFamily: fonts.bold, fontSize: 14, color: colors.textPrimary },
  nameCount: { fontFamily: fonts.semibold, fontSize: 11, color: colors.textMuted },
  nameMeaning: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
  scheduleNote: { flexDirection: 'row', gap: 10, backgroundColor: colors.amberCardBg, borderRadius: 14, padding: 14 },
  scheduleText: { flex: 1, fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.amberBody },
  zikrArabic: { fontFamily: fonts.arabic, fontSize: 34, color: colors.accent },
  formTitle: { fontFamily: fonts.extrabold, fontSize: 19, color: colors.textPrimary },
  formSub: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18, color: colors.textMuted, textAlign: 'center', maxWidth: 300 },
  label: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.textMuted, marginBottom: 6 },
  input: { backgroundColor: colors.bgInput, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 16, fontFamily: fonts.regular, fontSize: 14, color: colors.textPrimary },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  privacyNote: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  privacyText: { flex: 1, fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 16, color: colors.textFaint },
});
