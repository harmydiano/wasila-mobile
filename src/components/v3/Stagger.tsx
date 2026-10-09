import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';

const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

let cachedReduceMotion = false;
AccessibilityInfo.isReduceMotionEnabled()
  .then((v) => {
    cachedReduceMotion = v;
  })
  .catch(() => {});
AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => {
  cachedReduceMotion = v;
});

export function useReduceMotion(): boolean {
  const [reduced] = useState(() => cachedReduceMotion);
  return reduced;
}

export function useStagger(count: number): Animated.Value[] {
  const values = useRef(Array.from({ length: count }, () => new Animated.Value(0))).current;
  useEffect(() => {
    Animated.stagger(
      60,
      values.map((v) =>
        Animated.timing(v, { toValue: 1, duration: 300, easing: EASE, useNativeDriver: true })
      )
    ).start();
  }, [values]);
  return values;
}

export function Stagger({
  v,
  rise = 20,
  style,
  children,
}: {
  v: Animated.Value;
  rise?: number;
  style?: any;
  children: React.ReactNode;
}) {
  const reduced = useReduceMotion();
  const translateY = useRef(
    v.interpolate({ inputRange: [0, 1], outputRange: [reduced ? 0 : rise, 0] })
  ).current;

  return (
    <Animated.View style={[style, { opacity: v, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
