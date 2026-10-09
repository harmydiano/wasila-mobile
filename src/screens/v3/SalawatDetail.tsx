import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../../components/Icon';
import ProgressRing from '../../components/ProgressRing';
import { Stagger, useStagger } from '../../components/v3/Stagger';
import { GoldPanel, GUTTER, LinkRow } from '../../components/v3/more/parts';
import { fonts, serifHeading, arabicText, tabular, SIZE, CLAMP, bodyLeading } from '../../theme/type';
import { more } from '../../theme/v3/colors';
import { salawatAt } from '../../data/salawat';
import { useAppState, dayKey } from '../../state/AppState';

function Diamond() {
  return <View style={styles.diamond} />;
}

export default function SalawatDetail({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const footPad = Math.max(insets.bottom, 12) + 10;
  const form = salawatAt(route?.params?.id ?? 'fatih');
  const { moreSaved, toggleMoreSaved, morePractice, startMorePractice } = useAppState();
  const anim = useStagger(5);

  const key = `form:${form.id}`;
  const saved = !!moreSaved[key];
  const live = morePractice && morePractice.kind === 'salawat' && morePractice.id === form.id ? morePractice : null;
  const done = live && live.doneDateKey === dayKey(new Date()) ? live.done : 0;
  const target = live?.target ?? form.daily;

  const openCounter = () => {
    if (!live) {
      startMorePractice({
        kind: 'salawat',
        id: form.id,
        title: form.title,
        target: form.daily,
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
          accessibilityLabel={saved ? 'Remove bookmark' : 'Bookmark this form'}
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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Stagger v={anim[0]}>
          <LinearGradient
            colors={[more.warmHeroFrom, more.warmHeroTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroTop}>
              <Text style={styles.heroEyebrow} maxFontSizeMultiplier={CLAMP}>
                SALAWAT
              </Text>
              {!!form.daily && (
                <Text style={styles.heroEyebrow} maxFontSizeMultiplier={CLAMP}>
                  {form.daily.toLocaleString()} A DAY
                </Text>
              )}
            </View>
            <Text style={styles.heroTitle}>{form.title}</Text>
            <View style={styles.heroArabicRow}>
              <Diamond />
              <Text style={styles.heroArTitle} maxFontSizeMultiplier={1}>
                {form.arTitle}
              </Text>
              <Diamond />
            </View>
            {!!form.arabic && (
              <Text style={styles.heroArabic} maxFontSizeMultiplier={1}>
                {form.arabic}
              </Text>
            )}
          </LinearGradient>
        </Stagger>

        {form.arabic ? (
          <Stagger v={anim[1]}>
            <View style={styles.well}>
              <View style={styles.wellBlock}>
                <Text style={styles.label} maxFontSizeMultiplier={CLAMP}>
                  TRANSLITERATION
                </Text>
                <Text style={styles.prose}>{form.translit}</Text>
              </View>
              <View style={[styles.wellBlock, styles.wellDivider]}>
                <Text style={styles.label} maxFontSizeMultiplier={CLAMP}>
                  TRANSLATION
                </Text>
                <Text style={styles.prose}>{form.translation}</Text>
              </View>
            </View>
          </Stagger>
        ) : (
          <Stagger v={anim[1]}>
            <View style={styles.absence}>
              <Icon name="menu_book" size={20} color={more.meta} />
              <Text style={styles.absenceText}>
                The wording is not printed here. This form is taken from a teacher or from a printed
                wird, and Wasīla names it rather than setting a text it cannot source.
              </Text>
            </View>
          </Stagger>
        )}

        <Stagger v={anim[2]}>
          <GoldPanel label="Where it comes from">{form.attribution}</GoldPanel>
        </Stagger>

        <Stagger v={anim[3]}>
          <View style={styles.countRow}>
            <ProgressRing
              size={54}
              strokeWidth={6}
              progress={target ? Math.min(1, done / target) : 0}
              color={more.mint}
              trackColor={more.track}
            >
              <Text style={styles.ringTally} maxFontSizeMultiplier={1}>
                {done}
              </Text>
              {!!target && (
                <Text style={styles.ringOf} maxFontSizeMultiplier={1}>
                  of {target}
                </Text>
              )}
            </ProgressRing>
            <View style={{ flex: 1 }}>
              <Text style={styles.countTitle}>Tonight's count</Text>
              <Text style={styles.countMeta}>
                {live
                  ? `Day ${live.day} of ${live.of}. The window closes at Fajr.`
                  : 'Nothing running. The window closes at Fajr.'}
              </Text>
            </View>
          </View>
        </Stagger>

        <Stagger v={anim[4]}>
          <LinkRow onPress={() => navigation.navigate('Library')}>
            What this form is kept for sits on Benefits, with its source.
          </LinkRow>
        </Stagger>
      </ScrollView>

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
          onPress={openCounter}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText} maxFontSizeMultiplier={CLAMP}>
            Open the counter
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

  scroll: { paddingHorizontal: GUTTER, paddingTop: 8, paddingBottom: 28, gap: 18 },

  hero: { borderRadius: 26, padding: 22, gap: 14, borderWidth: 1, borderColor: more.strong },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between' },
  heroEyebrow: { fontFamily: fonts.extrabold, fontSize: SIZE.caption, letterSpacing: 1.9, color: more.gold },
  heroTitle: { ...serifHeading(SIZE.cardTitle), color: more.ink },
  heroArabicRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
  heroArTitle: { ...arabicText(20), color: more.gold },
  diamond: { width: 7, height: 7, backgroundColor: more.gold, transform: [{ rotate: '45deg' }] },
  heroArabic: { ...arabicText(27), color: more.onWarmHero, textAlign: 'center' },

  well: {
    backgroundColor: more.raised,
    borderRadius: 20,
    borderTopWidth: 1,
    borderTopColor: more.liftRaised,
    overflow: 'hidden',
  },
  wellBlock: { padding: 16, gap: 8 },
  wellDivider: { borderTopWidth: 1, borderTopColor: more.rowDivider },
  label: { fontFamily: fonts.extrabold, fontSize: SIZE.caption, letterSpacing: 1.9, color: more.gold },
  prose: {
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: bodyLeading(SIZE.body),
    color: more.ink2,
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

  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: more.raised,
    borderRadius: 20,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: more.liftRaised,
  },
  ringTally: { fontFamily: fonts.bold, fontSize: SIZE.body, color: more.ink, ...tabular },
  ringOf: { fontFamily: fonts.regular, fontSize: 9, color: more.meta },
  countTitle: { ...serifHeading(SIZE.title), color: more.ink },
  countMeta: { fontFamily: fonts.regular, fontSize: SIZE.meta, color: more.meta, marginTop: 3 },

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
