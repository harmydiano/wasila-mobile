import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/type';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { useAppState } from '../state/AppState';
import { markOnboardingCompleted } from '../data/prefs';

const REMINDER_ROWS = [
  { key: 'After Fajr', time: '5:12 AM' },
  { key: 'After Maghrib', time: '7:04 PM' },
  { key: 'Unfinished counts', time: '9:30 PM' },
];

export default function Onboarding({ navigation }: any) {
  const { reminders, toggleReminder, showGift } = useAppState();
  const insets = useSafeAreaInsets();

  const finish = useCallback(() => {
    markOnboardingCompleted().finally(() => {
      navigation.replace('Home');
      setTimeout(() => showGift(), 250);
    });
  }, [navigation, showGift]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logotype}>وَسِيلَة</Text>
        <Text style={styles.title}>When should we remind you?</Text>
        <Text style={styles.sub}>
          Most benefits are tied to a prayer time. Reminders keep the count on track — you can change these any time in
          Settings.
        </Text>

        <View style={styles.remindersCard}>
          {REMINDER_ROWS.map((r, i) => (
            <Pressable
              key={r.key}
              onPress={() => toggleReminder(r.key)}
              style={[styles.reminderRow, i < REMINDER_ROWS.length - 1 && styles.reminderRowBorder]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.reminderLabel}>{r.key}</Text>
                <Text style={styles.reminderTime}>{r.time}</Text>
              </View>
              <View style={[styles.toggle, reminders[r.key] ? styles.toggleOn : styles.toggleOff]}>
                <View style={[styles.knob, reminders[r.key] ? styles.knobOn : styles.knobOff]} />
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.langNote}>
          <Icon name="language" size={20} color={colors.gold} />
          <Text style={styles.langNoteText}>
            Reading in <Text style={{ fontFamily: fonts.bold }}>English</Text> with Arabic alongside. العربية and
            Français are available in Settings.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
        <Button label="Enter Wasīla" onPress={finish} />
        <Pressable onPress={finish} hitSlop={8} style={styles.skipBtn}>
          <Text style={styles.skip}>Not now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, gap: 14 },
  logotype: { fontFamily: fonts.arabic, fontSize: 38, lineHeight: 38 * 2.05, color: colors.mint, textAlign: 'right', includeFontPadding: false },
  title: { fontFamily: fonts.extrabold, fontSize: 26, color: colors.textHeadline, letterSpacing: -0.4 },
  sub: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.textMuted },
  remindersCard: { backgroundColor: colors.bgCard, borderRadius: 18, paddingHorizontal: 18, marginTop: 4 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  reminderRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  reminderLabel: { fontFamily: fonts.semibold, fontSize: 14, color: colors.textPrimary },
  reminderTime: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  toggle: { width: 44, height: 26, borderRadius: 13, padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: colors.primary, alignItems: 'flex-end' },
  toggleOff: { backgroundColor: '#E1E7E5', borderWidth: 1, borderColor: colors.outlineBorder, alignItems: 'flex-start' },
  knob: { width: 20, height: 20, borderRadius: 10 },
  knobOn: { backgroundColor: colors.bgCard },
  knobOff: { backgroundColor: colors.textDisabled },
  langNote: { flexDirection: 'row', gap: 10, padding: 16, backgroundColor: colors.amberCardBg, borderRadius: 16 },
  langNoteText: { flex: 1, fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18, color: colors.amberBody },
  footer: { paddingHorizontal: 24, paddingTop: 12, gap: 4 },
  skipBtn: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 16 },
  skip: { fontFamily: fonts.semibold, fontSize: 14, color: colors.textMuted },
});
