import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useReduceMotion } from '../../components/v3/Stagger';
import WasilaMark from '../../components/v3/WasilaMark';
import { fonts, serifHeading, SIZE, uiLeading, bodyLeading, eyebrow } from '../../theme/type';
import { colors, v3 } from '../../theme/v3/colors';
import { CATS } from '../../data/content';
import { useAppState } from '../../state/AppState';
import { usePrayer } from '../../state/usePrayer';
import { formatGregorian } from '../../utils/hijri';
import { useHijriDate } from '../../state/useHijriDate';
import { afterPhraseOf, windowOpensPhrase } from '../../utils/windowCopy';
import { nightForDate, endDateLabel } from '../../utils/practice';

const NIGHT_BG = require('../../../design-assets/v3/bg_img_night.png');

const DOT_START = 300;
const DOT_STEP = 80;
const BAR_START = 700;
const BAR_DURATION = 700;

const OVERSHOOT = Easing.bezier(0.34, 1.56, 0.64, 1);

function NightDot({ delay, state, reduced }: { delay: number; state: 'full' | 'part' | 'empty'; reduced: boolean }) {
  const fill = state === 'empty' ? null : state;
  const v = useRef(new Animated.Value(fill ? 0 : 1)).current;

  useEffect(() => {
    if (!fill) return;
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(v, {
        toValue: 1,
        duration: 180,
        easing: reduced ? Easing.linear : OVERSHOOT,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fill, delay, v, reduced]);

  return (
    <View style={styles.dotTrack}>
      {fill && (
        <Animated.View
          style={[
            styles.dotFill,
            fill === 'part' && styles.dotFillPart,
            { opacity: v, transform: reduced ? [] : [{ scaleX: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] },
          ]}
        />
      )}
    </View>
  );
}

export default function Restore({ navigation }: any) {
  const reduced = useReduceMotion();
  const { practice, authName } = useAppState();
  const { placeLabel, rows } = usePrayer();
  const bar = useRef(new Animated.Value(0)).current;

  const today = new Date();
  const hijri = useHijriDate();

  const cat = practice ? CATS.find((c) => c.id === practice.catId) : null;
  const dua = cat && practice ? cat.duas[practice.duaIdx] : null;
  const night = practice ? nightForDate(practice.startedDateKey, practice.totalNights, today) : 1;
  const totalNights = practice?.totalNights ?? 7;
  const endLabel = practice ? endDateLabel(practice.startedDateKey, practice.totalNights) : '';

  const timingRow = dua ? rows.find((r) => dua.tm.includes(r.name)) ?? null : null;
  const windowLine = !dua
    ? ''
    : timingRow?.current
      ? `${dua.tr} · ${practice?.target ?? ''} ${afterPhraseOf(dua.tm)}. Tonight's window is open now.`
      : `${dua.tr} · ${practice?.target ?? ''} ${afterPhraseOf(dua.tm)}. Tonight's window opens ${windowOpensPhrase(
          dua.tm,
          timingRow?.time,
          false
        )}.`;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(BAR_START),
      Animated.timing(bar, { toValue: 1, duration: BAR_DURATION, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start();
    const t = setTimeout(() => navigation.replace('Home'), BAR_START + BAR_DURATION);
    return () => clearTimeout(t);
  }, [bar, navigation]);

  return (
    <View style={styles.root}>
      <Image source={NIGHT_BG} style={styles.bg} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(10,21,18,0.74)', 'rgba(10,21,18,0.38)', 'rgba(10,21,18,0.88)', colors.bgRoot]}
        locations={[0, 0.32, 0.76, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.centre}>
        <WasilaMark size={112} />
        <View style={styles.greetBlock}>
          <Text style={styles.greeting}>
            {authName ? `Welcome back, ${authName}` : 'Welcome back'}
          </Text>
          <Text style={styles.dateLine}>
            {[formatGregorian(today).split(',')[0], hijri.full, placeLabel].filter(Boolean).join(' · ')}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        {practice && dua && (
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <View style={styles.liveDot} />
              <Text style={styles.eyebrow} numberOfLines={1}>
                {`Running · night ${night} of ${totalNights} · ends ${endLabel}`}
              </Text>
            </View>
            <Text style={styles.cardTitle}>{dua.t.replace(/ in \d+ days?$/i, '')}</Text>
            <View style={styles.dotsRow}>
              {Array.from({ length: totalNights }, (_, i) => (
                <NightDot
                  key={i}
                  delay={DOT_START + i * DOT_STEP}
                  state={i < night - 1 ? 'full' : i === night - 1 ? 'part' : 'empty'}
                  reduced={reduced}
                />
              ))}
            </View>
            <Text style={styles.cardBody}>{windowLine}</Text>
          </View>
        )}

        <View style={styles.handoff}>
          <View style={styles.barTrack}>
            <Animated.View
              style={[
                styles.barFill,
                { width: bar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
              ]}
            />
          </View>
          <Text style={styles.handoffLabel}>Restoring your tally</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  bg: { position: 'absolute', top: '-14%', left: '-8%', width: '124%', height: '128%' },

  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 34 },
  greetBlock: { alignItems: 'center', gap: 7 },
  greeting: { ...serifHeading(SIZE.display), letterSpacing: 0, color: colors.textPrimary },
  dateLine: { fontFamily: fonts.semibold, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: v3.ink2 },

  footer: { paddingHorizontal: 22, paddingBottom: 30, gap: 14 },
  card: {
    padding: 16, backgroundColor: v3.surfaceHero, borderWidth: 1, borderColor: v3.borderStrong,
    borderRadius: 22, gap: 12,
    shadowColor: '#000000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.42,
    shadowRadius: 30, elevation: 12,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent },
  eyebrow: { ...eyebrow(colors.accent), flex: 1 },
  cardTitle: { ...serifHeading(SIZE.heading), letterSpacing: 0, color: colors.textPrimary },
  dotsRow: { flexDirection: 'row', gap: 5 },
  dotTrack: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#22403A', overflow: 'hidden' },
  dotFill: { flex: 1, borderRadius: 3, backgroundColor: colors.accent },
  dotFillPart: { backgroundColor: 'rgba(123,224,190,0.55)' },
  cardBody: { fontFamily: fonts.semibold, fontSize: SIZE.meta, lineHeight: bodyLeading(SIZE.meta), color: v3.ink1 },

  handoff: { alignItems: 'center', gap: 14, paddingTop: 2 },
  barTrack: { width: 132, height: 3, borderRadius: 3, backgroundColor: 'rgba(219,230,224,0.14)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, backgroundColor: colors.accent },
  handoffLabel: eyebrow(v3.ink3),
});
