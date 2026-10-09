import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import WasilaMark from '../../components/v3/WasilaMark';
import { fonts, serifHeading, SIZE, ONE_OFF, uiLeading, eyebrow } from '../../theme/type';
import { colors, v3 } from '../../theme/v3/colors';

const NIGHT_BG = require('../../../design-assets/v3/bg_img_night.png');

export default function Splash({ progress = 0, onRetry }: { progress?: number; onRetry?: () => void }) {
  const pct = Math.max(0, Math.min(1, progress));
  const width = useRef(new Animated.Value(pct)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: pct,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct, width]);

  return (
    <View style={styles.root}>
      <Image source={NIGHT_BG} style={styles.bg} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(10,21,18,0.72)', 'rgba(10,21,18,0.34)', 'rgba(10,21,18,0.86)', colors.bgRoot]}
        locations={[0, 0.34, 0.78, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.centre}>
        <WasilaMark size={104} />
        <View style={styles.wordmarkBlock}>
          <Text style={styles.title}>Wasīla</Text>
          <Text style={styles.tagline}>The means by which you draw near</Text>
        </View>
      </View>

      {onRetry ? (
        <View style={styles.footer}>
          <Text style={styles.offline}>Connect to the internet to set up Wasīla. After this, it works offline.</Text>
          <Pressable onPress={onRetry} style={({ pressed }) => [styles.retry, pressed && { opacity: 0.85 }]}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
      <View style={styles.footer}>
        <View style={styles.barTrack}>
          <Animated.View
            style={[
              styles.barFill,
              { width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
            ]}
          />
        </View>
        <Text style={styles.bismillah}>Bismillāh</Text>
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  bg: {
    position: 'absolute',
    top: '-14%',
    left: '-8%',
    width: '124%',
    height: '128%',
  },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22, paddingHorizontal: 40 },
  wordmarkBlock: { alignItems: 'center', gap: 9 },
  title: { ...serifHeading(ONE_OFF.wordmark), letterSpacing: 0, color: colors.textPrimary },
  tagline: { fontFamily: fonts.semibold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), letterSpacing: 0.26, color: v3.ink1, textAlign: 'center' },
  footer: { paddingHorizontal: 40, paddingBottom: 54, alignItems: 'center', gap: 16 },
  barTrack: { width: 132, height: 3, borderRadius: 3, backgroundColor: 'rgba(219,230,224,0.14)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, backgroundColor: colors.accent },
  bismillah: eyebrow(v3.ink3),
  offline: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: v3.ink1, textAlign: 'center' },
  retry: { minHeight: 48, paddingHorizontal: 28, borderRadius: 999, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  retryText: { fontFamily: fonts.bold, fontSize: SIZE.title, color: colors.onMintText },
});
