import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Platform, ListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNav from '../../components/BottomNav';
import Icon from '../../components/Icon';
import ProgressRing from '../../components/ProgressRing';
import { colors } from '../../theme/v2/colors';
import { fonts, ARABIC_LINE_HEIGHT } from '../../theme/type';
import { getSuraNames, prefetchSura, type SuraMeta } from '../../data/db';
import { useQuranAudio } from '../../state/QuranAudio';

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
  sounding,
}: {
  item: SuraMeta;
  onPress: (suraId: number) => void;
  sounding: boolean;
}) {
  return (
    <Pressable style={[styles.suraRow, sounding && styles.suraRowOn]} onPress={() => onPress(item.suraId)}>
      <Text style={[styles.suraNum, sounding && styles.suraNumOn]}>{item.suraId}</Text>
      <View style={styles.suraTextCol}>
        <Text style={[styles.suraName, sounding && styles.suraNameOn]} numberOfLines={1}>
          {item.transliterate}
        </Text>
        <Text style={[styles.suraMeta, sounding && styles.suraMetaOn]} numberOfLines={1}>
          {sounding ? 'Playing…' : `${item.english} · ${item.verseCount} verses`}
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

  const { now } = useQuranAudio();
  const soundingSuraId = now?.suraId ?? null;

  const openSura = useCallback(
    (suraId: number) => {
      prefetchSura(suraId);
      navigation.navigate('Sura', { n: suraId });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<SuraMeta>) => (
      <SuraRow item={item} onPress={openSura} sounding={item.suraId === soundingSuraId} />
    ),
    [openSura, soundingSuraId]
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
        <View style={{ gap: 14 }}>
          <Text style={styles.sectionEyebrow}>Suggested lessons</Text>
          <View style={{ gap: 12 }}>
            {LESSONS.map((l) => (
              <View key={l.title} style={styles.lessonCard}>
                <LinearGradient
                  colors={[colors.mint, colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.lessonIconWrap}
                >
                  <Icon name={l.icon} size={19} color={colors.onMintTextAlt} />
                </LinearGradient>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={styles.lessonTitle}>{l.title}</Text>
                  <Text style={styles.lessonBody}>{l.body}</Text>
                  <View style={styles.lessonMetaChip}>
                    <Icon name="schedule" size={12} color={colors.accent} />
                    <Text style={styles.lessonMetaText}>{l.meta}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      );
    }
    if (tab === 'progress') {
      return (
        <View style={{ gap: 16 }}>
          <Text style={styles.sectionEyebrow}>Reading progress</Text>
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
              ['emoji_events', '1', 'Khatams completed'],
              ['menu_book', 'Juz 10', 'Current position'],
              ['schedule', '18 min', 'Daily average'],
              ['local_fire_department', '41', 'Days read in a row'],
            ].map(([icon, v, l]) => (
              <View key={l} style={styles.statTile}>
                <Icon name={icon} size={16} color={colors.accent} />
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
        contentContainerStyle={[styles.content, soundingSuraId != null && styles.contentWithPlayer]}
        extraData={soundingSuraId}
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
  contentWithPlayer: { paddingBottom: 92 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { fontFamily: fonts.extrabold, fontSize: 26, color: colors.textPrimary },
  meta: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  tabTrack: { flexDirection: 'row', backgroundColor: colors.bgInput, padding: 4, borderRadius: 999, gap: 4 },
  tabPill: { flex: 1, paddingVertical: 9, borderRadius: 999, alignItems: 'center' },
  tabPillOn: { backgroundColor: colors.mint },
  tabLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted },
  tabLabelOn: { color: colors.onMintTextAlt, fontFamily: fonts.bold },
  sectionEyebrow: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textMuted },
  suraRow: {
    minHeight: ROW_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  suraRowOn: { backgroundColor: 'rgba(123,224,190,0.10)', borderRadius: 12, paddingHorizontal: 10, marginHorizontal: -10 },
  suraNumOn: { backgroundColor: colors.accent, color: colors.onMintTextAlt },
  suraNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.iconChipBg,
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 28,
    textAlign: 'center',
    color: colors.accent,
    overflow: 'hidden',
  },
  suraTextCol: { flex: 1, flexShrink: 1, minWidth: 0 },
  suraName: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.textPrimary },
  suraNameOn: { color: colors.accent },
  suraMeta: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
  suraMetaOn: { fontFamily: fonts.semibold, color: colors.accent },
  suraArabic: {
    flexShrink: 0,
    maxWidth: '52%',
    fontFamily: fonts.arabic,
    fontSize: ARABIC_SIZE,
    lineHeight: ARABIC_SIZE * ARABIC_LINE_HEIGHT,
    color: colors.accent,
    textAlign: 'right',
    includeFontPadding: false,
  },
  lessonCard: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', backgroundColor: colors.bgCard, borderRadius: 20, padding: 18 },
  lessonIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  lessonTitle: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.textPrimary },
  lessonBody: { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 16, color: colors.textMuted },
  lessonMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: colors.bgCardAlt,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 2,
  },
  lessonMetaText: { fontFamily: fonts.semibold, fontSize: 11, color: colors.accent },
  khatamCard: { flexDirection: 'row', gap: 16, alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 20, padding: 18 },
  khatamPct: { fontFamily: fonts.extrabold, fontSize: 16, color: colors.accent },
  khatamTitle: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.textPrimary },
  khatamBody: { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 16, color: colors.textMuted, marginTop: 4 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statTile: { width: '48%', backgroundColor: colors.bgCard, borderRadius: 16, paddingVertical: 16, alignItems: 'center', gap: 4 },
  statValue: { fontFamily: fonts.extrabold, fontSize: 17, color: colors.textPrimary },
  statLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textFaint },
});
