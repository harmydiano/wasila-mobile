import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, Polygon, Rect, G } from 'react-native-svg';
import { useTheme, type Palette } from '../theme/theme';
import { fonts } from '../theme/type';

const SIZE = 240;
const CENTER = SIZE / 2;
const DISC_R = 100;
const TICK_OUTER_R = DISC_R;
const LABEL_R = DISC_R - 22;
const NEEDLE_TIP_R = DISC_R * 0.95;
const NEEDLE_TAIL_R = DISC_R * 0.55;
const NEEDLE_HALF_WIDTH = 9;
const BADGE_R_POS = DISC_R * 1.04;
const BADGE_R = 16;

const CARDINALS: Record<number, string> = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' };

function pointAt(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CENTER + r * Math.sin(rad), y: CENTER - r * Math.cos(rad) };
}

function Ticks() {
  const { colors } = useTheme();
  const items = [];
  for (let angle = 0; angle < 360; angle += 10) {
    const isCardinal = angle % 90 === 0;
    const isMajor = angle % 30 === 0;
    const len = isCardinal ? 16 : isMajor ? 11 : 6;
    const inner = pointAt(angle, TICK_OUTER_R - len);
    const outer = pointAt(angle, TICK_OUTER_R);
    items.push(
      <Line
        key={angle}
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        stroke={isCardinal ? colors.accent : colors.outlineBorder}
        strokeWidth={isCardinal ? 2.5 : 1.25}
        strokeLinecap="round"
      />
    );
  }
  return <>{items}</>;
}

function Labels() {
  const { colors } = useTheme();
  const items = [];
  for (let angle = 0; angle < 360; angle += 45) {
    const p = pointAt(angle, LABEL_R);
    const cardinal = CARDINALS[angle];
    items.push(
      <SvgText
        key={angle}
        x={p.x}
        y={p.y}
        fontSize={cardinal ? 17 : 11}
        fontWeight={cardinal ? '800' : '700'}
        fill={cardinal ? colors.textHeadline : colors.textMuted}
        textAnchor="middle"
        alignmentBaseline="central"
        transform={cardinal ? undefined : `rotate(${angle} ${p.x} ${p.y})`}
      >
        {cardinal ?? String(angle)}
      </SvgText>
    );
  }
  return <>{items}</>;
}

function Needle({ deg, aligned }: { deg: number; aligned: boolean }) {
  const { colors } = useTheme();
  const tip = pointAt(0, NEEDLE_TIP_R);
  const tail = pointAt(180, NEEDLE_TAIL_R);
  const right = pointAt(90, NEEDLE_HALF_WIDTH);
  const left = pointAt(270, NEEDLE_HALF_WIDTH);
  const rightHalf = `${tip.x},${tip.y} ${right.x},${right.y} ${tail.x},${tail.y}`;
  const leftHalf = `${tip.x},${tip.y} ${left.x},${left.y} ${tail.x},${tail.y}`;
  const bright = aligned ? colors.mint : colors.accent;
  const dark = aligned ? colors.accent : colors.primary;
  return (
    <>
      <Polygon points={rightHalf} fill={bright} stroke={colors.bgRoot} strokeWidth={0.5} transform={`rotate(${deg} ${CENTER} ${CENTER})`} />
      <Polygon points={leftHalf} fill={dark} stroke={colors.bgRoot} strokeWidth={0.5} transform={`rotate(${deg} ${CENTER} ${CENTER})`} />
    </>
  );
}

function KaabaBadge({ deg }: { deg: number }) {
  const { colors } = useTheme();
  const p = pointAt(deg, BADGE_R_POS);
  return (
    <>
      <Circle cx={p.x} cy={p.y} r={BADGE_R} fill={colors.textPrimary} stroke={colors.gold} strokeWidth={2} />
      <Rect x={p.x - 7} y={p.y - 6} width={14} height={12} rx={1.5} fill={colors.bgRoot} />
      <Rect x={p.x - 7} y={p.y - 2.5} width={14} height={3} fill={colors.gold} />
    </>
  );
}

export default function QiblaCompass({ dialRotation, needleDeg, aligned }: { dialRotation: number; needleDeg: number; aligned: boolean }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const topMarker = pointAt(0, DISC_R + 12);
  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE + 24} viewBox={`0 0 ${SIZE} ${SIZE + 24}`}>
        <Polygon
          points={`${topMarker.x - 5},${topMarker.y + 10} ${topMarker.x + 5},${topMarker.y + 10} ${topMarker.x},${topMarker.y}`}
          fill={aligned ? colors.accent : colors.textFaint}
        />

        <Circle cx={CENTER} cy={CENTER} r={DISC_R} fill={colors.bgCardAlt} stroke={aligned ? colors.accent : colors.outlineBorder} strokeWidth={1.5} />
        <Circle cx={CENTER} cy={CENTER} r={DISC_R - 28} fill="none" stroke={colors.divider} strokeWidth={1} />

        <G transform={`rotate(${dialRotation} ${CENTER} ${CENTER})`}>
          <Ticks />
          <Labels />
        </G>
        <Needle deg={needleDeg} aligned={aligned} />
        <Circle cx={CENTER} cy={CENTER} r={5} fill={colors.textPrimary} />
        <KaabaBadge deg={needleDeg} />
      </Svg>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  wrap: { width: SIZE, height: SIZE + 24, alignItems: 'center', justifyContent: 'center' },
});
