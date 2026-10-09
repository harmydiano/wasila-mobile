import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import Flag from '../../components/v3/more/Flag';
import { Stagger, useStagger } from '../../components/v3/Stagger';
import { Chevron, GoldHead, GUTTER, Row, ScrollFade, Well } from '../../components/v3/more/parts';
import { fonts, serifHeading, SIZE, CLAMP, bodyLeading } from '../../theme/type';
import { more } from '../../theme/v3/colors';
import { saintAt, lifeOf } from '../../data/saints';
import { useAppState } from '../../state/AppState';

export default function SaintDetail({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const saint = saintAt(route?.params?.id ?? 'rumi');
  const life = lifeOf(saint);
  const { moreSaved, toggleMoreSaved } = useAppState();
  const anim = useStagger(6);

  const key = `saint:${saint.id}`;
  const saved = !!moreSaved[key];
  const years = saint.born ? `${saint.born} – ${saint.died} AH` : `d. ${saint.died} AH`;
  const initial = saint.name.replace(/^[^A-Za-zĀ-ſ]*/, '').charAt(0).toUpperCase();

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
        <View style={{ flex: 1 }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove bookmark' : 'Bookmark this life'}
          hitSlop={10}
          style={styles.iconBtn}
          onPress={() => toggleMoreSaved(key)}
        >
          <Icon name={saved ? 'bookmark' : 'bookmark_border'} size={22} color={saved ? more.gold : more.ink3} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Text settings" hitSlop={10} style={styles.iconBtn}>
          <Icon name="text_format" size={22} color={more.ink3} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Share" hitSlop={10} style={styles.iconBtn}>
          <Icon name="ios_share" size={21} color={more.ink3} />
        </Pressable>
      </View>

      <Stagger v={anim[0]} style={styles.identity}>
        <View style={styles.initialCircle}>
          <Text style={styles.initial} maxFontSizeMultiplier={1}>
            {initial}
          </Text>
        </View>
        <Text style={styles.name}>{saint.name}</Text>
        <View style={styles.metaRow}>
          <Flag country={saint.country} />
          <Text style={styles.meta} numberOfLines={1}>
            {saint.place} · {years} · {saint.order}
          </Text>
        </View>
      </Stagger>

      <View style={styles.rule} />

      <View style={styles.scrollWrap}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
          <Stagger v={anim[1]} style={styles.block}>
            <Text style={styles.prose}>{life.bio}</Text>
            <Text style={[styles.prose, styles.proseQuiet]}>{life.note}</Text>
          </Stagger>

          <Stagger v={anim[2]} style={styles.block}>
            <GoldHead label="Known for" />
            <View style={styles.chips}>
              {life.knownFor.map((c) => (
                <View key={c} style={styles.chip}>
                  <Text style={styles.chipText} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                    {c}
                  </Text>
                </View>
              ))}
            </View>
          </Stagger>

          {saint.duas > 0 && (
            <Stagger v={anim[3]} style={styles.block}>
              <GoldHead label="His duas here" count={`${saint.duas}`} />
              <Well>
                <Row height={70} onPress={() => navigation.navigate('Library')} accessibilityLabel="Open his duas in Benefits">
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>
                      {saint.duas} {saint.duas === 1 ? 'dua' : 'duas'} attributed to him
                    </Text>
                    <Text style={styles.rowMeta}>EACH WITH ITS OWN SOURCE · ON BENEFITS</Text>
                  </View>
                  <Chevron />
                </Row>
              </Well>
            </Stagger>
          )}

          <Stagger v={anim[4]} style={styles.block}>
            <GoldHead label="Read on" />
            <Well>
              {life.readOn.map((r) => (
                <Row key={r.title} height={70} accessibilityLabel={r.title}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{r.title}</Text>
                    <Text style={styles.rowMeta}>{r.meta.toUpperCase()}</Text>
                  </View>
                  <Chevron />
                </Row>
              ))}
            </Well>
          </Stagger>

          <Stagger v={anim[5]} style={styles.block}>
            {saint.duas === 0 && (
              <View style={styles.absence}>
                <Icon name="menu_book" size={20} color={more.meta} />
                <Text style={styles.absenceText}>
                  No duas are attributed to him. Most of the lives here are read rather than recited.
                </Text>
              </View>
            )}
            <Text style={styles.source}>{life.source}</Text>
          </Stagger>
        </ScrollView>
        <ScrollFade />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: more.ground },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: GUTTER - 10, paddingTop: 4 },
  iconBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },

  identity: { paddingHorizontal: GUTTER, gap: 12, paddingTop: 6 },
  initialCircle: {
    width: 72,
    height: 72,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: more.raised,
    borderWidth: 1,
    borderColor: more.pillBorder,
  },
  initial: { fontFamily: fonts.serif, fontSize: 30, color: more.gold },
  name: { ...serifHeading(SIZE.display + 4), color: more.ink },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  meta: { flex: 1, fontFamily: fonts.regular, fontSize: SIZE.meta, color: more.meta },
  rule: { height: 1, marginHorizontal: GUTTER, marginTop: 16, backgroundColor: more.hairline },

  scrollWrap: { flex: 1, position: 'relative' },
  scroll: { paddingHorizontal: GUTTER, paddingTop: 18, paddingBottom: 40, gap: 24 },
  block: { gap: 12 },

  prose: {
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: bodyLeading(SIZE.body) + 2,
    color: more.ink2,
  },
  proseQuiet: { color: more.ink3 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 30,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: more.raised,
    borderWidth: 1,
    borderColor: more.pillBorder,
  },
  chipText: { fontFamily: fonts.semibold, fontSize: SIZE.meta, color: more.ink3 },

  rowTitle: { fontFamily: fonts.semibold, fontSize: SIZE.title, color: more.ink },
  rowMeta: {
    fontFamily: fonts.extrabold,
    fontSize: SIZE.caption,
    letterSpacing: 1.2,
    color: more.meta,
    marginTop: 4,
  },

  absence: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: more.hairline,
    borderRadius: 16,
    padding: 16,
  },
  absenceText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: bodyLeading(SIZE.body),
    color: more.ink3,
  },
  source: {
    fontFamily: fonts.regular,
    fontSize: SIZE.caption,
    lineHeight: bodyLeading(SIZE.caption),
    color: more.metaQuiet,
  },
});
