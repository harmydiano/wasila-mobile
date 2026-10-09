import React from 'react';
import { View, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/v3/colors';

const WELCOME_BG = require('../../../design-assets/v3/img_bg_welcome.png');
const ASPECT = 1383 / 1137;

export default function WelcomePlate({ heightFactor = 1 }: { heightFactor?: number }) {
  const { width } = useWindowDimensions();
  const imageHeight = width * ASPECT * heightFactor;
  const scrimHeight = imageHeight + 40;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={WELCOME_BG}
        style={{ position: 'absolute', top: 0, left: 0, width, height: imageHeight }}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[
          'rgba(10,21,18,0.30)', 'rgba(10,21,18,0.22)', 'rgba(10,21,18,0.68)',
          'rgba(10,21,18,0.86)', colors.bgRoot,
        ]}
        locations={[0, 0.38, 0.62, 0.82, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: scrimHeight }}
      />
    </View>
  );
}
