import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Image, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts, ARABIC_LINE_HEIGHT } from '../theme/type';
import Button from '../components/Button';

const LOGOTYPE = require('../../assets/splash-icon.png');

const { width: SCREEN_W } = Dimensions.get('window');

const SLIDES = [
  {
    ar: 'الدُّعَاءُ سِلاَحُ الْمُؤْمِنِ',
    en: 'Duʿāʾ is the weapon of the believer.',
    source: 'Hadith',
    body: 'Not a last resort. The first thing you reach for — for provision, for protection, for the thing you cannot fix yourself.',
  },
  {
    ar: 'ادْعُونِي أَسْتَجِبْ لَكُمْ',
    en: 'Call upon Me; I will answer you.',
    source: 'Qurʾān · Ghāfir 40:60',
    body: 'Every benefit here carries its name, its count and its timing. Plain instructions, so you always know what to recite.',
  },
  {
    ar: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    en: 'In the remembrance of Allah do hearts find rest.',
    source: 'Qurʾān · ar-Raʿd 13:28',
    body: 'Keep the count, hold the habit, and return whenever you need to. Wasīla keeps your place.',
  },
];

export default function Intro({ navigation }: any) {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const isLast = index === SLIDES.length - 1;

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W));
  };

  const onCta = () => {
    if (isLast) {
      navigation.replace('Onboarding');
      return;
    }
    const next = index + 1;
    scrollRef.current?.scrollTo({ x: next * SCREEN_W, animated: true });
    setIndex(next);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.markWrap}>
        <Image source={LOGOTYPE} style={styles.mark} resizeMode="contain" />
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        style={{ flexGrow: 0 }}
      >
        {SLIDES.map((s) => (
          <View key={s.source} style={[styles.slide, { width: SCREEN_W }]}>
            <Text style={styles.arabic}>{s.ar}</Text>
            <View style={styles.rule} />
            <Text style={styles.en}>{s.en}</Text>
            <Text style={styles.source}>{s.source}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ flex: 1 }} />

      <View style={styles.dotsRow}>
        {SLIDES.map((s, i) => (
          <View key={s.source} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
        <Button label={isLast ? 'Begin' : 'Continue'} onPress={onCta} />
      </View>
    </SafeAreaView>
  );
}

const ARABIC_SIZE = 30;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  markWrap: { alignItems: 'center', paddingTop: 28, paddingBottom: 8 },
  mark: { width: 132, height: 62 },
  slide: { paddingHorizontal: 32, paddingTop: 28, alignItems: 'center' },
  arabic: {
    fontFamily: fonts.arabic,
    fontSize: ARABIC_SIZE,
    lineHeight: ARABIC_SIZE * ARABIC_LINE_HEIGHT,
    color: colors.accent,
    textAlign: 'center',
    includeFontPadding: false,
  },
  rule: { width: 46, height: 1, backgroundColor: colors.outlineBorder, marginTop: 18, marginBottom: 18 },
  en: { fontFamily: fonts.extrabold, fontSize: 21, lineHeight: 29, color: colors.textHeadline, textAlign: 'center', letterSpacing: -0.3 },
  source: { fontFamily: fonts.semibold, fontSize: 11.5, letterSpacing: 0.6, color: colors.goldMeta, textAlign: 'center', marginTop: 12 },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.textMuted, textAlign: 'center', marginTop: 22, maxWidth: 320 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingBottom: 20 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.divider },
  dotActive: { width: 22, backgroundColor: colors.accent },
  footer: { paddingHorizontal: 32, paddingTop: 4 },
});
