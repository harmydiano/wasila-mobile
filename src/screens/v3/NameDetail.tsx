import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../../components/Icon';
import { Stagger, useStagger } from '../../components/v3/Stagger';
import { GoldHead, GoldPanel, GUTTER, LinkRow } from '../../components/v3/more/parts';
import { fonts, serifHeading, arabicText, SIZE, CLAMP, bodyLeading } from '../../theme/type';
import { more } from '../../theme/v3/colors';
import { nameAt, noteFor, NAMES_99 } from '../../data/names99';
import { CATS } from '../../data/content';
import { useAppState, dayKey } from '../../state/AppState';

function Diamond() {
  return <View style={styles.diamond} />;
}

export default function NameDetail({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const footPad = Math.max(insets.bottom, 12) + 10;
  const name = nameAt(route?.params?.n ?? 30);
  const note = noteFor(name);
  const { moreSaved, toggleMoreSaved, morePractice, startMorePractice } = useAppState();
  const anim = useStagger(5);

  const key = `name:${name.n}`;
  const saved = !!moreSaved[key];
  const chips = [name.catId, ...(name.also ?? [])]
    .map((id) => CATS.find((c) => c.id === id))
    .filter(Boolean) as { id: string; title: string }[];

  const count = () => {
    const running = morePractice && morePractice.kind === 'name' && morePractice.id === String(name.n);
    if (!running) {
      startMorePractice({
        kind: 'name',
        id: String(name.n),
        title: name.translit,
        target: null,
        done: 0,
        doneDateKey: dayKey(new Date()),
        day: 1,
        of: 7,
      });
    }
    navigation.navigate('MoreCounter');
  };

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
          accessibilityLabel={saved ? 'Remove bookmark' : 'Bookmark this name'}
          hitSlop={10}
          style={styles.iconBtn}
          onPress={() => toggleMoreSaved(key)}
        >
          <Icon name={saved ? 'bookmark' : 'bookmark_border'} size={22} color={saved ? more.gold : more.ink3} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Share" hitSlop={10} style={styles.iconBtn}>
          <Icon name="ios_share" size={21} color={more.ink3} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Stagger v={anim[0]}>
          <LinearGradient
            colors={[more.warmHeroFrom, more.warmHeroTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroTop}>
              <Text style={styles.heroEyebrow} maxFontSizeMultiplier={CLAMP}>
                99 NAMES
              </Text>
              <Text style={styles.heroEyebrow} maxFontSizeMultiplier={CLAMP}>
                {name.n} OF {NAMES_99.length}
              </Text>
            </View>
            <View style={styles.heroArabicRow}>
              <Diamond />
              <Text style={styles.heroArabic} maxFontSizeMultiplier={1}>
                {name.ar}
              </Text>
              <Diamond />
            </View>
            <Text style={styles.heroName}>{name.translit}</Text>
            <Text style={styles.heroCall}>{note.call}</Text>
          </LinearGradient>
        </Stagger>

        <Stagger v={anim[1]} style={styles.block}>
          <GoldHead label="Meaning" />
          <View style={styles.well}>
            <Text style={styles.prose}>{note.meaning}</Text>
          </View>
        </Stagger>

        <Stagger v={anim[2]} style={styles.block}>
          <GoldHead label="Turned to for" />
          <View style={styles.well}>
            <Text style={styles.prose}>{note.turnedTo}</Text>
            <View style={styles.chips}>
              {chips.map((c) => (
                <Pressable
                  key={c.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${c.title} in Benefits`}
                  onPress={() => navigation.navigate('Category', { catId: c.id })}
                  style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
                >
                  <Text style={styles.chipText} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                    {c.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Stagger>

        <Stagger v={anim[3]} style={styles.block}>
          <GoldPanel label="On counts" glyph="info">
            No fixed number is given here. Where a practice sets one, it comes from the entry in
            Benefits and its own source, not from the name.
          </GoldPanel>
        </Stagger>

        <Stagger v={anim[4]} style={styles.block}>
          <LinkRow onPress={() => navigation.navigate('Library')}>
            Practices that use this name sit on Benefits.
          </LinkRow>
        </Stagger>
      </View>

      <View style={[styles.foot, { paddingBottom: footPad }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Listen"
          style={({ pressed }) => [styles.listen, pressed && styles.pressed]}
        >
          <Icon name="volume_up" size={22} color={more.ink2} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={count}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText} maxFontSizeMultiplier={CLAMP}>
            Count this name
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: more.ground },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: GUTTER - 10, paddingTop: 4 },
  iconBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },

  body: { flex: 1, paddingHorizontal: GUTTER, paddingBottom: 12, gap: 20 },
  block: { gap: 10 },

  hero: { borderRadius: 24, padding: 24, gap: 12, alignItems: 'center', borderWidth: 1, borderColor: more.strong },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch' },
  heroEyebrow: {
    fontFamily: fonts.extrabold,
    fontSize: SIZE.caption,
    letterSpacing: 1.9,
    color: more.gold,
  },
  heroArabicRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroArabic: { ...arabicText(40), color: more.onWarmHero, textAlign: 'center' },
  diamond: { width: 7, height: 7, backgroundColor: more.gold, transform: [{ rotate: '45deg' }] },
  heroName: { ...serifHeading(SIZE.cardTitle + 3), color: more.ink, textAlign: 'center' },
  heroCall: { fontFamily: fonts.regular, fontSize: SIZE.body, color: more.ink3, textAlign: 'center' },

  well: {
    backgroundColor: more.raised,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: more.liftRaised,
  },
  prose: {
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: bodyLeading(SIZE.body),
    color: more.ink2,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 30,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: more.pillBorder,
  },
  chipText: { fontFamily: fonts.semibold, fontSize: SIZE.meta, color: more.ink3 },

  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: GUTTER,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: more.strong,
  },
  listen: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: more.raised,
    borderWidth: 1,
    borderColor: more.pillBorder,
  },
  cta: {
    flex: 1,
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: more.mint,
  },
  ctaText: { fontFamily: fonts.extrabold, fontSize: SIZE.title, color: more.onMint },

  pressed: { opacity: 0.9 },
});
