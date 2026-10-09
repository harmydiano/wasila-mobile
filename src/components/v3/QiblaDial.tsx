import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Polygon,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { colors, qibla } from '../../theme/v3/colors';
import { fonts } from '../../theme/type';

const BOX = 360;
const C = BOX / 2;
const R = 132;
const BADGE_ORBIT = R + 22;
const BADGE_R = 20;

const TICK_OUTER = R * 0.95;
const TICK_MINOR_INNER = R * 0.86;
const TICK_MAJOR_INNER = R * 0.78;
const DEGREE_R = R * 0.74;
const CARDINAL_R = R * 0.577;
const RULE_OUTER = R * 0.59;
const RULE_INNER = R * 0.45;

const NEEDLE_HALF_LENGTH = R * 1.06;
const NEEDLE_HALF_WIDTH = 24;

const CARDINALS: Record<number, string> = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' };

function pointAt(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: C + r * Math.sin(rad), y: C - r * Math.cos(rad) };
}

const TICKS = (() => {
  const items: React.ReactElement[] = [];
  for (let angle = 0; angle < 360; angle += 6) {
    const major = angle % 30 === 0;
    const inner = pointAt(angle, major ? TICK_MAJOR_INNER : TICK_MINOR_INNER);
    const outer = pointAt(angle, TICK_OUTER);
    items.push(
      <Line
        key={angle}
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        stroke={qibla.engraved}
        strokeWidth={major ? 2.4 : 1}
        strokeLinecap="butt"
      />
    );
  }
  return items;
})();

const NUMERALS = (() => {
  const items: React.ReactElement[] = [];
  for (let angle = 0; angle < 360; angle += 45) {
    const p = pointAt(angle, DEGREE_R);
    items.push(
      <SvgText
        key={angle}
        x={p.x}
        y={p.y}
        fontSize={11}
        fontFamily={fonts.bold}
        fill={qibla.degrees}
        textAnchor="middle"
        alignmentBaseline="central"
        transform={`rotate(${angle} ${p.x} ${p.y})`}
      >
        {angle === 0 ? '360°' : `${angle}°`}
      </SvgText>
    );
  }
  return items;
})();

const LETTERS = (() => {
  const items: React.ReactElement[] = [];
  for (const key of Object.keys(CARDINALS)) {
    const angle = Number(key);
    const p = pointAt(angle, CARDINAL_R);
    items.push(
      <SvgText
        key={angle}
        x={p.x}
        y={p.y}
        fontSize={27}
        fontFamily={fonts.bold}
        fill={qibla.engraved}
        textAnchor="middle"
        alignmentBaseline="central"
      >
        {CARDINALS[angle]}
      </SvgText>
    );
  }
  return items;
})();

function KaabaBadge({ deg }: { deg: number }) {
  const p = pointAt(deg, BADGE_ORBIT);
  return (
    <G>
      <Circle cx={p.x} cy={p.y} r={BADGE_R} fill={qibla.badgeFace} stroke={colors.gold} strokeWidth={2.5} />
      <Rect
        x={p.x - 10}
        y={p.y - 8.5}
        width={20}
        height={17}
        rx={2}
        fill={colors.bgRoot}
        stroke={colors.borderStrong}
        strokeWidth={1}
      />
      <Rect x={p.x - 10} y={p.y - 0.5} width={20} height={4} fill={colors.gold} />
    </G>
  );
}

export default function QiblaDial({
  dialRotation,
  needleDeg,
  aligned,
  size = 300,
}: {
  dialRotation: number;
  needleDeg: number;
  aligned: boolean;
  size?: number;
}) {
  const badge = useMemo(() => <KaabaBadge deg={needleDeg} />, [needleDeg]);
  const markerTop = C - R - 26;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View style={[styles.shadow, { width: (R * 2 * size) / BOX, height: (R * 2 * size) / BOX }]} />
      <Svg width={size} height={size} viewBox={`0 0 ${BOX} ${BOX}`}>
        <Defs>
          <LinearGradient id="needle" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={qibla.needleLight} />
            <Stop offset="0.5" stopColor={qibla.needleMid} />
            <Stop offset="1" stopColor={qibla.needleDark} />
          </LinearGradient>
        </Defs>

        <Rect
          x={C - 3}
          y={markerTop}
          width={6}
          height={30}
          rx={3}
          fill={aligned ? colors.accent : qibla.marker}
        />

        <Circle cx={C} cy={C} r={R} fill={qibla.face} />

        <G transform={`rotate(${dialRotation} ${C} ${C})`}>
          {TICKS}
          {NUMERALS}
          {LETTERS}
          <Circle cx={C} cy={C} r={RULE_OUTER} fill="none" stroke={qibla.ring} strokeWidth={1} />
          <Circle cx={C} cy={C} r={RULE_INNER} fill="none" stroke={qibla.ring} strokeWidth={1} />
        </G>

        <G transform={`rotate(${needleDeg} ${C} ${C})`}>
          <Polygon
            points={[
              `${C},${C - NEEDLE_HALF_LENGTH}`,
              `${C + NEEDLE_HALF_WIDTH},${C}`,
              `${C},${C + NEEDLE_HALF_LENGTH}`,
              `${C - NEEDLE_HALF_WIDTH},${C}`,
            ].join(' ')}
            fill="url(#needle)"
          />
        </G>
        <Circle cx={C} cy={C} r={6} fill={aligned ? colors.accent : qibla.hub} />

        {badge}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  shadow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.bgRoot,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
});
