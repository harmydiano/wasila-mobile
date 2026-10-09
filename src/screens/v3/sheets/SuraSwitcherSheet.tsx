import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  FlatList,
  TextInput,
  useWindowDimensions,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Icon from '../../../components/Icon';
import Sheet from '../../../components/Sheet';
import { fonts, serifHeading, arabicText, tabular, SIZE, CLAMP, uiLeading } from '../../../theme/type';
import { colors, v3 } from '../../../theme/v3/colors';
import { getSuraNames, prefetchSura, type SuraMeta } from '../../../data/db';
import { JUZ_STARTS, juzOfIndex, globalAyahIndex } from '../../../data/juz';
import { searchBy } from '../../../utils/search';

const REF_RE = /^\s*(\d{1,3})\s*[:.\s]\s*(\d{1,3})\s*$/;
const TICK_W = 46;

type Item =
  | { kind: 'juz'; juz: number; suraId: number; verseId: number }
  | { kind: 'sura'; sura: SuraMeta };

function buildThread(suras: SuraMeta[]): Item[] {
  const out: Item[] = [];
  for (const sura of suras) {
    JUZ_STARTS.forEach(([s, v], i) => {
      if (s === sura.suraId && v === 1) out.push({ kind: 'juz', juz: i + 1, suraId: s, verseId: v });
    });
    out.push({ kind: 'sura', sura });
    JUZ_STARTS.forEach(([s, v], i) => {
      if (s === sura.suraId && v > 1) out.push({ kind: 'juz', juz: i + 1, suraId: s, verseId: v });
    });
  }
  return out;
}

export default function SuraSwitcherSheet({
  visible,
  onClose,
  currentSura,
  currentVerse,
  onGo,
}: {
  visible: boolean;
  onClose: () => void;
  currentSura: number;
  currentVerse: number;
  onGo: (suraId: number, verseId: number) => void;
}) {
  const { height } = useWindowDimensions();
  const suras = useMemo(() => getSuraNames(), []);
  const thread = useMemo(() => buildThread(suras), [suras]);
  const nameOf = useCallback(
    (id: number) => suras.find((s) => s.suraId === id)?.transliterate ?? `Sura ${id}`,
    [suras]
  );

  const currentJuz = juzOfIndex(globalAyahIndex(currentSura, currentVerse));

  const [q, setQ] = useState('');
  const [openRuler, setOpenRuler] = useState<number | null>(null);
  const [inViewJuz, setInViewJuz] = useState(currentJuz);

  useEffect(() => {
    if (!visible) return;
    setQ('');
    setOpenRuler(null);
    setInViewJuz(currentJuz);
    scrolledToCurrent.current = false;
  }, [visible, currentJuz]);

  const go = useCallback(
    (suraId: number, verseId: number) => {
      prefetchSura(suraId);
      onGo(suraId, verseId);
      onClose();
    },
    [onGo, onClose]
  );

  const ref = useMemo(() => {
    const m = q.match(REF_RE);
    if (!m) return null;
    const sura = suras.find((s) => s.suraId === Number(m[1]));
    const verse = Number(m[2]);
    return sura && verse >= 1 && verse <= sura.verseCount ? { sura, verse } : null;
  }, [q, suras]);
  const hits = useMemo(
    () => (q.trim() ? searchBy(suras, q, (s) => [s.transliterate, s.english, s.arabic, String(s.suraId)]) : []),
    [q, suras]
  );
  const searching = q.trim().length > 0;

  const listRef = useRef<ScrollView>(null);
  const stripRef = useRef<ScrollView>(null);
  const juzY = useRef<number[]>([]);
  const suraY = useRef<Record<number, number>>({});
  const scrolledToCurrent = useRef(false);

  const scrollToY = (y: number, animated = true) =>
    listRef.current?.scrollTo({ y: Math.max(0, y - 8), animated });

  const onSuraLayout = (suraId: number) => (e: LayoutChangeEvent) => {
    const y = e.nativeEvent.layout.y;
    suraY.current[suraId] = y;
    if (suraId === currentSura && !scrolledToCurrent.current) {
      scrolledToCurrent.current = true;
      requestAnimationFrame(() => scrollToY(y - 56, false));
    }
  };

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y + 40;
    let j = 1;
    for (let i = 0; i < juzY.current.length; i++) {
      if (juzY.current[i] != null && juzY.current[i] <= y) j = i + 1;
    }
    setInViewJuz((prev) => (prev === j ? prev : j));
  }, []);

  useEffect(() => {
    stripRef.current?.scrollTo({ x: Math.max(0, (inViewJuz - 3) * 46), animated: true });
  }, [inViewJuz]);

  return (
    <Sheet visible={visible} onClose={onClose} bg={colors.bgCardAlt} scroll={false} maxHeightPct={88}>
      <View style={{ height: height * 0.8 }}>
        <View style={styles.head}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow} maxFontSizeMultiplier={CLAMP}>
              {`Reading · Juz ${currentJuz}`}
            </Text>
            <Text style={styles.title} numberOfLines={1}>
              {`${nameOf(currentSura)} ${currentSura}:${currentVerse}`}
            </Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} onPress={onClose}>
            <Icon name="close" size={23} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.field}>
          <Icon name="search" size={19} color={colors.accent} />
          <TextInput
            style={styles.input}
            value={q}
            onChangeText={setQ}
            placeholder="Name, number, or 2:255"
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={() => {
              if (ref) go(ref.sura.suraId, ref.verse);
              else if (hits[0]) go(hits[0].suraId, 1);
            }}
            accessibilityLabel="Find a sura or a verse"
            maxFontSizeMultiplier={1.3}
          />
          {!!q && (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear" hitSlop={10} onPress={() => setQ('')}>
              <Icon name="close" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {!searching && (
          <ScrollView
            ref={stripRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.strip}
            style={{ flexGrow: 0 }}
          >
            {JUZ_STARTS.map(([s, v], i) => {
              const juz = i + 1;
              const reading = juz === currentJuz;
              const inView = juz === inViewJuz;
              return (
                <Pressable
                  key={juz}
                  accessibilityRole="button"
                  accessibilityLabel={`Juz ${juz}, begins at ${nameOf(s)} ${s}:${v}`}
                  style={[styles.juzTile, inView && styles.juzTileInView, reading && styles.juzTileReading]}
                  onPress={() => {
                    const y = juzY.current[i];
                    if (y != null) scrollToY(y);
                  }}
                >
                  <Text
                    style={[styles.juzTileText, inView && { color: colors.gold }, reading && { color: colors.bgRoot }]}
                    maxFontSizeMultiplier={1.2}
                  >
                    {juz}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <ScrollView
          ref={listRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          onScroll={searching ? undefined : onScroll}
          scrollEventThrottle={48}
        >
          {searching ? (
            <>
              {ref && (
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.jumpRow, pressed && styles.pressed]}
                  onPress={() => go(ref.sura.suraId, ref.verse)}
                >
                  <Icon name="subdirectory_arrow_right" size={20} color={colors.bgRoot} />
                  <Text style={styles.jumpText} numberOfLines={1}>
                    {`Go to ${ref.sura.transliterate} ${ref.sura.suraId}:${ref.verse}`}
                  </Text>
                </Pressable>
              )}
              {hits.map((s) => (
                <SuraRow
                  key={s.suraId}
                  sura={s}
                  current={s.suraId === currentSura}
                  currentVerse={currentVerse}
                  rulerOpen={openRuler === s.suraId}
                  onToggleRuler={() => setOpenRuler((o) => (o === s.suraId ? null : s.suraId))}
                  onGo={go}
                />
              ))}
              {!ref && hits.length === 0 && (
                <Text style={styles.empty}>No sura by that name. Try its number, or a reference like 18:10.</Text>
              )}
            </>
          ) : (
            thread.map((item) =>
              item.kind === 'juz' ? (
                <JuzMark
                  key={`j${item.juz}`}
                  item={item}
                  suraName={nameOf(item.suraId)}
                  reading={item.juz === currentJuz}
                  onLayout={(e) => {
                    juzY.current[item.juz - 1] = e.nativeEvent.layout.y;
                  }}
                  onGo={go}
                />
              ) : (
                <View key={item.sura.suraId} onLayout={onSuraLayout(item.sura.suraId)}>
                  <SuraRow
                    sura={item.sura}
                    current={item.sura.suraId === currentSura}
                    currentVerse={currentVerse}
                    rulerOpen={openRuler === item.sura.suraId}
                    onToggleRuler={() =>
                      setOpenRuler((o) => (o === item.sura.suraId ? null : item.sura.suraId))
                    }
                    onGo={go}
                  />
                </View>
              )
            )
          )}
        </ScrollView>
      </View>
    </Sheet>
  );
}

function JuzMark({
  item,
  suraName,
  reading,
  onLayout,
  onGo,
}: {
  item: { juz: number; suraId: number; verseId: number };
  suraName: string;
  reading: boolean;
  onLayout: (e: LayoutChangeEvent) => void;
  onGo: (suraId: number, verseId: number) => void;
}) {
  const where =
    item.verseId === 1 ? `opens with ${suraName}` : `begins at ${item.suraId}:${item.verseId}, inside ${suraName}`;
  return (
    <Pressable
      onLayout={onLayout}
      accessibilityRole="button"
      accessibilityLabel={`Juz ${item.juz}, ${where}`}
      style={({ pressed }) => [styles.juzMark, pressed && styles.pressed]}
      onPress={() => onGo(item.suraId, item.verseId)}
    >
      <Star size={22} color={reading ? colors.gold : colors.goldMeta}>
        <Text style={styles.starNum} maxFontSizeMultiplier={1}>
          {item.juz}
        </Text>
      </Star>
      <Text style={styles.juzMarkLabel} maxFontSizeMultiplier={CLAMP}>{`Juz ${item.juz}`}</Text>
      <View style={styles.juzRule} />
      <Text style={styles.juzMarkWhere} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
        {item.verseId === 1 ? `from ${item.suraId}:1` : `from ${item.suraId}:${item.verseId}`}
      </Text>
    </Pressable>
  );
}

function SuraRow({
  sura,
  current,
  currentVerse,
  rulerOpen,
  onToggleRuler,
  onGo,
}: {
  sura: SuraMeta;
  current: boolean;
  currentVerse: number;
  rulerOpen: boolean;
  onToggleRuler: () => void;
  onGo: (suraId: number, verseId: number) => void;
}) {
  return (
    <View style={[styles.row, current && styles.rowCurrent]}>
      <View style={styles.rowMain}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${sura.transliterate} from the start`}
          style={({ pressed }) => [styles.rowTap, pressed && styles.pressed]}
          onPress={() => onGo(sura.suraId, 1)}
        >
          <Star size={30} color={current ? colors.accent : v3.borderStrong}>
            <Text style={[styles.starNumSura, current && { color: colors.accent }]} maxFontSizeMultiplier={1}>
              {sura.suraId}
            </Text>
          </Star>
          <View style={{ flex: 1, minWidth: 0 }}>
            {current && (
              <Text style={styles.rowEyebrow} maxFontSizeMultiplier={CLAMP}>
                {`Reading · aya ${currentVerse}`}
              </Text>
            )}
            <Text style={styles.rowName} numberOfLines={1}>
              {sura.transliterate}
            </Text>
            <Text style={styles.rowMeta} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
              {`${sura.english} · ${sura.verseCount} ayat`}
            </Text>
          </View>
          <Text style={styles.rowArabic} numberOfLines={1} maxFontSizeMultiplier={1}>
            {sura.arabic}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={rulerOpen ? 'Hide verse numbers' : `Choose a verse in ${sura.transliterate}`}
          accessibilityState={{ expanded: rulerOpen }}
          hitSlop={6}
          style={[styles.ayaPill, rulerOpen && styles.ayaPillOpen]}
          onPress={onToggleRuler}
        >
          <Text style={[styles.ayaPillText, rulerOpen && { color: colors.bgRoot }]} maxFontSizeMultiplier={1.2}>
            Aya
          </Text>
          <Icon name={rulerOpen ? 'expand_less' : 'expand_more'} size={16} color={rulerOpen ? colors.bgRoot : colors.textSecondary} />
        </Pressable>
      </View>
      {rulerOpen && (
        <AyaRuler sura={sura} mark={current ? currentVerse : null} onGo={onGo} />
      )}
    </View>
  );
}

function AyaRuler({
  sura,
  mark,
  onGo,
}: {
  sura: SuraMeta;
  mark: number | null;
  onGo: (suraId: number, verseId: number) => void;
}) {
  const data = useMemo(() => Array.from({ length: sura.verseCount }, (_, i) => i + 1), [sura.verseCount]);
  const start = mark != null ? Math.max(0, mark - 3) : 0;
  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={(n) => String(n)}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.ruler}
      getItemLayout={(_, index) => ({ length: TICK_W, offset: TICK_W * index, index })}
      initialScrollIndex={start}
      initialNumToRender={14}
      windowSize={5}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item: n }) => {
        const here = n === mark;
        const tenth = n % 10 === 0;
        const fifth = n % 5 === 0;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Aya ${n}`}
            style={styles.tick}
            onPress={() => onGo(sura.suraId, n)}
          >
            <View style={styles.tickSlot}>
              <View
                style={[
                  styles.tickLine,
                  fifth && { height: 10 },
                  tenth && { height: 14, backgroundColor: colors.gold },
                  here && { backgroundColor: colors.accent },
                ]}
              />
            </View>
            <View style={[styles.tickNum, here && styles.tickNumHere]}>
              <Text
                style={[styles.tickText, tenth && { color: colors.gold }, here && { color: colors.bgRoot }]}
                maxFontSizeMultiplier={1.2}
              >
                {n}
              </Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

function Star({ size, color, children }: { size: number; color: string; children: React.ReactNode }) {
  const sq = size * 0.74;
  const off = (size - sq) / 2;
  const sqStyle = { position: 'absolute' as const, left: off, top: off, width: sq, height: sq, borderWidth: 1.2, borderColor: color, borderRadius: 2 };
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={sqStyle} />
      <View style={[sqStyle, { transform: [{ rotate: '45deg' }] }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.8 },

  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 2, paddingBottom: 12 },
  eyebrow: { fontFamily: fonts.extrabold, fontSize: SIZE.caption, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.goldMeta },
  title: { ...serifHeading(SIZE.heading), color: colors.textPrimary, marginTop: 3 },

  field: {
    minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16,
    backgroundColor: v3.surfaceInset, borderWidth: 1, borderColor: v3.hairline, borderRadius: 999, paddingHorizontal: 15,
  },
  input: { flex: 1, fontFamily: fonts.bold, fontSize: SIZE.body, color: colors.textPrimary, padding: 0 },

  strip: { gap: 6, paddingHorizontal: 16, paddingVertical: 12 },
  juzTile: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: v3.hairline,
  },
  juzTileInView: { borderColor: colors.gold },
  juzTileReading: { backgroundColor: colors.gold, borderColor: colors.gold },
  juzTileText: { ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.meta, color: colors.textMuted },

  list: { paddingHorizontal: 16, paddingBottom: 24 },

  juzMark: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 12, paddingHorizontal: 4, minHeight: 44 },
  starNum: { ...tabular, fontFamily: fonts.extrabold, fontSize: 9, color: colors.gold },
  juzMarkLabel: { fontFamily: fonts.extrabold, fontSize: SIZE.caption, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.gold },
  juzRule: { flex: 1, height: 1, backgroundColor: 'rgba(225,179,71,0.28)' },
  juzMarkWhere: { ...tabular, fontFamily: fonts.semibold, fontSize: SIZE.caption, color: colors.goldMeta },

  row: { borderRadius: 18, marginBottom: 6, borderWidth: 1, borderColor: 'transparent', backgroundColor: v3.surfaceRow },
  rowCurrent: { backgroundColor: v3.surfaceHero, borderColor: v3.heroBorder },
  rowMain: { flexDirection: 'row', alignItems: 'center', paddingRight: 12 },
  rowTap: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingLeft: 12, paddingRight: 10 },
  starNumSura: { ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.caption, color: colors.textSecondary },
  rowEyebrow: { fontFamily: fonts.extrabold, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.accent, marginBottom: 1 },
  rowName: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.textPrimary },
  rowMeta: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: colors.textMuted, marginTop: 1 },
  rowArabic: { ...arabicText(19), color: colors.mint, maxWidth: 110 },

  ayaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 1, minHeight: 32,
    paddingLeft: 10, paddingRight: 5, borderRadius: 999, borderWidth: 1, borderColor: v3.borderStrong,
  },
  ayaPillOpen: { backgroundColor: colors.accent, borderColor: colors.accent },
  ayaPillText: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textSecondary },

  ruler: { paddingHorizontal: 12, paddingBottom: 12 },
  tick: { width: TICK_W, alignItems: 'center', minHeight: 54 },
  tickSlot: { height: 14, justifyContent: 'flex-end', marginBottom: 6 },
  tickLine: { width: 1.5, height: 6, backgroundColor: v3.borderStrong },
  tickNum: { minWidth: 34, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tickNumHere: { backgroundColor: colors.accent },
  tickText: { ...tabular, fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textSecondary },

  jumpRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.accent,
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10,
  },
  jumpText: { flex: 1, fontFamily: fonts.extrabold, fontSize: SIZE.title, color: colors.bgRoot },
  empty: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: 21, color: colors.textMuted, paddingTop: 10, paddingHorizontal: 4 },
});
