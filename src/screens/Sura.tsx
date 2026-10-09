import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Platform, ActivityIndicator, ListRenderItemInfo } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { colors } from '../theme/colors';
import { fonts, ARABIC_LINE_HEIGHT } from '../theme/type';
import { getSuraMeta, getSuraVerses, getCachedSuraVerses, type Ayah } from '../data/db';
import { NO_HEADER_BISMILLAH } from '../data/audio';
import { getReciterName } from '../data/reciters';
import { useAppState } from '../state/AppState';
import { useQuranAudio } from '../state/QuranAudio';

const BISMILLAH = 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيم';

const FSI = '⁨';
const PDI = '⁩';

const VerseCard = React.memo(function VerseCard({
  v,
  index,
  arabicSize,
  playing,
  onPlay,
}: {
  v: Ayah;
  index: number;
  arabicSize: number;
  playing: boolean;
  onPlay: (verseId: number) => void;
}) {
  return (
    <View style={[styles.verseCard, playing && styles.verseCardActive]}>
      <View style={styles.verseTop}>
        <View style={[styles.verseBadge, playing && styles.verseBadgeActive]}>
          <Text style={[styles.verseBadgeText, playing && styles.verseBadgeTextActive]}>{v.verseId}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <Pressable hitSlop={8} onPress={() => onPlay(v.verseId)}>
          <Icon name={playing ? 'pause_circle' : 'play_circle'} size={20} color={playing ? colors.accent : colors.textMuted} />
        </Pressable>
        <Icon name="bookmark_border" size={18} color={colors.textMuted} />
      </View>
      <Text style={[styles.verseArabic, { fontSize: arabicSize, lineHeight: arabicSize * ARABIC_LINE_HEIGHT }]}>{v.ar}</Text>
      <Text style={styles.verseTranslit}>{v.translit}</Text>
      <Text style={styles.verseEn}>{v.en}</Text>
    </View>
  );
});

export default function Sura({ route, navigation }: any) {
  const { n } = route.params;
  const sura = useMemo(() => getSuraMeta(n), [n]);
  const [verses, setVerses] = useState<Ayah[] | null>(() => getCachedSuraVerses(n));
  const { arabicSize, reciter } = useAppState();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Ayah>>(null);

  const { now, playing, playSura, playVerse, toggle } = useQuranAudio();
  const isThisSura = now?.suraId === n;
  const activeVerseId = isThisSura ? now!.verseId : null;

  useEffect(() => {
    const cached = getCachedSuraVerses(n);
    if (cached) {
      setVerses(cached);
      return;
    }
    let alive = true;
    setVerses(null);
    getSuraVerses(n).then((ayat) => {
      if (alive) setVerses(ayat);
    });
    return () => {
      alive = false;
    };
  }, [n]);

  useEffect(() => {
    if (!isThisSura || !playing || activeVerseId == null) return;
    listRef.current?.scrollToIndex({ index: activeVerseId - 1, animated: true, viewPosition: 0.3 });
  }, [isThisSura, playing, activeVerseId]);

  const onScrollToIndexFailed = useCallback((info: { index: number; averageItemLength: number }) => {
    listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
    setTimeout(() => {
      listRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.3 });
    }, 120);
  }, []);

  const togglePlayback = useCallback(() => {
    if (isThisSura) toggle();
    else playSura(n);
  }, [isThisSura, toggle, playSura, n]);

  const playVerseAt = useCallback(
    (verseId: number) => {
      if (isThisSura && activeVerseId === verseId && playing) {
        toggle();
        return;
      }
      playVerse(n, verseId);
    },
    [isThisSura, activeVerseId, playing, toggle, playVerse, n]
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Ayah>) => (
      <VerseCard
        v={item}
        index={index}
        arabicSize={arabicSize}
        playing={isThisSura && activeVerseId === item.verseId && playing}
        onPlay={playVerseAt}
      />
    ),
    [arabicSize, isThisSura, activeVerseId, playing, playVerseAt]
  );

  const keyExtractor = useCallback((v: Ayah) => String(v.verseId), []);

  const listHeader = useMemo(
    () =>
      NO_HEADER_BISMILLAH.has(n) ? null : (
        <Text style={styles.bismillah}>{BISMILLAH}</Text>
      ),
    [n]
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Icon name="arrow_back" size={22} color={colors.onTeal} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {sura?.transliterate ?? '…'}
          </Text>
          <Text style={styles.headerMeta} numberOfLines={1}>
            {sura ? `${FSI}${sura.arabic}${PDI} · ${sura.verseCount} verses` : ''}
          </Text>
        </View>
        <Pressable style={styles.iconBtn}>
          <Icon name="bookmark_border" size={22} color={colors.onTeal} />
        </Pressable>
      </View>

      {!verses ? (
        <View style={styles.loadingWrap}>
          {listHeader}
          <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={verses}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={listHeader}
          extraData={`${arabicSize}-${isThisSura ? activeVerseId : -1}-${playing}`}
          contentContainerStyle={styles.listContent}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          updateCellsBatchingPeriod={50}
          windowSize={9}
          removeClippedSubviews={Platform.OS === 'android'}
          onScrollToIndexFailed={onScrollToIndexFailed}
        />
      )}

      <View style={[styles.player, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <Pressable style={styles.playBtn} onPress={togglePlayback}>
          <Icon name={isThisSura && playing ? 'pause' : 'play_arrow'} size={20} color="#fff" />
        </Pressable>
        <Text style={styles.reciter} numberOfLines={1}>
          {isThisSura
            ? `${getReciterName(now!.reciter)} · ${
                activeVerseId == null ? 'Bismillah' : `Aya ${activeVerseId} of ${sura?.verseCount ?? '?'}`
              }`
            : getReciterName(reciter)}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.tealGradMid, paddingHorizontal: 8, paddingVertical: 10 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.extrabold, fontSize: 15.5, color: colors.onTeal },
  headerMeta: { fontFamily: fonts.regular, fontSize: 11, color: colors.textTealLabel, marginTop: 2 },
  listContent: { padding: 20, paddingBottom: 40 },
  bismillah: { fontFamily: fonts.arabic, fontSize: 30, lineHeight: 30 * ARABIC_LINE_HEIGHT, color: colors.accent, textAlign: 'center', includeFontPadding: false, marginBottom: 16 },
  verseCard: { gap: 8, borderBottomWidth: 1, borderBottomColor: colors.divider, paddingBottom: 18, marginBottom: 20 },
  verseCardActive: { marginHorizontal: -12, paddingHorizontal: 12, borderRadius: 14, backgroundColor: colors.bgCard },
  verseTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  verseBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.iconChipBg, alignItems: 'center', justifyContent: 'center' },
  verseBadgeActive: { backgroundColor: colors.accent },
  verseBadgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.accent },
  verseBadgeTextActive: { color: colors.onMintTextAlt },
  verseArabic: { fontFamily: fonts.arabic, color: colors.textPrimary, textAlign: 'right', includeFontPadding: false },
  verseTranslit: { fontFamily: fonts.regular, fontStyle: 'italic', fontSize: 15, lineHeight: 22, color: colors.textMuted },
  verseEn: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  loadingWrap: { flex: 1, padding: 20 },
  player: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bgSheet, padding: 14 },
  playBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  reciter: { flex: 1, fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted },
});
