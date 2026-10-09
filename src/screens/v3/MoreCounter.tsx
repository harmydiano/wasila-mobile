import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import ProgressRing from '../../components/ProgressRing';
import { GUTTER, LiveDot } from '../../components/v3/more/parts';
import { fonts, serifHeading, arabicText, tabular, SIZE, ONE_OFF, CLAMP, uiLeading } from '../../theme/type';
import { more } from '../../theme/v3/colors';
import { useAppState, dayKey } from '../../state/AppState';
import { NAMES_99 } from '../../data/names99';
import { SALAWAT } from '../../data/salawat';

export default function MoreCounter({ navigation }: any) {
  const { morePractice, creditMorePractice, endMorePractice } = useAppState();

  if (!morePractice) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nothing is being counted.</Text>
          <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.cta}>
            <Text style={styles.ctaText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const p = morePractice;
  const done = p.doneDateKey === dayKey(new Date()) ? p.done : 0;
  const arabic =
    p.kind === 'name'
      ? NAMES_99.find((n) => String(n.n) === p.id)?.ar ?? ''
      : SALAWAT.find((s) => s.id === p.id)?.arTitle ?? '';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={10}
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={23} color={more.ink} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="End this practice"
          hitSlop={10}
          style={styles.iconBtn}
          onPress={() => {
            endMorePractice();
            navigation.goBack();
          }}
        >
          <Icon name="stop_circle" size={22} color={more.ink3} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.eyebrow} maxFontSizeMultiplier={CLAMP}>
          {p.kind === 'name' ? '99 NAMES' : 'SALAWAT'}
        </Text>
        <Text style={styles.title}>{p.title}</Text>
        {!!arabic && (
          <Text style={styles.arabic} maxFontSizeMultiplier={1}>
            {arabic}
          </Text>
        )}

        <ProgressRing
          size={220}
          strokeWidth={10}
          progress={p.target ? Math.min(1, done / p.target) : 0}
          color={more.mint}
          trackColor={more.track}
        >
          <Text style={styles.tally} maxFontSizeMultiplier={1}>
            {done}
          </Text>
          <Text style={styles.of} maxFontSizeMultiplier={CLAMP}>
            {p.target ? `of ${p.target}` : 'counted'}
          </Text>
        </ProgressRing>

        <View style={styles.dayLine}>
          <LiveDot />
          <Text style={styles.dayText} maxFontSizeMultiplier={CLAMP}>
            DAY {p.day} OF {p.of}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Count one"
        onPress={() => creditMorePractice(1)}
        style={({ pressed }) => [styles.cta, styles.ctaWide, pressed && styles.pressed]}
      >
        <Text style={styles.ctaText}>Count</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: more.ground },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: GUTTER - 10, paddingTop: 4 },
  iconBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },

  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: GUTTER },
  eyebrow: { fontFamily: fonts.extrabold, fontSize: SIZE.caption, letterSpacing: 1.9, color: more.gold },
  title: { ...serifHeading(SIZE.cardTitle), color: more.ink, textAlign: 'center' },
  arabic: { ...arabicText(28), color: more.onWarmHero, textAlign: 'center' },
  tally: { fontFamily: fonts.serif, fontSize: ONE_OFF.tally, color: more.ink, ...tabular },
  of: { fontFamily: fonts.semibold, fontSize: SIZE.meta, color: more.meta },
  dayLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayText: {
    fontFamily: fonts.extrabold,
    fontSize: SIZE.caption,
    lineHeight: uiLeading(SIZE.caption),
    letterSpacing: 1.2,
    color: more.mint,
  },

  cta: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: more.mint,
    paddingHorizontal: 28,
  },
  ctaWide: { marginHorizontal: GUTTER, marginBottom: 18 },
  ctaText: { fontFamily: fonts.extrabold, fontSize: SIZE.title, color: more.onMint },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emptyText: { fontFamily: fonts.regular, fontSize: SIZE.body, color: more.ink3 },

  pressed: { opacity: 0.9 },
});
