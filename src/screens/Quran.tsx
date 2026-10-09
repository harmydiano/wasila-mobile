import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Platform, ListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import Icon from '../components/Icon';
import IconChip from '../components/IconChip';
import ProgressRing from '../components/ProgressRing';
import { colors } from '../theme/colors';
import { fonts, ARABIC_LINE_HEIGHT } from '../theme/type';
import { getSuraNames, prefetchSura, type SuraMeta } from '../data/db';

const LESSONS = [
  { icon: 'record_voice_over', title: 'Makhraj of the throat letters', body: 'Where each of ʿayn, ḥāʾ, ghayn and khāʾ is formed, with audio comparison.', meta: '6 min' },
  { icon: 'timer', title: 'Rules of madd', body: 'How long to hold each elongation, and the three cases where it changes.', meta: '9 min' },
  { icon: 'menu_book', title: 'Memorise Al-Wāqiʿah', body: 'Split into eleven sittings, with a review schedule after each.', meta: '11 sittings' },
  { icon: 'school', title: 'Reading without vowel marks', body: 'A gradual removal of ḥarakāt across familiar short suras.', meta: '4 weeks' },
];

const ARABIC_SIZE = 22;
const ROW_MIN_HEIGHT = 68;

const SuraRow = React.memo(function SuraRow({
  item,
  onPress,
}: {
  item: SuraMeta;
  onPress: (suraId: number) => void;
}) {
  return (
    <Pressable style={styles.suraRow} onPress={() => onPress(item.suraId)}>
      <Text style={styles.suraNum}>{item.suraId}</Text>
      <View style={styles.suraTextCol}>
        <Text style={styles.suraName} numberOfLines={1}>
          {item.transliterate}
        </Text>
        <Text style={styles.suraMeta} numberOfLines={1}>
          {item.english} · {item.verseCount} verses
        </Text>
      </View>
      <Text style={styles.suraArabic} numberOfLines={2}>
        {item.arabic}
      </Text>
    </Pressable>
  );
});

export default function QuranScreen({ navigation }: any) {
  const [tab, setTab] = useState<'read' | 'learn' | 'progress'>('read');
  const SURAS = getSuraNames();

  const openSura = useCallback(
    (suraId: number) => {
      prefetchSura(suraId);
      navigation.navigate('Sura', { n: suraId });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<SuraMeta>) => <SuraRow item={item} onPress={openSura} />,
    [openSura]
  );

  const keyExtractor = useCallback((s: SuraMeta) => String(s.suraId), []);

  const header = useMemo(
    () => (
      <View style={{ gap: 18, paddingBottom: 18 }}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Quran</Text>
            <Text style={styles.meta}>Last read · Al-Kahf, verse 10</Text>
          </View>
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => navigation.navigate('Search')} style={styles.iconBtn}>
            <Icon name="search" size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.tabTrack}>
          {(['read', 'learn', 'progress'] as const).map((k) => (
            <Pressable key={k} style={[styles.tabPill, tab === k && styles.tabPillOn]} onPress={() => setTab(k)}>
              <Text style={[styles.tabLabel, tab === k && styles.tabLabelOn]}>
                {k === 'read' ? 'Read' : k === 'learn' ? 'Learn' : 'My progress'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    ),
    [tab, navigation]
  );

  const footer = useMemo(() => {
    if (tab === 'learn') {
      return (
        <View style={{ gap: 12 }}>
          {LESSONS.map((l) => (
            <View key={l.title} style={styles.lessonCard}>
              <IconChip icon={l.icon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.lessonTitle}>{l.title}</Text>
                <Text style={styles.lessonBody}>{l.body}</Text>
              </View>
              <View style={styles.lessonPill}>
                <Text style={styles.lessonPillText}>{l.meta}</Text>
              </View>
            </View>
          ))}
        </View>
      );
    }
    if (tab === 'progress') {
      return (
        <View style={{ gap: 14 }}>
          <View style={styles.khatamCard}>
            <ProgressRing size={98} strokeWidth={9} progress={0.32}>
              <Text style={styles.khatamPct}>32%</Text>
            </ProgressRing>
            <View style={{ flex: 1 }}>
              <Text style={styles.khatamTitle}>Second khatam</Text>
              <Text style={styles.khatamBody}>Juz 10 of 30 · started 4 Muharram. At your current pace you finish in 71 days.</Text>
            </View>
          </View>
          <View style={styles.statGrid}>
            {[
              ['1', 'Khatams completed'],
              ['Juz 10', 'Current position'],
              ['18 min', 'Daily average'],
              ['41', 'Days read in a row'],
            ].map(([v, l]) => (
              <View key={l} style={styles.statTile}>
                <Text style={styles.statValue}>{v}</Text>
                <Text style={styles.statLabel}>{l}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }
    return null;
  }, [tab]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <FlatList
        data={tab === 'read' ? SURAS : EMPTY}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        contentContainerStyle={styles.content}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        keyboardShouldPersistTaps="handled"
      />
      <BottomNav active="Quran" />
    </SafeAreaView>
  );
}

const EMPTY: SuraMeta[] = [];

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { fontFamily: fonts.extrabold, fontSize: 26, color: colors.textPrimary },
  meta: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  tabTrack: { flexDirection: 'row', backgroundColor: colors.bgInput, padding: 4, borderRadius: 999, gap: 4 },
  tabPill: { flex: 1, paddingVertical: 9, borderRadius: 999, alignItems: 'center' },
  tabPillOn: { backgroundColor: colors.mint },
  tabLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted },
  tabLabelOn: { color: colors.onMintTextAlt, fontFamily: fonts.bold },
  suraRow: {
    minHeight: ROW_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  suraNum: { width: 22, fontFamily: fonts.semibold, fontSize: 12, color: colors.textFaint },
  suraTextCol: { flex: 1, flexShrink: 1, minWidth: 0 },
  suraName: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.textPrimary },
  suraMeta: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
  suraArabic: {
    flexShrink: 0,
    maxWidth: '52%',
    fontFamily: fonts.arabic,
    fontSize: ARABIC_SIZE,
    lineHeight: ARABIC_SIZE * ARABIC_LINE_HEIGHT,
    color: colors.textSecondary,
    textAlign: 'right',
    includeFontPadding: false,
  },
  lessonCard: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 16, padding: 14 },
  lessonTitle: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.textPrimary },
  lessonBody: { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 16, color: colors.textMuted, marginTop: 2 },
  lessonPill: { backgroundColor: colors.iconChipBg, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 },
  lessonPillText: { fontFamily: fonts.semibold, fontSize: 11, color: colors.accent },
  khatamCard: { flexDirection: 'row', gap: 16, alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 18, padding: 18 },
  khatamPct: { fontFamily: fonts.extrabold, fontSize: 16, color: colors.accent },
  khatamTitle: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.textPrimary },
  khatamBody: { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 16, color: colors.textMuted, marginTop: 4 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statTile: { width: '48%', backgroundColor: colors.bgCard, borderRadius: 16, paddingVertical: 16, alignItems: 'center', gap: 4 },
  statValue: { fontFamily: fonts.extrabold, fontSize: 17, color: colors.textPrimary },
  statLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textFaint },
});
