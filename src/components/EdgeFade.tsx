import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/v3/colors';

const CLEAR = '#0A151200';

export default function EdgeFade({ height = 40, ground }: { height?: number; ground?: string }) {
  const solid = ground ?? colors.bgRoot;
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[ground ? `${ground}00` : CLEAR, solid]}
      style={[styles.fade, { height }]}
    />
  );
}

const styles = StyleSheet.create({
  fade: { position: 'absolute', left: 0, right: 0, bottom: '100%' },
});
