import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, Pattern, Path, Rect } from 'react-native-svg';

export default function GeometricPattern({
  color = '#B8EDE6',
  opacity = 0.12,
  tile = 52,
  style,
}: {
  color?: string;
  opacity?: number;
  tile?: number;
  style?: ViewStyle;
}) {
  const half = tile / 2;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <Pattern id="wasilaGeoPattern" patternUnits="userSpaceOnUse" width={tile} height={tile}>
          <Path
            d={`M${half} 2 L${tile - 2} ${half} L${half} ${tile - 2} L2 ${half} Z`}
            stroke={color}
            strokeWidth={1.1}
            fill="none"
            opacity={opacity}
          />
          <Path
            d={`M${half} 14 L${tile - 14} ${half} L${half} ${tile - 14} L14 ${half} Z`}
            stroke={color}
            strokeWidth={1.1}
            fill="none"
            opacity={opacity}
          />
          <Path
            d={`M0 0 L10 10 M${tile} 0 L${tile - 10} 10 M0 ${tile} L10 ${tile - 10} M${tile} ${tile} L${tile - 10} ${tile - 10}`}
            stroke={color}
            strokeWidth={1.1}
            opacity={opacity}
          />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill="url(#wasilaGeoPattern)" />
    </Svg>
    </View>
  );
}
