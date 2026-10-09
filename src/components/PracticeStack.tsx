import React, { useRef, useState, useMemo } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { PanGestureHandler, State, type PanGestureHandlerStateChangeEvent, type PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import ProgressRing from './ProgressRing';
import Icon from './Icon';
import { useTheme, type Palette } from '../theme/theme';
import { fonts } from '../theme/type';

export type Practice = {
  catId: string;
  duaIdx: number;
  title: string;
  sub: string;
  day: number;
  totalDays: number;
  progress: number;
  broken: boolean;
};

const STACK_HEIGHT = 124;
const SWIPE_THRESHOLD = 36;
const MAX_VISIBLE = 3;
const CAPTURE_THRESHOLD = 12;

export default function PracticeStack({
  practices,
  onPressPractice,
}: {
  practices: Practice[];
  onPressPractice: (p: Practice) => void;
}) {
  const { colors, version } = useTheme();
  const v2 = version !== 'v1';
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasSwiped, setHasSwiped] = useState(false);
  const pan = useRef(new Animated.Value(0)).current;
  const count = practices.length;

  const advance = (dir: 1 | -1) => {
    setHasSwiped(true);
    setActiveIndex((i) => (i + dir + count) % count);
  };

  const onGestureEvent = Animated.event<PanGestureHandlerGestureEvent>([{ nativeEvent: { translationY: pan } }], {
    useNativeDriver: false,
  });

  const onHandlerStateChange = (e: PanGestureHandlerStateChangeEvent) => {
    if (e.nativeEvent.oldState !== State.ACTIVE) return;
    const { translationY } = e.nativeEvent;
    if (count > 1 && Math.abs(translationY) > SWIPE_THRESHOLD) {
      const dir: 1 | -1 = translationY < 0 ? 1 : -1;
      Animated.timing(pan, { toValue: dir * -STACK_HEIGHT, duration: 160, useNativeDriver: false }).start(() => {
        pan.setValue(0);
        advance(dir);
      });
      return;
    }
    Animated.spring(pan, { toValue: 0, useNativeDriver: false, bounciness: 6 }).start();
  };

  return (
    <View>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetY={[-CAPTURE_THRESHOLD, CAPTURE_THRESHOLD]}
        failOffsetX={[-20, 20]}
      >
        <Animated.View style={{ height: STACK_HEIGHT }}>
          {practices.map((p, i) => {
          const offset = (i - activeIndex + count) % count;
          if (offset >= MAX_VISIBLE) return null;
          const isFront = offset === 0;
          return (
            <Animated.View
              key={p.title}
              pointerEvents={isFront ? 'auto' : 'none'}
              style={[
                styles.cardWrap,
                {
                  zIndex: MAX_VISIBLE - offset,
                  opacity: 1 - offset * 0.32,
                  transform: [{ translateY: isFront ? pan : offset * 10 }, { scale: 1 - offset * 0.05 }],
                },
              ]}
            >
              <Pressable style={styles.practiceCard} onPress={() => onPressPractice(p)}>
                <ProgressRing size={v2 ? 64 : 52} strokeWidth={v2 ? 6 : 5} progress={p.progress} color={p.broken ? colors.gold : colors.accent}>
                  <Text style={[styles.ringPct, { color: p.broken ? colors.gold : colors.accent }]}>{Math.round(p.progress * 100)}%</Text>
                </ProgressRing>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dayLabel, { color: p.broken ? colors.gold : '#7FCFC3' }]} numberOfLines={1} ellipsizeMode="tail">
                    {p.broken ? `Missed yesterday · day ${p.day} of ${p.totalDays}` : p.totalDays ? `Day ${p.day} of ${p.totalDays}` : `Day ${p.day} · ongoing`}
                  </Text>
                  <Text style={styles.practiceTitle} numberOfLines={1} ellipsizeMode="tail">{p.title}</Text>
                  <Text style={styles.practiceSub} numberOfLines={1} ellipsizeMode="tail">{p.sub}</Text>
                </View>
                {p.broken ? (
                  <Pressable style={styles.restartBtn} onPress={() => onPressPractice(p)}>
                    <Text style={styles.restartText}>Restart</Text>
                  </Pressable>
                ) : (
                  <Icon name="play_circle" size={26} color={colors.accent} />
                )}
              </Pressable>
            </Animated.View>
          );
        })}
        </Animated.View>
      </PanGestureHandler>

      {count > 1 && (
        <>
          <View style={v2 ? styles.pagerRowV2 : undefined}>
            <View style={styles.dotsRow}>
              {practices.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
              ))}
            </View>
            {!hasSwiped && !v2 && <Text style={styles.hint}>Swipe for more</Text>}
          </View>
        </>
      )}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  cardWrap: { position: 'absolute', left: 0, right: 0, top: 0 },
  practiceCard: { flexDirection: 'row', gap: 14, alignItems: 'center', padding: 16, backgroundColor: colors.bgCard, borderRadius: 20 },
  ringPct: { fontFamily: fonts.extrabold, fontSize: 11 },
  dayLabel: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' },
  practiceTitle: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.textPrimary, marginTop: 3 },
  practiceSub: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
  restartBtn: { borderWidth: 1, borderColor: colors.brokenStreakBorder, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 },
  restartText: { fontFamily: fonts.bold, fontSize: 11.5, color: colors.gold },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 14 },
  pagerRowV2: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.outlineBorder },
  dotActive: { width: 22, backgroundColor: colors.accent },
  hint: { fontFamily: fonts.semibold, fontSize: 11, color: colors.textFaint, textAlign: 'center', marginTop: 8 },
});
