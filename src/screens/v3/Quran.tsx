import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Platform, ScrollView, ListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../../components/BottomNav';
import Sheet from '../../components/Sheet';
import Icon from '../../components/Icon';
import ProgressRing from '../../components/ProgressRing';
import {
  fonts,
  serifHeading,
  arabicText,
  eyebrow,
  tabular,
  SIZE,
  CLAMP,
  uiLeading,
  pinLeading,
  bodyLeading,
} from '../../theme/type';
import { colors, v3 } from '../../theme/v3/colors';
import { getSuraNames, prefetchSura, type SuraMeta } from '../../data/db';
import { juzRows, juzOfIndex, globalAyahIndex, TOTAL_AYAT, type JuzRow } from '../../data/juz';
import {
  useQuranProgress,
  clearContinue,
  readingStreak,
  daysReadWithin,
  type ReadMark,
} from '../../data/quranProgress';
import { useQuranAudio } from '../../state/QuranAudio';

type Tab = 'read' | 'learn' | 'progress';
type ListView = 'sura' | 'juz';

const TABS: { key: Tab; label: string }[] = [
  { key: 'read', label: 'Read' },
  { key: 'learn', label: 'Learn' },
  { key: 'progress', label: 'My progress' },
];

const VIEWS: { key: ListView; label: string; sub: string }[] = [
  { key: 'sura', label: 'Sura', sub: 'All 114, in mushaf order' },
  { key: 'juz', label: 'Juz', sub: 'The 30 parts, for a reading plan' },
];

const LESSONS = [
  { icon: 'record_voice_over', title: 'Makhraj of the throat letters', body: 'Where each of ʿayn, ḥāʾ, ghayn and khāʾ is formed, with audio comparison.', meta: '6 min' },
  { icon: 'timer', title: 'Rules of madd', body: 'How long to hold each elongation, and the three cases where it changes.', meta: '9 min' },
  { icon: 'menu_book', title: 'Memorise Al-Wāqiʿah', body: 'Split into eleven sittings, with a review schedule after each.', meta: '11 sittings' },
  { icon: 'school', title: 'Reading without vowel marks', body: 'A gradual removal of ḥarakāt across familiar short suras.', meta: '4 weeks' },
];

const ROW_MIN_HEIGHT = 74;

function ago(at: number, now = Date.now()): string {
  const days = Math.floor((now - at) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const SuraRow = React.memo(function SuraRow({
  item,
  onPress,
  sounding,
  soundingVerse,
}: {
  item: SuraMeta;
  onPress: (suraId: number) => void;
  sounding: boolean;
  soundingVerse: number | null;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.transliterate}. ${item.english}. ${item.verseCount} verses${sounding ? '. Playing' : ''}`}
      style={({ pressed }) => [styles.row, sounding && styles.rowOn, pressed && styles.pressed]}
      onPress={() => onPress(item.suraId)}
    >
      <Text style={[styles.rowNum, sounding && styles.rowNumOn]} maxFontSizeMultiplier={CLAMP}>
        {item.suraId}
      </Text>
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, sounding && styles.rowTitleOn]} numberOfLines={1}>
          {item.transliterate}
        </Text>
        {sounding ? (
          <View style={styles.rowPlaying}>
            <Icon name="graphic_eq" size={14} color={colors.onMintTextAlt} />
            <Text style={styles.rowMetaOn} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
              {soundingVerse == null
                ? `Playing · Bismillah`
                : `Playing · Aya ${soundingVerse} of ${item.verseCount}`}
            </Text>
          </View>
        ) : (
          <Text style={styles.rowMeta} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
            {`${item.english} · ${item.verseCount} verses`}
          </Text>
        )}
      </View>
      <Text style={[styles.rowArabic, sounding && styles.rowArabicOn]} numberOfLines={2} maxFontSizeMultiplier={1}>
        {item.arabic}
      </Text>
    </Pressable>
  );
});

const JuzListRow = React.memo(function JuzListRow({
  item,
  onPress,
  reached,
}: {
  item: JuzRow;
  onPress: (suraId: number, verseId: number) => void;
  reached: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Juz ${item.juz}. ${item.range}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={() => onPress(item.suraId, item.verseId)}
    >
      <Text style={[styles.rowNum, reached && styles.rowNumRead]} maxFontSizeMultiplier={CLAMP}>
        {item.juz}
      </Text>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>{`Juz ${item.juz}`}</Text>
        <Text style={styles.rowMeta} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
          {item.range}
        </Text>
      </View>
      <Text style={styles.rowCount} maxFontSizeMultiplier={CLAMP}>{`${item.ayahCount} ayat`}</Text>
    </Pressable>
  );
});

export default function Quran({ navigation }: any) {
  const [tab, setTab] = useState<Tab>('read');
  const [view, setView] = useState<ListView>('sura');
  const [viewOpen, setViewOpen] = useState(false);

  const SURAS = getSuraNames();
  const JUZ = useMemo(() => juzRows(), []);

  const { now } = useQuranAudio();
  const soundingSuraId = now?.suraId ?? null;
  const soundingVerse = now?.verseId ?? null;

  const progress = useQuranProgress();
  const last = progress.recent[0] ?? null;
  const lastName = last ? SURAS.find((s) => s.suraId === last.suraId)?.transliterate ?? null : null;

  const fraction = Math.min(1, progress.furthest / TOTAL_AYAT);
  const pct = Math.round(fraction * 100);
  const juz = progress.furthest > 0 ? juzOfIndex(progress.furthest) : 0;
  const streak = readingStreak(progress.days);
  const month = daysReadWithin(30, progress.days);

  const openSura = useCallback(
    (suraId: number, verseId?: number) => {
      prefetchSura(suraId);
      navigation.navigate('Sura', verseId && verseId > 1 ? { n: suraId, v: verseId } : { n: suraId });
    },
    [navigation]
  );

  const openSuraRow = useCallback((suraId: number) => openSura(suraId), [openSura]);

  const renderSura = useCallback(
    ({ item }: ListRenderItemInfo<SuraMeta>) => (
      <SuraRow
        item={item}
        onPress={openSuraRow}
        sounding={item.suraId === soundingSuraId}
        soundingVerse={soundingVerse}
      />
    ),
    [openSuraRow, soundingSuraId, soundingVerse]
  );

  const renderJuz = useCallback(
    ({ item }: ListRenderItemInfo<JuzRow>) => (
      <JuzListRow item={item} onPress={openSura} reached={globalAyahIndex(item.suraId, item.verseId) <= progress.furthest} />
    ),
    [openSura, progress.furthest]
  );

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <View style={styles.headRow}>
          <View style={styles.headText}>
            <Text style={styles.title}>Quran</Text>
            <Text style={styles.headMeta} numberOfLines={1}>
              {last && lastName ? `Last read · ${lastName}, verse ${last.verseId}` : 'Open any sura to begin'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bookmarks"
            style={({ pressed }) => [styles.headBtn, pressed && styles.pressed]}
            onPress={() => navigation.navigate('QuranBookmarks')}
          >
            <Icon name="bookmark_border" size={21} color={colors.textMuted} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search the Quran"
            style={({ pressed }) => [styles.headBtn, pressed && styles.pressed]}
            onPress={() => navigation.navigate('QuranSearch')}
          >
            <Icon name="search" size={21} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.segmented}>
          {TABS.map((t) => {
            const on = tab === t.key;
            return (
              <Pressable
                key={t.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                style={({ pressed }) => [styles.segment, on && styles.segmentOn, pressed && styles.pressed]}
                onPress={() => setTab(t.key)}
              >
                <Text style={[styles.segmentText, on && styles.segmentTextOn]} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab !== 'read' ? null : (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                progress.furthest > 0
                  ? `Khatam progress, ${pct} percent, juz ${juz}${streak ? `, ${streak} days in a row` : ''}`
                  : 'Khatam progress, not started'
              }
              style={({ pressed }) => [styles.khatam, pressed && styles.pressed]}
              onPress={() => setTab('progress')}
            >
              <ProgressRing size={44} strokeWidth={4} progress={fraction} color={colors.gold} trackColor="rgba(225,179,71,0.18)">
                <Text style={styles.khatamPct} maxFontSizeMultiplier={CLAMP}>{`${pct}%`}</Text>
              </ProgressRing>
              <View style={styles.khatamText}>
                <Text style={styles.khatamEyebrow} numberOfLines={1}>
                  Khatam 1
                </Text>
                <Text style={styles.khatamTitle} numberOfLines={1}>
                  {progress.furthest === 0
                    ? 'Not started yet'
                    : [`Juz ${juz}`, streak > 0 ? `${streak} ${streak === 1 ? 'day' : 'days'} in a row` : null]
                        .filter(Boolean)
                        .join(' · ')}
                </Text>
              </View>
              <Icon name="chevron_right" size={19} color={colors.goldMeta} />
            </Pressable>

            <View style={styles.continueHead}>
              <Text style={styles.eyebrow}>Continue</Text>
              {progress.recent.length > 0 && (
                <Pressable accessibilityRole="button" hitSlop={10} onPress={clearContinue}>
                  <Text style={styles.clear} maxFontSizeMultiplier={CLAMP}>
                    Clear
                  </Text>
                </Pressable>
              )}
            </View>

            {progress.recent.length === 0 ? (
              <Text style={styles.continueEmpty}>
                Where you stop reading is remembered here, so the next sitting starts where the last one ended.
              </Text>
            ) : (
              <View style={styles.continueRail}>
                {progress.recent.slice(0, 3).map((m: ReadMark) => {
                  const meta = SURAS.find((s) => s.suraId === m.suraId);
                  return (
                    <Pressable
                      key={m.suraId}
                      accessibilityRole="button"
                      accessibilityLabel={`Continue ${meta?.transliterate ?? `sura ${m.suraId}`} at aya ${m.verseId}`}
                      style={({ pressed }) => [styles.continueCard, pressed && styles.pressed]}
                      onPress={() => openSura(m.suraId, m.verseId)}
                    >
                      <Text style={styles.continueArabic} numberOfLines={1} maxFontSizeMultiplier={1}>
                        {meta?.arabic ?? ''}
                      </Text>
                      <Text style={styles.continueName} numberOfLines={2}>
                        {meta?.transliterate ?? `Sura ${m.suraId}`}
                      </Text>
                      <Text style={styles.continueMeta} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                        {`Aya ${m.verseId} · ${ago(m.at)}`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <View style={styles.listHead}>
              <Text style={styles.sectionTitle} numberOfLines={1}>
                {view === 'sura' ? 'Sura list' : 'Juz list'}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Change the list, currently by ${view === 'sura' ? 'sura' : 'juz'}`}
                style={({ pressed }) => [styles.viewChip, pressed && styles.pressed]}
                onPress={() => setViewOpen(true)}
              >
                <Text style={styles.viewChipText} maxFontSizeMultiplier={CLAMP}>
                  {`View: ${view === 'sura' ? 'Sura' : 'Juz'}`}
                </Text>
                <Icon name="expand_more" size={17} color={v3.ink4} />
              </Pressable>
            </View>
          </>
        )}
      </View>
    ),
    [tab, view, last, lastName, progress.recent, progress.furthest, pct, juz, streak, fraction, SURAS, navigation, openSura]
  );

  const footer = useMemo(() => {
    if (tab === 'learn') {
      return (
        <View style={styles.panel}>
          <Text style={styles.eyebrow}>Suggested lessons</Text>
          {LESSONS.map((l) => (
            <View key={l.title} style={styles.lesson}>
              <View style={styles.lessonIcon}>
                <Icon name={l.icon} size={19} color={colors.accent} />
              </View>
              <View style={styles.lessonBody}>
                <Text style={styles.lessonTitle}>{l.title}</Text>
                <Text style={styles.lessonText}>{l.body}</Text>
                <View style={styles.chip}>
                  <Icon name="schedule" size={13} color={colors.accent} />
                  <Text style={styles.chipText} maxFontSizeMultiplier={CLAMP}>
                    {l.meta}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      );
    }

    if (tab === 'progress') {
      return (
        <View style={styles.panel}>
          <Text style={styles.eyebrow}>Reading progress</Text>
          <View style={styles.khatamCard}>
            <ProgressRing size={92} strokeWidth={8} progress={fraction} color={colors.gold} trackColor="rgba(225,179,71,0.18)">
              <Text style={styles.khatamBigPct}>{`${pct}%`}</Text>
            </ProgressRing>
            <View style={{ flex: 1 }}>
              <Text style={styles.khatamCardTitle}>{progress.furthest > 0 ? 'First khatam' : 'No reading yet'}</Text>
              <Text style={styles.khatamCardBody}>
                {progress.furthest > 0
                  ? `Juz ${juz} of 30 · ${progress.furthest.toLocaleString()} of ${TOTAL_AYAT.toLocaleString()} ayat behind you.`
                  : 'Read any sura and this fills in on its own — nothing to set up.'}
              </Text>
            </View>
          </View>
          <View style={styles.statGrid}>
            {[
              ['menu_book', progress.furthest > 0 ? `Juz ${juz}` : '—', 'Current position'],
              ['auto_stories', String(progress.recent.length), 'Suras in progress'],
              ['local_fire_department', String(streak), 'Days in a row'],
              ['calendar_month', String(month), 'Days read this month'],
            ].map(([icon, value, label]) => (
              <View key={label} style={styles.statTile}>
                <Icon name={icon} size={16} color={colors.gold} />
                <Text style={styles.statValue} numberOfLines={1}>
                  {value}
                </Text>
                <Text style={styles.statLabel} numberOfLines={2} maxFontSizeMultiplier={CLAMP}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    return null;
  }, [tab, fraction, pct, juz, streak, month, progress.furthest, progress.recent.length]);

  const suraKey = useCallback((s: SuraMeta) => String(s.suraId), []);
  const juzKey = useCallback((j: JuzRow) => String(j.juz), []);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      {tab === 'read' && view === 'juz' ? (
        <FlatList
          data={JUZ}
          renderItem={renderJuz}
          keyExtractor={juzKey}
          ListHeaderComponent={header}
          contentContainerStyle={[styles.content, soundingSuraId != null && styles.contentWithPlayer]}
          extraData={progress.furthest}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <FlatList
          data={tab === 'read' ? SURAS : EMPTY}
          renderItem={renderSura}
          keyExtractor={suraKey}
          ListHeaderComponent={header}
          ListFooterComponent={footer}
          contentContainerStyle={[styles.content, soundingSuraId != null && styles.contentWithPlayer]}
          extraData={`${soundingSuraId}-${soundingVerse}`}
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={7}
          removeClippedSubviews={Platform.OS === 'android'}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <Sheet visible={viewOpen} onClose={() => setViewOpen(false)} bg={colors.bgCardAlt} scroll={false}>
        <View style={styles.sheetHead}>
          <Text style={styles.sheetTitle}>Show the Quran as</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} onPress={() => setViewOpen(false)}>
            <Icon name="close" size={23} color={colors.textMuted} />
          </Pressable>
        </View>
        <View style={styles.sheetOptions}>
          {VIEWS.map((o) => {
            const on = view === o.key;
            return (
              <Pressable
                key={o.key}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                style={({ pressed }) => [styles.option, on && styles.optionOn, pressed && styles.pressed]}
                onPress={() => {
                  setView(o.key);
                  setViewOpen(false);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, on && styles.optionLabelOn]}>{o.label}</Text>
                  <Text style={styles.optionSub}>{o.sub}</Text>
                </View>
                {on && <Icon name="check_circle" size={22} color={colors.accent} />}
              </Pressable>
            );
          })}
        </View>
      </Sheet>

      <BottomNav active="Quran" />
    </SafeAreaView>
  );
}

const EMPTY: SuraMeta[] = [];

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  contentWithPlayer: { paddingBottom: 104 },
  pressed: { opacity: 0.85 },

  header: { gap: 16, paddingBottom: 12 },
  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  headText: { flex: 1 },
  title: { ...serifHeading(SIZE.display), color: colors.textPrimary },
  headMeta: {
    fontFamily: fonts.regular,
    fontSize: SIZE.meta,
    lineHeight: pinLeading(16, SIZE.meta),
    color: colors.textMuted,
    marginTop: 5,
  },
  headBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: v3.surfaceCard,
    alignItems: 'center', justifyContent: 'center',
  },

  segmented: { flexDirection: 'row', gap: 5, backgroundColor: colors.bgCardMuted, padding: 4, borderRadius: 999 },
  segment: { flex: 1, minHeight: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  segmentOn: { backgroundColor: colors.mint },
  segmentText: { fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textMuted },
  segmentTextOn: { fontFamily: fonts.extrabold, color: colors.onMintTextAlt },

  khatam: {
    minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.amberCardBg, borderRadius: 20, paddingVertical: 15, paddingHorizontal: 16,
  },
  khatamPct: { ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.caption, color: colors.gold },
  khatamText: { flex: 1 },
  khatamEyebrow: eyebrow(colors.goldMeta),
  khatamTitle: {
    fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: pinLeading(20, SIZE.title),
    color: colors.amberCardText, marginTop: 3,
  },

  continueHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: -6 },
  eyebrow: eyebrow(colors.textMuted),
  clear: { fontFamily: fonts.bold, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: colors.accent },
  continueEmpty: {
    fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: bodyLeading(SIZE.meta),
    color: colors.textQuiet, marginTop: -4,
  },
  continueRail: { flexDirection: 'row', gap: 10 },
  continueCard: {
    flexGrow: 1, flexBasis: 0, maxWidth: '33.5%', minWidth: 0,
    backgroundColor: v3.surfaceCard, borderTopWidth: 1, borderTopColor: v3.cardTopHighlight,
    borderRadius: 18, paddingVertical: 13, paddingHorizontal: 13,
  },
  continueArabic: { ...arabicText(18), color: colors.mint, textAlign: 'right' },
  continueName: { fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textPrimary, marginTop: 6 },
  continueMeta: { fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.textMuted, marginTop: 2 },

  listHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  sectionTitle: { ...serifHeading(SIZE.heading), color: colors.textPrimary, flex: 1 },
  viewChip: {
    minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingLeft: 13, paddingRight: 8, borderRadius: 999,
    borderWidth: 1, borderColor: colors.divider, flexShrink: 0,
  },
  viewChipText: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textSecondary, flexShrink: 0 },

  row: {
    minHeight: ROW_MIN_HEIGHT,
    flexDirection: 'row', alignItems: 'center', gap: 13,
    backgroundColor: v3.surfaceCard, borderTopWidth: 1, borderTopColor: v3.cardTopHighlight,
    borderRadius: 16, paddingVertical: 12, paddingHorizontal: 15,
    marginBottom: 8,
  },
  rowOn: {
    backgroundColor: colors.accent, borderTopColor: 'transparent',
    shadowColor: '#0E9B6C', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 22, elevation: 6,
  },
  rowNum: { ...tabular, width: 26, fontFamily: fonts.extrabold, fontSize: SIZE.meta, color: colors.textDisabled },
  rowNumOn: { color: colors.onMintTextAlt, opacity: 0.7 },
  rowNumRead: { color: colors.gold },
  rowBody: { flex: 1, flexShrink: 1, minWidth: 0 },
  rowTitle: { ...serifHeading(SIZE.title), color: colors.textPrimary },
  rowTitleOn: { fontFamily: fonts.serifBold, color: colors.onMintTextAlt },
  rowMeta: { fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.textMuted, marginTop: 1 },
  rowPlaying: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  rowMetaOn: { flex: 1, fontFamily: fonts.bold, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.onMintTextAlt },
  rowArabic: { ...arabicText(22), flexShrink: 0, maxWidth: '46%', color: colors.accent, textAlign: 'right' },
  rowArabicOn: { color: colors.onMintTextAlt },
  rowCount: { ...tabular, flexShrink: 0, fontFamily: fonts.semibold, fontSize: SIZE.caption, color: v3.ink4 },

  panel: { gap: 14, paddingTop: 4 },
  lesson: {
    flexDirection: 'row', gap: 13, alignItems: 'flex-start',
    backgroundColor: v3.surfaceCard, borderTopWidth: 1, borderTopColor: v3.cardTopHighlight,
    borderRadius: 20, padding: 16,
  },
  lessonIcon: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: colors.iconChipBg,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  lessonBody: { flex: 1, gap: 6 },
  lessonTitle: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.textPrimary },
  lessonText: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: bodyLeading(SIZE.meta), color: v3.ink1 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
    backgroundColor: colors.bgCardMuted, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10, marginTop: 2,
  },
  chipText: { fontFamily: fonts.bold, fontSize: SIZE.caption, color: colors.accent },

  khatamCard: {
    flexDirection: 'row', gap: 16, alignItems: 'center',
    backgroundColor: colors.amberCardBg, borderRadius: 20, padding: 18,
  },
  khatamBigPct: { ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.heading, color: colors.gold },
  khatamCardTitle: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.amberCardText },
  khatamCardBody: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: bodyLeading(SIZE.meta), color: colors.goldMeta, marginTop: 5 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statTile: {
    width: '48%', flexGrow: 1,
    backgroundColor: v3.surfaceCard, borderTopWidth: 1, borderTopColor: v3.cardTopHighlight,
    borderRadius: 16, paddingVertical: 16, paddingHorizontal: 10, alignItems: 'center', gap: 4,
  },
  statValue: { ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.title, color: colors.textPrimary },
  statLabel: { fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.textFaint, textAlign: 'center' },

  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14 },
  sheetTitle: { ...serifHeading(SIZE.heading), color: colors.textPrimary, flex: 1 },
  sheetOptions: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: v3.surfaceCard, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 1, borderColor: 'transparent',
  },
  optionOn: { borderColor: colors.accent, backgroundColor: v3.accentTint },
  optionLabel: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.textPrimary },
  optionLabelOn: { color: colors.accent },
  optionSub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: colors.textMuted, marginTop: 2 },
});
