import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Icon from '../components/Icon';
import { colors } from '../theme/colors';
import { fonts } from '../theme/type';
import { SETTING_GROUPS, NEEDS } from '../data/content';
import { useAppState } from '../state/AppState';
import { useUiVersion } from '../state/UiVersion';
import { getReciterName } from '../data/reciters';

const LANGS = ['English', 'العربية', 'Français'];

export default function Settings({ navigation }: any) {
  const { lang, setLang, arabicSize, signedIn, premium, needs, adhanEnabled, setAdhanEnabled, reciter } = useAppState();
  const { setUiVersion } = useUiVersion();
  const groups = SETTING_GROUPS(arabicSize, signedIn, premium, getReciterName(reciter));
  const chosenNeeds = NEEDS.filter((n) => needs[n]).length;

  return (
    <Screen contentStyle={{ paddingHorizontal: 20, gap: 20 }}>
      <Header title="Settings" onBack={() => navigation.navigate('More')} />

      <View style={{ gap: 10 }}>
        <View style={styles.langRow}>
          {LANGS.map((l) => (
            <Pressable key={l} style={[styles.langPill, lang === l && styles.langPillOn]} onPress={() => setLang(l)}>
              <Text style={[styles.langLabel, lang === l && styles.langLabelOn]}>{l}</Text>
            </Pressable>
          ))}
        </View>
        {lang === 'العربية' && (
          <View style={styles.rtlNote}>
            <Text style={styles.rtlNoteText}>Arabic switches the whole interface to right-to-left. Navigation, lists and the counter mirror.</Text>
          </View>
        )}
      </View>

      <View style={{ gap: 10 }}>
        <Text style={styles.groupTitle}>Prayer</Text>
        <View style={styles.card}>
          <Pressable style={styles.row} onPress={() => setAdhanEnabled(!adhanEnabled)}>
            <Icon name="volume_up" size={19} color={colors.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Adhan notification</Text>
              <Text style={styles.rowSub}>Plays the call to prayer at each prayer time</Text>
            </View>
            <View style={[styles.toggle, adhanEnabled ? styles.toggleOn : styles.toggleOff]}>
              <View style={[styles.knob, adhanEnabled ? styles.knobOn : styles.knobOff]} />
            </View>
          </Pressable>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={styles.groupTitle}>Personalisation</Text>
        <View style={styles.card}>
          <Pressable style={styles.row} onPress={() => navigation.navigate('Needs')}>
            <Icon name="tune" size={19} color={colors.textMuted} />
            <Text style={styles.rowLabel}>What matters most</Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.rowValue}>{chosenNeeds > 0 ? `${chosenNeeds} selected` : 'Not set'}</Text>
          </Pressable>
        </View>
      </View>

      {groups.map((g) => (
        <View key={g.title} style={{ gap: 10 }}>
          <Text style={styles.groupTitle}>{g.title}</Text>
          <View style={styles.card}>
            {g.rows.map((r, i) => (
              <Pressable
                key={r.label}
                style={[styles.row, i < g.rows.length - 1 && styles.rowBorder]}
                onPress={() => (r as any).go && navigation.navigate((r as any).go)}
              >
                <Icon name={r.icon} size={19} color={colors.textMuted} />
                <Text style={styles.rowLabel}>{r.label}</Text>
                <View style={{ flex: 1 }} />
                <Text style={styles.rowValue}>{r.value}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <View style={{ gap: 10 }}>
        <Text style={styles.groupTitle}>Design</Text>
        <View style={styles.card}>
          <Pressable style={[styles.row, styles.rowBorder]} onPress={() => setUiVersion('v3')}>
            <Icon name="auto_fix_high" size={19} color={colors.textMuted} />
            <Text style={styles.rowLabel}>Try the new design</Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.rowValue}>Beta</Text>
          </Pressable>
          <Pressable style={styles.row} onPress={() => setUiVersion('v2')}>
            <Icon name="auto_fix_high" size={19} color={colors.textMuted} />
            <Text style={styles.rowLabel}>Try the previous beta</Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.rowValue}>v2</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  langRow: { flexDirection: 'row', gap: 8 },
  langPill: { paddingVertical: 9, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, borderColor: colors.outlineBorder },
  langPillOn: { backgroundColor: colors.mint, borderColor: colors.mint },
  langLabel: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textSecondary },
  langLabelOn: { color: colors.onMintText, fontFamily: fonts.bold },
  rtlNote: { backgroundColor: colors.amberCardBg, borderRadius: 14, padding: 14 },
  rtlNoteText: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.amberBody },
  groupTitle: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.textMuted },
  card: { backgroundColor: colors.bgCard, borderRadius: 16, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowLabel: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.textPrimary },
  rowValue: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted },
  rowSub: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
  toggle: { width: 44, height: 26, borderRadius: 13, padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: colors.primary, alignItems: 'flex-end' },
  toggleOff: { backgroundColor: '#E1E7E5', borderWidth: 1, borderColor: colors.outlineBorder, alignItems: 'flex-start' },
  knob: { width: 20, height: 20, borderRadius: 10 },
  knobOn: { backgroundColor: colors.bgCard },
  knobOff: { backgroundColor: colors.textDisabled },
});
