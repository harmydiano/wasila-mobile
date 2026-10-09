import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
  ActivityIndicator,
  ScrollView,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import Icon from '../../components/Icon';
import Sheet from '../../components/Sheet';
import ReaderSettingsSheet from './sheets/ReaderSettingsSheet';
import SuraSwitcherSheet from './sheets/SuraSwitcherSheet';
import {
  fonts, serifHeading, arabicText, tabular, SIZE, CLAMP,
  uiLeading, bodyLeading, ARABIC_LINE_HEIGHT, scaledLeading,
} from '../../theme/type';
import { colors, v3 } from '../../theme/v3/colors';
import { getSuraMeta, getSuraVerses, getCachedSuraVerses, type Ayah } from '../../data/db';
import { NO_HEADER_BISMILLAH } from '../../data/audio';
import { getReciterName } from '../../data/reciters';
import { useAppState } from '../../state/AppState';
import { useQuranAudio } from '../../state/QuranAudio';
import {
  recordRead,
  creditReadingSeconds,
  minutesToday,
  toggleBookmark,
  useQuranProgress,
  markKey,
} from '../../data/quranProgress';
import { useReaderPrefs, setReaderPrefs, SPACING_SCALE, PAPER, DEEP, type ReaderPrefs } from '../../data/quranReaderPrefs';
import { juzOfIndex, globalAyahIndex } from '../../data/juz';

const BISMILLAH = 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيم';

const FSI = '⁨';
const PDI = '⁩';

const AYAH_MARK = '۝';

type Palette = {
  bg: string;
  card: string;
  cardBorder: string;
  headerBg: string;
  headerInk: string;
  headerMeta: string;
  ink: string;
  body: string;
  meta: string;
  faint: string;
  accent: string;
  accentInk: string;
  onAccent: string;
  accentWash: string;
  pill: string;
  gold: string;
  border: string;
  transportBg: string;
};

function readerPalette(theme: ReaderPrefs['theme']): Palette {
  if (theme === 'paper') {
    return {
      bg: PAPER.bg,
      card: PAPER.bgAlt,
      cardBorder: PAPER.border,
      headerBg: PAPER.bg,
      headerInk: PAPER.inkStrong,
      headerMeta: PAPER.meta,
      ink: PAPER.ink,
      body: PAPER.inkTitle,
      meta: PAPER.meta,
      faint: PAPER.meta,
      accent: PAPER.accent,
      accentInk: PAPER.accent,
      onAccent: PAPER.onAccent,
      accentWash: 'rgba(14,122,87,0.10)',
      pill: PAPER.borderStrong,
      gold: PAPER.gold,
      border: PAPER.border,
      transportBg: PAPER.bgAlt,
    };
  }
  const deep = theme === 'deep';
  return {
    bg: deep ? DEEP.bg : colors.bgRoot,
    card: deep ? DEEP.card : colors.bgCardMuted,
    cardBorder: deep ? DEEP.border : colors.outlineBorder,
    headerBg: deep ? DEEP.card : '#1F3D34',
    headerInk: colors.textPrimary,
    headerMeta: colors.mint,
    ink: colors.textPrimary,
    body: colors.textSecondary,
    meta: colors.textMuted,
    faint: colors.textDisabled,
    accent: colors.accent,
    accentInk: colors.accent,
    onAccent: colors.onMintTextAlt,
    accentWash: 'rgba(123,224,190,0.10)',
    pill: deep ? DEEP.bg : colors.bgCard,
    gold: colors.gold,
    border: deep ? DEEP.border : colors.outlineBorder,
    transportBg: deep ? DEEP.card : colors.bgCardAlt,
  };
}

const VerseCard = React.memo(function VerseCard({
  v,
  suraId,
  arabicSize,
  spacing,
  showTranslit,
  showTranslation,
  active,
  playing,
  repeating,
  bookmarked,
  p,
  onPlay,
  onBookmark,
  onMore,
}: {
  v: Ayah;
  suraId: number;
  arabicSize: number;
  spacing: number;
  showTranslit: boolean;
  showTranslation: boolean;
  active: boolean;
  playing: boolean;
  repeating: boolean;
  bookmarked: boolean;
  p: Palette;
  onPlay: (verseId: number) => void;
  onBookmark: (verseId: number) => void;
  onMore: (verseId: number) => void;
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: p.card, borderColor: p.cardBorder },
        active && { backgroundColor: p.accentWash, borderColor: p.accent },
      ]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.ayahPill, { backgroundColor: active ? p.accent : p.pill }]}>
          <Text
            style={[styles.ayahPillText, { color: active ? p.onAccent : p.meta }]}
            maxFontSizeMultiplier={CLAMP}
          >
            {active ? `Aya ${suraId}:${v.verseId} · playing` : `Aya ${suraId}:${v.verseId}`}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={active && playing ? `Pause ayah ${v.verseId}` : `Play ayah ${v.verseId}`}
          hitSlop={8}
          onPress={() => onPlay(v.verseId)}
        >
          <Icon
            name={active && playing ? 'pause_circle' : 'play_circle'}
            size={21}
            color={active ? p.accentInk : p.meta}
          />
        </Pressable>
        {active && repeating ? (
          <Icon name="repeat_one" size={19} color={p.accentInk} />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={bookmarked ? `Remove bookmark on ayah ${v.verseId}` : `Bookmark ayah ${v.verseId}`}
            hitSlop={8}
            onPress={() => onBookmark(v.verseId)}
          >
            <Icon name={bookmarked ? 'bookmark' : 'bookmark_border'} size={19} color={bookmarked ? p.gold : p.meta} />
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`More for ayah ${v.verseId}`}
          hitSlop={8}
          onPress={() => onMore(v.verseId)}
        >
          <Icon name="more_horiz" size={19} color={p.meta} />
        </Pressable>
      </View>

      <Text
        style={[
          styles.arabic,
          {
            color: p.ink,
            fontSize: arabicSize,
            lineHeight: scaledLeading(arabicSize, ARABIC_LINE_HEIGHT * spacing),
          },
        ]}
        maxFontSizeMultiplier={1}
      >
        {v.ar}
      </Text>

      {showTranslit ? (
        <Text style={[styles.translit, { color: active ? p.accentInk : p.meta }]}>{v.translit}</Text>
      ) : null}
      {showTranslation ? (
        <Text style={[styles.translation, { color: active ? p.ink : p.body }]}>{v.en}</Text>
      ) : null}
    </View>
  );
});

export default function Sura({ route, navigation }: any) {
  const { n, v: openAtVerse } = route.params;
  const sura = useMemo(() => getSuraMeta(n), [n]);
  const [verses, setVerses] = useState<Ayah[] | null>(() => getCachedSuraVerses(n));
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Ayah>>(null);
  const focused = useIsFocused();

  const { arabicSize } = useAppState();
  const prefs = useReaderPrefs();
  const p = useMemo(() => readerPalette(prefs.theme), [prefs.theme]);
  const spacing = SPACING_SCALE[prefs.lineSpacing];
  const progress = useQuranProgress();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const topVerse = useRef(openAtVerse ?? 1);
  const [moreVerse, setMoreVerse] = useState<number | null>(null);

  const [fromVerse, setFromVerse] = useState<number | null>(
    openAtVerse != null && openAtVerse > 1 ? openAtVerse : null
  );
  useEffect(() => {
    setFromVerse(openAtVerse != null && openAtVerse > 1 ? openAtVerse : null);
  }, [n, openAtVerse]);

  const {
    now, playing, playSura, playVerse, toggle, next, previous,
    repeat, setRepeat, speed, setSpeed,
  } = useQuranAudio();
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

  const shown = useMemo(
    () => (verses && fromVerse ? verses.slice(fromVerse - 1) : verses),
    [verses, fromVerse]
  );
  const firstVerseId = fromVerse ?? 1;

  useEffect(() => {
    if (!focused) return;
    const id = setInterval(() => creditReadingSeconds(10), 10_000);
    return () => clearInterval(id);
  }, [focused]);

  const readMinutes = minutesToday();
  const goalMet = prefs.goalMinutes > 0 && readMinutes >= prefs.goalMinutes;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 40 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const top = viewableItems?.[0]?.item as Ayah | undefined;
    if (top) {
      topVerse.current = top.verseId;
      recordRead(top.suraId, top.verseId);
    }
  }).current;

  useEffect(() => {
    topVerse.current = openAtVerse ?? 1;
    recordRead(n, openAtVerse ?? 1);
  }, [n, openAtVerse]);

  const followedSura = useRef<number | null>(null);
  useEffect(() => {
    followedSura.current = null;
  }, [n]);
  useEffect(() => {
    if (isThisSura) followedSura.current = n;
  }, [isThisSura, n]);
  useEffect(() => {
    if (!focused || isThisSura || !now) return;
    if (followedSura.current !== n) return;
    navigation.setParams({ n: now.suraId, v: undefined });
  }, [focused, isThisSura, now, n, navigation]);

  useEffect(() => {
    if (!prefs.autoScroll || prefs.mode !== 'list') return;
    if (!isThisSura || !playing || activeVerseId == null) return;
    const index = activeVerseId - firstVerseId;
    if (index < 0) return;
    listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.3 });
  }, [prefs.autoScroll, prefs.mode, isThisSura, playing, activeVerseId, firstVerseId]);

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

  const onBookmark = useCallback((verseId: number) => toggleBookmark(n, verseId), [n]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Ayah>) => (
      <VerseCard
        v={item}
        suraId={n}
        arabicSize={arabicSize}
        spacing={spacing}
        showTranslit={prefs.showTranslit}
        showTranslation={prefs.showTranslation}
        active={isThisSura && activeVerseId === item.verseId}
        playing={playing}
        repeating={repeat.mode !== 'off'}
        bookmarked={progress.marks.includes(markKey(n, item.verseId))}
        p={p}
        onPlay={playVerseAt}
        onBookmark={onBookmark}
        onMore={setMoreVerse}
      />
    ),
    [n, arabicSize, spacing, prefs.showTranslit, prefs.showTranslation, isThisSura, activeVerseId, playing, repeat.mode, progress.marks, p, playVerseAt, onBookmark]
  );

  const keyExtractor = useCallback((v: Ayah) => String(v.verseId), []);

  const listHeader = useMemo(() => {
    if (fromVerse) {
      return (
        <Pressable
          style={[styles.resumeStrip, { backgroundColor: p.card, borderColor: p.cardBorder }]}
          onPress={() => setFromVerse(null)}
        >
          <Icon name="arrow_upward" size={17} color={p.accentInk} />
          <Text style={[styles.resumeText, { color: p.accentInk }]} numberOfLines={2}>
            {`Continuing from aya ${fromVerse} · read from the start`}
          </Text>
        </Pressable>
      );
    }
    return NO_HEADER_BISMILLAH.has(n) ? null : (
      <Text style={[styles.bismillah, { color: p.gold }]} maxFontSizeMultiplier={1}>
        {BISMILLAH}
      </Text>
    );
  }, [n, fromVerse, p]);

  const mushafText = useMemo(() => {
    if (!shown) return '';
    return shown
      .map((v) => (prefs.verseNumbers ? `${v.ar} ${AYAH_MARK}‏${toArabicDigits(v.verseId)} ` : `${v.ar} ${AYAH_MARK} `))
      .join('');
  }, [shown, prefs.verseNumbers]);

  const juz = sura ? juzOfIndex(globalAyahIndex(n, firstVerseId)) : 1;
  const positionPct = sura && activeVerseId != null ? Math.round((activeVerseId / sura.verseCount) * 100) : 0;

  const transportTitle = isThisSura
    ? now!.verseId == null
      ? `${now!.suraName}, Bismillah`
      : `${now!.suraName}, Aya ${now!.verseId}`
    : sura?.transliterate ?? '';
  const repeatShort =
    repeat.mode === 'off'
      ? null
      : repeat.mode === 'ayah'
        ? `×${repeat.times}`
        : repeat.mode === 'range'
          ? `${repeat.from}–${repeat.to}`
          : 'sura';
  const transportSub = [getReciterName(now?.reciter ?? ''), repeatShort].filter(Boolean).join(' · ');

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: p.bg }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { backgroundColor: p.headerBg }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={8} onPress={() => navigation.goBack()}>
          <Icon name="arrow_back" size={23} color={p.headerInk} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose another sura"
          style={styles.headerTitleWrap}
          onPress={() => setSwitcherOpen(true)}
        >
          <Text style={[styles.headerTitle, { color: p.headerInk }]} numberOfLines={1}>
            {sura?.transliterate ?? '…'}
          </Text>
          <Icon name="expand_more" size={18} color={p.headerMeta} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reading settings"
          hitSlop={8}
          onPress={() => setSettingsOpen(true)}
        >
          <Icon name="tune" size={21} color={p.headerInk} />
        </Pressable>
      </View>

      <View style={[styles.subBar, { borderBottomColor: p.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.subMeta, { color: p.meta }]} numberOfLines={1}>
            {sura ? `${n} · ${sura.english} · ${FSI}${sura.arabic}${PDI}` : ''}
          </Text>
          <View style={[styles.track, { backgroundColor: p.card }]}>
            <View style={[styles.trackFill, { width: `${positionPct}%`, backgroundColor: p.accent }]} />
          </View>
        </View>
        {prefs.goalMinutes > 0 && (
          <Pressable style={styles.goal} accessibilityRole="button" onPress={() => setSettingsOpen(true)}>
            <View>
              <Text style={[styles.goalLabel, { color: p.meta }]} maxFontSizeMultiplier={CLAMP}>
                Reading goal
              </Text>
              <Text style={[styles.goalValue, { color: p.gold }]} maxFontSizeMultiplier={CLAMP}>
                {`${readMinutes} / ${prefs.goalMinutes} min`}
              </Text>
            </View>
            <View style={[styles.goalRing, { borderColor: goalMet ? p.gold : p.border }]}>
              <Icon
                name={goalMet ? 'check' : 'schedule'}
                size={13}
                color={goalMet ? p.gold : p.faint}
              />
            </View>
          </Pressable>
        )}
      </View>

      {!shown ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={p.accent} style={{ marginTop: 40 }} />
        </View>
      ) : prefs.mode === 'mushaf' ? (
        <ScrollView contentContainerStyle={styles.mushafContent}>
          {!NO_HEADER_BISMILLAH.has(n) && !fromVerse && (
            <>
              <Text style={[styles.bismillahPage, { color: p.gold }]} maxFontSizeMultiplier={1}>
                {BISMILLAH}
              </Text>
              <View style={[styles.rule, { backgroundColor: p.border }]} />
            </>
          )}
          <Text
            style={[
              styles.mushaf,
              {
                color: p.ink,
                fontSize: Math.round(arabicSize * 0.92),
                lineHeight: scaledLeading(Math.round(arabicSize * 0.92), ARABIC_LINE_HEIGHT * spacing * 1.15),
              },
            ]}
            maxFontSizeMultiplier={1}
          >
            {mushafText}
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          ref={listRef}
          data={shown}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={listHeader}
          extraData={`${arabicSize}-${activeVerseId}-${playing}-${prefs.lineSpacing}-${progress.marks.length}`}
          contentContainerStyle={styles.listContent}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          updateCellsBatchingPeriod={50}
          windowSize={9}
          removeClippedSubviews={Platform.OS === 'android'}
          onScrollToIndexFailed={onScrollToIndexFailed}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
        />
      )}

      {prefs.mode === 'mushaf' && (
        <View style={styles.pageStrip}>
          <Text style={[styles.pageStripText, { color: p.meta }]} maxFontSizeMultiplier={CLAMP}>{`Juz ${juz}`}</Text>
          <Text style={[styles.pageStripText, { color: p.meta }]} maxFontSizeMultiplier={CLAMP}>{n}</Text>
          <Text style={[styles.pageStripText, { color: p.meta }]} maxFontSizeMultiplier={CLAMP}>
            {sura?.transliterate ?? ''}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.transport,
          { backgroundColor: p.transportBg, borderColor: p.border, marginBottom: Math.max(insets.bottom, 10) },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isThisSura && playing ? 'Pause' : 'Play'}
          style={[styles.playBtn, { backgroundColor: p.accent }]}
          onPress={togglePlayback}
        >
          <Icon name={isThisSura && playing ? 'pause' : 'play_arrow'} size={25} color={p.onAccent} />
        </Pressable>
        <Pressable
          style={styles.transportText}
          accessibilityRole="button"
          accessibilityLabel="Open the player"
          onPress={() => navigation.navigate('NowPlaying')}
          disabled={!isThisSura}
        >
          <Text style={[styles.transportTitle, { color: p.ink }]} numberOfLines={1}>
            {transportTitle}
          </Text>
          <Text style={[styles.transportSub, { color: p.meta }]} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
            {transportSub}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Playback speed ${speed}×`}
          style={[styles.speedPill, { backgroundColor: p.pill }]}
          onPress={() => setSpeed(nextSpeed(speed))}
        >
          <Text style={[styles.speedText, { color: p.accentInk }]} maxFontSizeMultiplier={CLAMP}>{`${speed}×`}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous sura" hitSlop={6} onPress={previous}>
          <Icon name="skip_previous" size={24} color={p.body} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Next sura" hitSlop={6} onPress={next}>
          <Icon name="skip_next" size={24} color={p.body} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open the player"
          hitSlop={6}
          onPress={() => navigation.navigate('NowPlaying')}
          disabled={!isThisSura}
        >
          <Icon name="expand_less" size={21} color={isThisSura ? p.meta : p.faint} />
        </Pressable>
      </View>

      <ReaderSettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} navigation={navigation} />

      <SuraSwitcherSheet
        visible={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        currentSura={n}
        currentVerse={topVerse.current}
        onGo={(suraId, verseId) => navigation.setParams({ n: suraId, v: verseId > 1 ? verseId : undefined })}
      />

      <Sheet visible={moreVerse != null} onClose={() => setMoreVerse(null)} bg={colors.bgCardAlt} scroll={false}>
        <View style={styles.sheetHead}>
          <Text style={styles.sheetTitle}>{`Aya ${n}:${moreVerse ?? ''}`}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} onPress={() => setMoreVerse(null)}>
            <Icon name="close" size={23} color={colors.textMuted} />
          </Pressable>
        </View>
        <View style={styles.sheetOptions}>
          {[
            {
              icon: 'play_arrow',
              label: 'Play from here',
              sub: 'Continues down the sura',
              onPress: () => moreVerse != null && playVerse(n, moreVerse),
            },
            {
              icon: 'repeat_one',
              label: `Repeat this ayah ×${repeat.times}`,
              sub: 'Set the count in Reading settings › Audio',
              onPress: () => {
                if (moreVerse == null) return;
                setRepeat({ mode: 'ayah' });
                playVerse(n, moreVerse);
              },
            },
            {
              icon: 'format_list_numbered',
              label: 'Loop from here to the end of the sura',
              sub: sura ? `Aya ${moreVerse} to ${sura.verseCount}` : undefined,
              onPress: () => {
                if (moreVerse == null || !sura) return;
                setRepeat({ mode: 'range', from: moreVerse, to: sura.verseCount });
                playVerse(n, moreVerse);
              },
            },
            {
              icon: progress.marks.includes(markKey(n, moreVerse ?? 0)) ? 'bookmark' : 'bookmark_border',
              label: progress.marks.includes(markKey(n, moreVerse ?? 0)) ? 'Remove bookmark' : 'Bookmark this ayah',
              onPress: () => moreVerse != null && toggleBookmark(n, moreVerse),
            },
          ].map((o) => (
            <Pressable
              key={o.label}
              accessibilityRole="button"
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}
              onPress={() => {
                o.onPress();
                setMoreVerse(null);
              }}
            >
              <Icon name={o.icon} size={21} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>{o.label}</Text>
                {o.sub ? <Text style={styles.optionSub}>{o.sub}</Text> : null}
              </View>
            </Pressable>
          ))}
        </View>
      </Sheet>
    </SafeAreaView>
  );
}

function nextSpeed(current: number): number {
  const order = [0.75, 1, 1.25, 1.5];
  const i = order.indexOf(current);
  return order[(i + 1) % order.length];
}

function toArabicDigits(n: number): string {
  return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pressed: { opacity: 0.85 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 13 },
  headerTitleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
  headerTitle: { ...serifHeading(SIZE.heading) },

  subBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 10, borderBottomWidth: 1 },
  subMeta: { fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption) },
  track: { marginTop: 7, height: 3, borderRadius: 2, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 2 },
  goal: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
  goalLabel: { fontFamily: fonts.regular, fontSize: SIZE.caption, textAlign: 'right' },
  goalValue: { ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.meta, textAlign: 'right', marginTop: 1 },
  goalRing: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },

  listContent: { padding: 16, paddingBottom: 28 },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, paddingBottom: 18, marginBottom: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ayahPill: { borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11 },
  ayahPillText: { fontFamily: fonts.extrabold, fontSize: SIZE.caption },
  arabic: {
    fontFamily: fonts.arabic,
    marginTop: 14,
    textAlign: 'right',
    writingDirection: 'rtl',
    includeFontPadding: false,
  },
  translit: { fontFamily: fonts.regular, fontStyle: 'italic', fontSize: SIZE.body, lineHeight: bodyLeading(SIZE.body), marginTop: 10 },
  translation: { ...serifHeading(SIZE.title, fonts.serifMedium), lineHeight: bodyLeading(SIZE.title), marginTop: 8 },

  bismillah: { ...arabicText(28), textAlign: 'center', marginBottom: 16 },
  bismillahPage: { ...arabicText(24), textAlign: 'center' },
  rule: { height: 1, marginTop: 8 },

  mushafContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  mushaf: {
    fontFamily: fonts.arabic,
    marginTop: 18,
    textAlign: 'justify',
    writingDirection: 'rtl',
    includeFontPadding: false,
  },
  pageStrip: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 6 },
  pageStripText: { fontFamily: fonts.bold, fontSize: SIZE.caption },

  resumeStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1,
    borderRadius: 999, paddingVertical: 11, paddingHorizontal: 16, marginBottom: 14,
  },
  resumeText: { flex: 1, fontFamily: fonts.semibold, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta) },

  loadingWrap: { flex: 1, padding: 20 },

  transport: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
    marginHorizontal: 14, marginTop: 8,
    borderWidth: 1, borderRadius: 22, paddingVertical: 12, paddingHorizontal: 14,
  },
  playBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  transportText: { flex: 1, minWidth: 0 },
  transportTitle: { fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body) },
  transportSub: { fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), marginTop: 2 },
  speedPill: { borderRadius: 999, paddingVertical: 6, paddingHorizontal: 11 },
  speedText: { ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.meta },

  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14 },
  sheetTitle: { ...serifHeading(SIZE.heading), color: colors.textPrimary, flex: 1 },
  sheetOptions: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 13,
    backgroundColor: v3.surfaceCard, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16,
  },
  optionLabel: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.textPrimary },
  optionSub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: colors.textMuted, marginTop: 2 },
});
