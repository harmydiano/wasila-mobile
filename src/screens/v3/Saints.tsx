import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Easing,
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import Flag from '../../components/v3/more/Flag';
import { useReduceMotion } from '../../components/v3/Stagger';
import { Chevron, GoldHead, Row, SearchInput, Well } from '../../components/v3/more/parts';
import { matchScore, queryTerms } from '../../utils/search';
import { fonts, serifHeading, SIZE, CLAMP, uiLeading } from '../../theme/type';
import { more } from '../../theme/v3/colors';
import { SAINTS, SAINTS_TOTAL, byCentury, centuryLabel, type Saint } from '../../data/saints';

const PAGE = 30;
const PREFETCH = 400;
const GUTTER_L = 22;
const GUTTER_R = 52;
const NOTABLE = 7;

export default function Saints({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [loaded, setLoaded] = useState(PAGE);
  const [loading, setLoading] = useState(false);
  const [topCentury, setTopCentury] = useState<number | null>(
    () => byCentury(SAINTS.slice(0, PAGE))[0]?.century ?? null
  );
  const reduced = useReduceMotion();

  const heads = useRef(new Map<number, number>()).current;
  const progress = useRef(new Animated.Value(0)).current;

  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const terms = useMemo(() => queryTerms(query), [query]);
  const filtering = terms.length > 0;

  const rows = useMemo(
    () => (filtering ? SAINTS.filter((s) => matchScore(terms, [s.name, s.place, s.order]) > 0) : SAINTS.slice(0, loaded)),
    [filtering, terms, loaded]
  );
  const groups = useMemo(() => byCentury(rows), [rows]);
  useEffect(() => {
    setTopCentury(byCentury(rows)[0]?.century ?? null);
  }, [filtering, terms]);
  const centuries = useMemo(() => byCentury(SAINTS).map((g) => g.century), []);
  const more_ = !filtering && loaded < SAINTS.length;
  const nextCentury = more_ ? byCentury(SAINTS.slice(loaded, loaded + 1))[0]?.century ?? null : null;

  const loadMore = useCallback(() => {
    if (loading || !more_) return;
    setLoading(true);
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: reduced ? 0 : 420,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start(() => {
      setLoaded((n) => Math.min(SAINTS.length, n + PAGE));
      setLoading(false);
    });
  }, [loading, more_, progress, reduced]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    if (contentSize.height - (contentOffset.y + layoutMeasurement.height) < PREFETCH) loadMore();

    let top: number | null = null;
    const shown = new Set(groups.map((g) => g.century));
    for (const [century, y] of heads) if (shown.has(century) && y - 8 <= contentOffset.y) top = century;
    setTopCentury(top ?? groups[0]?.century ?? null);
  };

  const onHeadLayout = (century: number) => (e: LayoutChangeEvent) => {
    heads.set(century, e.nativeEvent.layout.y);
  };

  const children: React.ReactNode[] = [];
  const sticky: number[] = [];
  groups.forEach((g) => {
    sticky.push(children.length);
    children.push(
      <View key={`h-${g.century}`} style={styles.stickyHead} onLayout={onHeadLayout(g.century)}>
        <GoldHead label={g.label} count={`${g.rows.length}`} />
      </View>
    );
    children.push(
      <Well key={`w-${g.century}`} style={styles.well}>
        {g.rows.map((s) => (
          <SaintRow key={s.id} saint={s} onPress={() => navigation.navigate('SaintDetail', { id: s.id })} />
        ))}
      </Well>
    );
  });

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow_back" size={23} color={more.ink} />
        </Pressable>
        <Text style={styles.title}>Saints</Text>
        <Text style={styles.count} maxFontSizeMultiplier={CLAMP}>
          {rows.length} of {SAINTS_TOTAL}
        </Text>
        <View style={{ flex: 1 }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={searching ? 'Close search' : 'Search the lives'}
          hitSlop={10}
          style={styles.iconBtn}
          onPress={() => {
            if (searching) setQuery('');
            setSearching((v) => !v);
          }}
        >
          <Icon name={searching ? 'close' : 'search'} size={21} color={more.ink3} />
        </Pressable>
      </View>
      {searching && (
        <View style={styles.searchWrap}>
          <SearchInput placeholder="Search a name, a place or an order" value={query} onChangeText={setQuery} autoFocus />
        </View>
      )}

      <View style={styles.body}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={sticky}
          scrollEventThrottle={16}
          onScroll={onScroll}
        >
          {children}
          {filtering && rows.length === 0 && (
            <Text style={styles.none} maxFontSizeMultiplier={CLAMP}>
              No life matches “{query.trim()}”.
            </Text>
          )}
          {more_ && (
            <View style={styles.loader}>
              <View style={styles.loaderTrack}>
                <Animated.View
                  style={[
                    styles.loaderFill,
                    { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
                  ]}
                />
              </View>
              <Text style={styles.loaderText} maxFontSizeMultiplier={CLAMP}>
                LOADING THE {nextCentury ? centuryLabel(nextCentury).toUpperCase() : 'NEXT CENTURY'}
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.rail} pointerEvents="none">
          {centuries.map((c) => {
            const isTop = c === topCentury;
            const inView = topCentury != null && (c === topCentury || c === topCentury + 1);
            return (
              <View key={c} style={[styles.railStep, isTop && styles.railStepOn]}>
                <Text
                  style={[styles.railText, inView && styles.railTextIn, isTop && styles.railTextOn]}
                  maxFontSizeMultiplier={1}
                >
                  {c}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

function SaintRow({ saint, onPress }: { saint: Saint; onPress: () => void }) {
  return (
    <Row height={68} onPress={onPress} accessibilityLabel={saint.name}>
      <Flag country={saint.country} />
      <View style={styles.rowCol}>
        <Text style={styles.rowName} numberOfLines={1}>
          {saint.name}
        </Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          {saint.place} · d. {saint.died} AH · {saint.order}
        </Text>
      </View>
      <Text
        style={[styles.duas, saint.duas >= NOTABLE && styles.duasNotable]}
        maxFontSizeMultiplier={CLAMP}
      >
        {saint.duas || '—'}
      </Text>
      <Chevron />
    </Row>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: more.ground },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: GUTTER_L - 10,
    paddingRight: GUTTER_L,
    paddingTop: 4,
  },
  iconBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  title: { ...serifHeading(SIZE.heading + 1), color: more.ink },
  count: { fontFamily: fonts.regular, fontSize: SIZE.meta, color: more.meta },
  searchWrap: { paddingLeft: GUTTER_L, paddingRight: GUTTER_L, paddingTop: 10 },
  none: { fontFamily: fonts.regular, fontSize: SIZE.body, color: more.meta, paddingTop: 24 },

  body: { flex: 1, position: 'relative' },
  scroll: { paddingLeft: GUTTER_L, paddingRight: GUTTER_R, paddingTop: 8, paddingBottom: 40 },

  stickyHead: { backgroundColor: more.ground, paddingTop: 14, paddingBottom: 8 },
  well: { marginBottom: 6 },

  rowCol: { flex: 1, gap: 3 },
  rowName: { ...serifHeading(SIZE.title), color: more.ink },
  rowMeta: { fontFamily: fonts.regular, fontSize: SIZE.caption, color: more.meta },
  duas: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: more.meta, minWidth: 18, textAlign: 'right' },
  duasNotable: { color: more.ink },

  loader: { alignItems: 'center', gap: 10, paddingVertical: 28 },
  loaderTrack: { width: 104, height: 3, borderRadius: 999, backgroundColor: more.track, overflow: 'hidden' },
  loaderFill: { height: 3, borderRadius: 999, backgroundColor: more.mint },
  loaderText: {
    fontFamily: fonts.extrabold,
    fontSize: SIZE.caption,
    lineHeight: uiLeading(SIZE.caption),
    letterSpacing: 1.2,
    color: more.meta,
  },

  rail: {
    position: 'absolute',
    right: 8,
    top: 12,
    width: 30,
    alignItems: 'center',
  },
  railStep: { height: 32, width: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  railStepOn: { backgroundColor: more.mint },
  railText: { fontFamily: fonts.bold, fontSize: SIZE.caption, color: more.meta },
  railTextIn: { color: more.ink },
  railTextOn: { color: more.onMint },
});
