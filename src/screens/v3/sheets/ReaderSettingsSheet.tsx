import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Sheet from '../../../components/Sheet';
import Icon from '../../../components/Icon';
import { fonts, serifHeading, arabicText, eyebrow, tabular, SIZE, CLAMP, uiLeading, bodyLeading } from '../../../theme/type';
import { colors, v3 } from '../../../theme/v3/colors';
import { useAppState } from '../../../state/AppState';
import { useQuranAudio, SPEEDS, type RepeatMode } from '../../../state/QuranAudio';
import {
  useReaderPrefs,
  setReaderPrefs,
  resetDisplayPrefs,
  resetTextPrefs,
  SPACING_LABEL,
  PAPER,
  DEEP,
  type LineSpacing,
  type ReaderTheme,
  type ReaderMode,
} from '../../../data/quranReaderPrefs';
import { getReciterName } from '../../../data/reciters';
import { listDownloads } from '../../../data/audioDownloads';

type Pane = 'display' | 'text' | 'audio';

const PANES: { key: Pane; label: string }[] = [
  { key: 'display', label: 'Display' },
  { key: 'text', label: 'Text' },
  { key: 'audio', label: 'Audio' },
];

const THEMES: { key: ReaderTheme; label: string; bg: string; ink: string; border: string }[] = [
  { key: 'night', label: 'Night', bg: colors.bgCard, ink: colors.textPrimary, border: colors.outlineBorder },
  { key: 'paper', label: 'Paper', bg: PAPER.bg, ink: PAPER.inkTitle, border: PAPER.border },
  { key: 'deep', label: 'Deep dark', bg: DEEP.bg, ink: colors.mint, border: DEEP.border },
];

const MODES: { key: ReaderMode; label: string; sub: string; icon: string }[] = [
  { key: 'list', label: 'Verse list', sub: 'With translation', icon: 'format_list_bulleted' },
  { key: 'mushaf', label: 'Mushaf', sub: 'Script only', icon: 'import_contacts' },
];

const GOALS = [0, 5, 10, 20, 30];
const REPEATS: { key: RepeatMode; label: string }[] = [
  { key: 'off', label: 'Off' },
  { key: 'ayah', label: 'Ayah' },
  { key: 'range', label: 'Range' },
  { key: 'sura', label: 'Sura' },
];
const SLEEP = [0, 10, 20, 30, 60];

const ARABIC_MIN = 22;
const ARABIC_MAX = 46;
const ARABIC_STEP = 2;

function Row({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <View style={[styles.switchTrack, on && styles.switchTrackOn]}>
      <View style={[styles.switchKnob, on && styles.switchKnobOn]} />
    </View>
  );
}

function PillGroup<T extends string | number>({
  options,
  value,
  onPick,
  label,
}: {
  options: { key: T; label: string }[];
  value: T;
  onPick: (v: T) => void;
  label: string;
}) {
  return (
    <View style={styles.pillRow}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable
            key={String(o.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${label}: ${o.label}`}
            style={({ pressed }) => [styles.pill, on && styles.pillOn, pressed && styles.pressed]}
            onPress={() => onPick(o.key)}
          >
            <Text style={[styles.pillText, on && styles.pillTextOn]} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function ReaderSettingsSheet({
  visible,
  onClose,
  navigation,
}: {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}) {
  const [pane, setPane] = useState<Pane>('display');
  const prefs = useReaderPrefs();
  const { arabicSize, setArabicSize, reciter } = useAppState();
  const {
    repeat, setRepeat, speed, setSpeed,
    autoContinue, setAutoContinue,
    sleepMinutes, setSleepMinutes,
  } = useQuranAudio();

  const saved = listDownloads().filter((d) => d.reciter === reciter);
  const savedMb = saved.reduce((n, d) => n + d.bytes, 0) / (1024 * 1024);

  return (
    <Sheet visible={visible} onClose={onClose} bg={colors.bgCardAlt} maxHeightPct={88}>
      <View style={styles.head}>
        <Text style={styles.title}>Reading settings</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} onPress={onClose}>
          <Icon name="close" size={23} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.segmented}>
        {PANES.map((t) => {
          const on = pane === t.key;
          return (
            <Pressable
              key={t.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={({ pressed }) => [styles.segment, on && styles.segmentOn, pressed && styles.pressed]}
              onPress={() => setPane(t.key)}
            >
              <Text style={[styles.segmentText, on && styles.segmentTextOn]} maxFontSizeMultiplier={CLAMP}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {pane === 'display' && (
        <View style={styles.pane}>
          <Text style={styles.eyebrow}>Theme</Text>
          <View style={styles.themeRow}>
            {THEMES.map((t) => {
              const on = prefs.theme === t.key;
              return (
                <Pressable
                  key={t.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${t.label} theme`}
                  style={({ pressed }) => [
                    styles.themeCard,
                    { backgroundColor: t.bg, borderColor: on ? colors.accent : t.border, borderWidth: on ? 2 : 1 },
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setReaderPrefs({ theme: t.key })}
                >
                  <Text style={[styles.themeSample, { color: t.ink }]} maxFontSizeMultiplier={1}>
                    بِسْمِ اللّٰه
                  </Text>
                  <Text
                    style={[styles.themeLabel, { color: on ? colors.accent : t.ink }]}
                    numberOfLines={1}
                    maxFontSizeMultiplier={CLAMP}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.eyebrow}>Reading mode</Text>
          <View style={styles.modeRow}>
            {MODES.map((m) => {
              const on = prefs.mode === m.key;
              return (
                <Pressable
                  key={m.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  style={({ pressed }) => [styles.modeCard, on && styles.modeCardOn, pressed && styles.pressed]}
                  onPress={() => setReaderPrefs({ mode: m.key })}
                >
                  <Icon name={m.icon} size={22} color={on ? colors.accent : colors.textMuted} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modeLabel, on && { color: colors.accent }]} numberOfLines={1}>
                      {m.label}
                    </Text>
                    <Text style={styles.modeSub} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                      {m.sub}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: prefs.autoScroll }}
            style={({ pressed }) => [pressed && styles.pressed]}
            onPress={() => setReaderPrefs({ autoScroll: !prefs.autoScroll })}
          >
            <Row title="Auto-scroll to playing ayah" sub="Follows the recitation down the list">
              <Toggle on={prefs.autoScroll} />
            </Row>
          </Pressable>

          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: prefs.verseNumbers }}
            style={({ pressed }) => [pressed && styles.pressed]}
            onPress={() => setReaderPrefs({ verseNumbers: !prefs.verseNumbers })}
          >
            <Row title="Show verse numbers" sub="Medallions in mushaf mode">
              <Toggle on={prefs.verseNumbers} />
            </Row>
          </Pressable>

          <View style={styles.goalCard}>
            <View style={styles.goalHead}>
              <Icon name="local_fire_department" size={21} color={colors.gold} />
              <Text style={[styles.rowTitle, { flex: 1 }]}>Reading goal</Text>
              <Text style={styles.goalValue} maxFontSizeMultiplier={CLAMP}>
                {prefs.goalMinutes === 0 ? 'Off' : `${prefs.goalMinutes} min a day`}
              </Text>
            </View>
            <PillGroup
              label="Reading goal"
              value={prefs.goalMinutes}
              onPick={(v) => setReaderPrefs({ goalMinutes: v })}
              options={GOALS.map((g) => ({ key: g, label: g === 0 ? 'Off' : `${g}m` }))}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.reset, pressed && styles.pressed]}
            onPress={resetDisplayPrefs}
          >
            <Text style={styles.resetText}>Reset display settings</Text>
          </Pressable>
        </View>
      )}

      {pane === 'text' && (
        <View style={styles.pane}>
          <View style={styles.stepperCard}>
            <View style={styles.stepperHead}>
              <Text style={styles.rowTitle}>Arabic size</Text>
              <Text style={styles.stepperValue} maxFontSizeMultiplier={CLAMP}>{`${arabicSize} pt`}</Text>
            </View>
            <View style={styles.stepperRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Smaller Arabic"
                hitSlop={8}
                disabled={arabicSize <= ARABIC_MIN}
                style={({ pressed }) => [pressed && styles.pressed]}
                onPress={() => setArabicSize(Math.max(ARABIC_MIN, arabicSize - ARABIC_STEP))}
              >
                <Icon
                  name="remove_circle_outline"
                  size={26}
                  color={arabicSize <= ARABIC_MIN ? colors.textDisabled : colors.textMuted}
                />
              </Pressable>
              <View style={styles.stepperTrack}>
                <View
                  style={[
                    styles.stepperFill,
                    { width: `${((arabicSize - ARABIC_MIN) / (ARABIC_MAX - ARABIC_MIN)) * 100}%` },
                  ]}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Larger Arabic"
                hitSlop={8}
                disabled={arabicSize >= ARABIC_MAX}
                style={({ pressed }) => [pressed && styles.pressed]}
                onPress={() => setArabicSize(Math.min(ARABIC_MAX, arabicSize + ARABIC_STEP))}
              >
                <Icon
                  name="add_circle_outline"
                  size={26}
                  color={arabicSize >= ARABIC_MAX ? colors.textDisabled : colors.accent}
                />
              </Pressable>
            </View>
            <Text style={[styles.sample, { fontSize: arabicSize, lineHeight: Math.round(arabicSize * 2.05) }]} maxFontSizeMultiplier={1}>
              قُلْ هُوَ اللّٰهُ أَحَد
            </Text>
          </View>

          <View style={styles.stepperCard}>
            <View style={styles.stepperHead}>
              <Text style={styles.rowTitle}>Line spacing</Text>
              <Text style={styles.stepperValue} maxFontSizeMultiplier={CLAMP}>
                {SPACING_LABEL[prefs.lineSpacing]}
              </Text>
            </View>
            <PillGroup
              label="Line spacing"
              value={prefs.lineSpacing}
              onPick={(v) => setReaderPrefs({ lineSpacing: v as LineSpacing })}
              options={(['tight', 'comfortable', 'loose'] as LineSpacing[]).map((k) => ({
                key: k,
                label: SPACING_LABEL[k],
              }))}
            />
          </View>

          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: prefs.showTranslit }}
            style={({ pressed }) => [pressed && styles.pressed]}
            onPress={() => setReaderPrefs({ showTranslit: !prefs.showTranslit })}
          >
            <Row title="Show transliteration">
              <Toggle on={prefs.showTranslit} />
            </Row>
          </Pressable>

          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: prefs.showTranslation }}
            style={({ pressed }) => [pressed && styles.pressed]}
            onPress={() => setReaderPrefs({ showTranslation: !prefs.showTranslation })}
          >
            <Row title="Show translation" sub="English · Yusuf Ali">
              <Toggle on={prefs.showTranslation} />
            </Row>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.reset, pressed && styles.pressed]}
            onPress={resetTextPrefs}
          >
            <Text style={styles.resetText}>Reset text settings</Text>
          </Pressable>
        </View>
      )}

      {pane === 'audio' && (
        <View style={styles.pane}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [pressed && styles.pressed]}
            onPress={() => {
              onClose();
              navigation.navigate('Reciters');
            }}
          >
            <Row
              title="Reciter"
              sub={`${getReciterName(reciter)} · ${saved.length} ${saved.length === 1 ? 'sura' : 'suras'} saved`}
            >
              <Icon name="chevron_right" size={19} color={v3.ink4} />
            </Row>
          </Pressable>

          <Text style={styles.eyebrow}>Repeat</Text>
          <PillGroup
            label="Repeat"
            value={repeat.mode}
            onPick={(v) => setRepeat({ mode: v as RepeatMode })}
            options={REPEATS}
          />

          {repeat.mode !== 'off' && repeat.mode !== 'sura' && (
            <View style={styles.row}>
              <Text style={[styles.rowTitle, { flex: 1 }]}>Times</Text>
              <View style={styles.counter}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Fewer repeats"
                  hitSlop={8}
                  disabled={repeat.times <= 2}
                  onPress={() => setRepeat({ times: Math.max(2, repeat.times - 1) })}
                >
                  <Icon
                    name="remove_circle_outline"
                    size={22}
                    color={repeat.times <= 2 ? colors.textDisabled : colors.textMuted}
                  />
                </Pressable>
                <Text style={styles.counterValue} maxFontSizeMultiplier={CLAMP}>
                  {repeat.times}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="More repeats"
                  hitSlop={8}
                  disabled={repeat.times >= 20}
                  onPress={() => setRepeat({ times: Math.min(20, repeat.times + 1) })}
                >
                  <Icon
                    name="add_circle_outline"
                    size={22}
                    color={repeat.times >= 20 ? colors.textDisabled : colors.accent}
                  />
                </Pressable>
              </View>
            </View>
          )}

          {repeat.mode === 'range' && (
            <Text style={styles.note}>
              {`Looping aya ${repeat.from} to ${repeat.to}. Set the range from a verse's … menu, or in the player.`}
            </Text>
          )}

          <Text style={styles.eyebrow}>Speed</Text>
          <PillGroup
            label="Speed"
            value={speed}
            onPick={setSpeed}
            options={SPEEDS.map((s) => ({ key: s, label: `${s}×` }))}
          />

          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: autoContinue }}
            style={({ pressed }) => [pressed && styles.pressed]}
            onPress={() => setAutoContinue(!autoContinue)}
          >
            <Row title="Continue to the next sura" sub="Keeps playing after the last ayah">
              <Toggle on={autoContinue} />
            </Row>
          </Pressable>

          <View style={styles.goalCard}>
            <View style={styles.goalHead}>
              <Icon name="bedtime" size={20} color={colors.textMuted} />
              <Text style={[styles.rowTitle, { flex: 1 }]}>Sleep timer</Text>
              <Text style={styles.goalValue} maxFontSizeMultiplier={CLAMP}>
                {sleepMinutes === 0 ? 'Off' : `${sleepMinutes} min`}
              </Text>
            </View>
            <PillGroup
              label="Sleep timer"
              value={sleepMinutes}
              onPick={setSleepMinutes}
              options={SLEEP.map((m) => ({ key: m, label: m === 0 ? 'Off' : `${m}m` }))}
            />
          </View>

          <View style={styles.goldNote}>
            <Icon name="download_for_offline" size={20} color={colors.gold} />
            <Text style={styles.goldNoteText}>
              {saved.length > 0
                ? `Pressing play saves the sura for offline listening — ${savedMb.toFixed(0)} MB so far. Manage what is stored under More › Downloads.`
                : 'Pressing play saves the sura for offline listening. Manage what is stored under More › Downloads.'}
            </Text>
          </View>
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14 },
  title: { ...serifHeading(SIZE.display - 4), color: colors.textPrimary, flex: 1 },

  segmented: {
    flexDirection: 'row', gap: 5, backgroundColor: colors.bgCardMuted,
    padding: 4, borderRadius: 999, marginHorizontal: 20,
  },
  segment: { flex: 1, minHeight: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  segmentOn: { backgroundColor: colors.mint },
  segmentText: { fontFamily: fonts.bold, fontSize: SIZE.body, color: colors.textMuted },
  segmentTextOn: { fontFamily: fonts.extrabold, color: colors.onMintTextAlt },

  pane: { paddingHorizontal: 20, paddingTop: 18, gap: 11 },
  eyebrow: { ...eyebrow(colors.textMuted), marginTop: 4 },

  themeRow: { flexDirection: 'row', gap: 10 },
  themeCard: { flex: 1, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center' },
  themeSample: { ...arabicText(22), textAlign: 'center' },
  themeLabel: { fontFamily: fonts.bold, fontSize: SIZE.meta, marginTop: 8 },

  modeRow: { flexDirection: 'row', gap: 10 },
  modeCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: v3.surfaceCard, borderWidth: 1, borderColor: colors.outlineBorder,
    borderRadius: 18, padding: 14,
  },
  modeCardOn: { borderWidth: 2, borderColor: colors.accent },
  modeLabel: { fontFamily: fonts.bold, fontSize: SIZE.body, color: colors.textPrimary },
  modeSub: { fontFamily: fonts.regular, fontSize: SIZE.caption, color: colors.textMuted, marginTop: 1 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: v3.surfaceCard, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 16,
  },
  rowTitle: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.textPrimary },
  rowSub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: colors.textMuted, marginTop: 2 },

  switchTrack: { width: 44, height: 26, borderRadius: 999, backgroundColor: colors.outlineBorder, padding: 3 },
  switchTrackOn: { backgroundColor: colors.accent },
  switchKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.textDisabled },
  switchKnobOn: { backgroundColor: colors.textPrimary, alignSelf: 'flex-end' },

  pillRow: { flexDirection: 'row', gap: 7 },
  pill: {
    flex: 1, minHeight: 38, borderRadius: 999, backgroundColor: colors.bgCardMuted,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  pillOn: { backgroundColor: colors.mint },
  pillText: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textMuted },
  pillTextOn: { fontFamily: fonts.extrabold, color: colors.onMintTextAlt },

  stepperCard: { backgroundColor: v3.surfaceCard, borderRadius: 16, padding: 16, gap: 12 },
  stepperHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  stepperValue: { ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.meta, color: colors.accent },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepperTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.outlineBorder, overflow: 'hidden' },
  stepperFill: { height: '100%', borderRadius: 2, backgroundColor: colors.accent },
  sample: { fontFamily: fonts.arabic, color: colors.textPrimary, textAlign: 'right', writingDirection: 'rtl', includeFontPadding: false },

  goalCard: { backgroundColor: v3.surfaceCard, borderRadius: 16, padding: 16, gap: 12 },
  goalHead: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  goalValue: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.goldMeta },

  counter: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  counterValue: { ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.title, color: colors.accent, minWidth: 22, textAlign: 'center' },

  note: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: bodyLeading(SIZE.meta), color: colors.textQuiet },

  goldNote: {
    flexDirection: 'row', gap: 11, alignItems: 'flex-start',
    backgroundColor: colors.amberCardBg, borderRadius: 16, padding: 15, marginTop: 4,
  },
  goldNoteText: { flex: 1, fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: bodyLeading(SIZE.meta), color: colors.amberCardText },

  reset: { paddingVertical: 12, paddingHorizontal: 2, marginBottom: 8 },
  resetText: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textFaint },
});
