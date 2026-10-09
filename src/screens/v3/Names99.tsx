import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../../components/Icon';
import { Stagger, useStagger } from '../../components/v3/Stagger';
import {
  Chevron,
  GoldHead,
  GUTTER,
  LiveDot,
  Pill,
  Row,
  ScrollFade,
  SearchInput,
  TitleBlock,
  Well,
} from '../../components/v3/more/parts';
import { fonts, serifHeading, arabicText, SIZE, CLAMP, uiLeading, bodyLeading } from '../../theme/type';
import { more } from '../../theme/v3/colors';
import { NAMES_99, noteFor, type Name99 } from '../../data/names99';
import { queryTerms, searchBy } from '../../utils/search';
import { CATS } from '../../data/content';
import { useAppState, dayKey } from '../../state/AppState';

type Filter = 'all' | 'need' | 'saved';

function heroBody(name: Name99): string {
  const turned = noteFor(name).turnedTo.replace(/\.$/, '');
  const cat = CATS.find((c) => c.id === name.catId);
  const lower = turned.charAt(0).toLowerCase() + turned.slice(1);
  return `${name.meaning} — turned to for ${lower}.${cat ? ` Counted here on your ${cat.title} practice.` : ''}`;
}

export default function Names99({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { morePractice, moreSaved } = useAppState();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const anim = useStagger(4);

  const live = morePractice && morePractice.kind === 'name' ? morePractice : null;
  const liveName = live ? NAMES_99.find((n) => String(n.n) === live.id) ?? null : null;
  const doneToday = live && live.doneDateKey === dayKey(new Date()) ? live.done : 0;

  const rows = useMemo(() => {
    const pool = filter === 'saved' ? NAMES_99.filter((n) => moreSaved[`name:${n.n}`]) : NAMES_99;
    if (!queryTerms(query).length) return pool;
    return searchBy(pool, query, (n) => [n.translit, n.ar, n.meaning, n.need]);
  }, [filter, query, moreSaved]);

  const onFilter = (f: Filter) => {
    if (f === 'need') {
      navigation.navigate('Library');
      return;
    }
    setFilter(f);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <Stagger v={anim[0]}>
        <TitleBlock
          title="99 Names"
          meta="al-Asmāʾ al-Ḥusnā · each name, its meaning, and what it is used for"
          onBack={() => navigation.goBack()}
        />
      </Stagger>

      {!!live && !!liveName && (
        <Stagger v={anim[1]} style={styles.heroWrap}>
          <GoldHead label="Counting now" />
          <LinearGradient
            colors={[more.warmHeroFrom, more.warmHeroTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroTop}>
              <View style={styles.heroCol}>
                <Text style={styles.heroName}>Yā {liveName.translit.replace(/^[A-Za-z]+-/, '')}</Text>
                <Text style={styles.heroBody} numberOfLines={4}>
                  {heroBody(liveName)}
                </Text>
              </View>
              <Text style={styles.heroArabic} maxFontSizeMultiplier={1}>
                {liveName.ar}
              </Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.min(100, Math.round((live.day / Math.max(1, live.of)) * 100))}%` },
                ]}
              />
            </View>
            <View style={styles.heroFoot}>
              <LiveDot />
              <Text style={styles.heroMeta} maxFontSizeMultiplier={CLAMP}>
                DAY {live.day} OF {live.of} · {doneToday} DONE
              </Text>
              <View style={{ flex: 1 }} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue counting"
                onPress={() => navigation.navigate('MoreCounter')}
                style={({ pressed }) => [styles.continue, pressed && styles.pressed]}
              >
                <Text style={styles.continueText} maxFontSizeMultiplier={CLAMP}>
                  Continue
                </Text>
              </Pressable>
            </View>
          </LinearGradient>
        </Stagger>
      )}

      <Stagger v={anim[2]} style={styles.controls}>
        <SearchInput
          height={44}
          placeholder="Search a name, a meaning or a need"
          value={query}
          onChangeText={setQuery}
        />
        <View style={styles.pills}>
          <Pill label="All 99" on={filter === 'all'} onPress={() => onFilter('all')} />
          <Pill label="By need" onPress={() => onFilter('need')} />
          <Pill label="Saved" on={filter === 'saved'} onPress={() => onFilter('saved')} />
        </View>
      </Stagger>

      <View style={styles.scrollWrap}>
        <ScrollView contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
          <Stagger v={anim[3]}>
            <GoldHead
              label={filter === 'saved' ? 'Saved' : 'All 99'}
              count={`${rows.length}`}
              style={styles.listHead}
            />
            {rows.length === 0 ? (
              <Text style={styles.none}>
                {filter === 'saved'
                  ? 'The bookmark on a name puts it here.'
                  : 'No name matches that.'}
              </Text>
            ) : (
              <Well>
                {rows.map((n) => (
                  <NameRow
                    key={n.n}
                    name={n}
                    onPress={() => navigation.navigate('NameDetail', { n: n.n })}
                  />
                ))}
              </Well>
            )}
          </Stagger>
        </ScrollView>
        <ScrollFade />
      </View>
    </SafeAreaView>
  );
}

function NameRow({ name, onPress }: { name: Name99; onPress: () => void }) {
  return (
    <Row height={68} onPress={onPress} accessibilityLabel={`${name.translit}, ${name.meaning}`}>
      <Text style={styles.index} maxFontSizeMultiplier={CLAMP}>
        {String(name.n).padStart(2, '0')}
      </Text>
      <View style={styles.rowCol}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {name.translit}
        </Text>
        <Text style={styles.rowMeaning} numberOfLines={1}>
          {name.meaning}
        </Text>
        <Text style={styles.rowTag} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
          {name.need}
        </Text>
      </View>
      <Text style={styles.rowArabic} maxFontSizeMultiplier={1} numberOfLines={1}>
        {name.ar}
      </Text>
      <Chevron />
    </Row>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: more.ground },

  heroWrap: { paddingHorizontal: GUTTER, marginTop: 20, gap: 12 },
  hero: { borderRadius: 24, padding: 20, gap: 14, borderWidth: 1, borderColor: more.strong },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  heroCol: { flex: 1, gap: 8 },
  heroName: { ...serifHeading(SIZE.cardTitle), color: more.ink },
  heroBody: {
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: bodyLeading(SIZE.body),
    color: more.ink3,
  },
  heroArabic: { ...arabicText(34), color: more.onWarmHero },
  barTrack: { height: 6, borderRadius: 999, backgroundColor: 'rgba(7,18,16,0.55)', overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 999, backgroundColor: more.mint },
  heroFoot: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroMeta: {
    fontFamily: fonts.extrabold,
    fontSize: SIZE.caption,
    lineHeight: uiLeading(SIZE.caption),
    letterSpacing: 1.2,
    color: more.mint,
  },
  continue: {
    minHeight: 32,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: more.mint,
  },
  continueText: { fontFamily: fonts.extrabold, fontSize: SIZE.meta, color: more.onMint },

  controls: { paddingHorizontal: GUTTER, marginTop: 20, gap: 10 },
  pills: { flexDirection: 'row', gap: 8 },

  scrollWrap: { flex: 1, position: 'relative', marginTop: 18 },
  list: { paddingHorizontal: GUTTER, paddingBottom: 40 },
  listHead: { marginBottom: 12 },
  none: {
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: bodyLeading(SIZE.body),
    color: more.meta,
    paddingVertical: 24,
  },

  index: { width: 20, fontFamily: fonts.bold, fontSize: SIZE.meta, color: more.disabled },
  rowCol: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: fonts.bold, fontSize: SIZE.title, color: more.ink },
  rowMeaning: { fontFamily: fonts.regular, fontSize: SIZE.caption, color: more.meta },
  rowTag: {
    fontFamily: fonts.extrabold,
    fontSize: SIZE.caption - 1,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: more.gold,
    marginTop: 2,
  },
  rowArabic: { ...arabicText(24), color: more.ink2, textAlign: 'right' },

  pressed: { opacity: 0.9 },
});
