import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Rect, G } from 'react-native-svg';
import Icon from '../../Icon';
import { fonts, serifHeading, SIZE, CLAMP, uiLeading, bodyLeading } from '../../../theme/type';
import { more, moreRule } from '../../../theme/v3/colors';

export const TITLE = SIZE.display;
export const TITLE_ROOT = 34;

export const GUTTER = 24;

export function GoldRule({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <LinearGradient
      colors={[...moreRule.title]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.titleRule, style]}
    />
  );
}

export function TitleBlock({
  title,
  meta,
  size = TITLE,
  onBack,
  action,
  onAction,
  actionLabel,
  right,
}: {
  title: string;
  meta?: string;
  size?: number;
  onBack?: () => void;
  action?: string;
  onAction?: () => void;
  actionLabel?: string;
  right?: React.ReactNode;
}) {
  return (
    <View>
      <View style={styles.titleRow}>
        {onBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={10}
            style={styles.iconBtn}
            onPress={onBack}
          >
            <Icon name="arrow_back" size={23} color={more.ink} />
          </Pressable>
        )}
        <View style={styles.titleCol}>
          <Text style={[styles.title, { fontSize: size, lineHeight: Math.round(size * 1.12) }]}>
            {title}
          </Text>
          {!!meta && (
            <Text style={styles.titleMeta} maxFontSizeMultiplier={CLAMP}>
              {meta}
            </Text>
          )}
        </View>
        {right}
        {!right && !!action && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionLabel ?? action}
            hitSlop={10}
            style={styles.iconBtn}
            onPress={onAction}
          >
            <Icon name={action} size={22} color={more.ink3} />
          </Pressable>
        )}
      </View>
      <GoldRule />
    </View>
  );
}

export function GoldHead({
  label,
  count,
  style,
}: {
  label: string;
  count?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.headRow, style]}>
      <Text style={styles.headLabel} maxFontSizeMultiplier={CLAMP}>
        {label}
      </Text>
      <LinearGradient
        colors={[...moreRule.section]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headRule}
      />
      {!!count && (
        <Text style={styles.headCount} maxFontSizeMultiplier={CLAMP}>
          {count}
        </Text>
      )}
    </View>
  );
}

export function Well({
  children,
  tone = 'raised',
  style,
}: {
  children: React.ReactNode;
  tone?: 'raised' | 'sunk' | 'bordered';
  style?: StyleProp<ViewStyle>;
}) {
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <View
      style={[
        styles.well,
        tone === 'sunk' && styles.wellSunk,
        tone === 'bordered' && styles.wellBordered,
        style,
      ]}
    >
      {rows.map((child, i) => (
        <View key={i} style={i > 0 ? styles.wellDivider : undefined}>
          {child}
        </View>
      ))}
    </View>
  );
}

export function Row({
  onPress,
  children,
  height,
  style,
  accessibilityLabel,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  height?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const body = (
    <View style={[styles.row, height ? { minHeight: height } : null, style]}>{children}</View>
  );
  if (!onPress) return body;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.rowPressed]}
    >
      {body}
    </Pressable>
  );
}

export function Chevron({ color = more.disabled }: { color?: string }) {
  return <Icon name="chevron_right" size={18} color={color} />;
}

export function ScrollFade({ height = 64 }: { height?: number }) {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[...moreRule.fade]}
      locations={[0, 0.78]}
      style={[styles.scrollFade, { height }]}
    />
  );
}

export function GoldPanel({
  label,
  glyph = 'verified',
  children,
}: {
  label: string;
  glyph?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.goldPanel}>
      <View style={styles.goldPanelHead}>
        <Icon name={glyph} size={16} color={more.gold} />
        <Text style={styles.goldPanelLabel} maxFontSizeMultiplier={CLAMP}>
          {label}
        </Text>
      </View>
      <Text style={styles.goldPanelBody}>{children}</Text>
    </View>
  );
}

export function LinkRow({
  children,
  onPress,
  glyph,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  glyph?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.linkRow, pressed && styles.rowPressed]}
    >
      {!!glyph && <Icon name={glyph} size={18} color={more.meta} />}
      <Text style={styles.linkText}>{children}</Text>
      {!!onPress && <Chevron />}
    </Pressable>
  );
}

export function SearchInput({
  placeholder,
  value,
  onChangeText,
  height = 46,
  autoFocus,
}: {
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  height?: number;
  autoFocus?: boolean;
}) {
  return (
    <View style={[styles.field, { minHeight: height }]}>
      <Icon name="search" size={18} color={more.meta} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={more.meta}
        style={styles.fieldInput}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel={placeholder}
        autoFocus={autoFocus}
      />
      {!!value && (
        <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={10} onPress={() => onChangeText('')}>
          <Icon name="close" size={16} color={more.meta} />
        </Pressable>
      )}
    </View>
  );
}

export function Pill({
  label,
  on,
  tone = 'elevated',
  onPress,
  children,
}: {
  label?: string;
  on?: boolean;
  tone?: 'mint' | 'elevated';
  onPress?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        on && (tone === 'mint' ? styles.pillMint : styles.pillOn),
        pressed && styles.rowPressed,
      ]}
    >
      {children ?? (
        <Text
          style={[styles.pillText, on && (tone === 'mint' ? styles.pillTextMint : styles.pillTextOn)]}
          maxFontSizeMultiplier={CLAMP}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function Toggle({ on }: { on: boolean }) {
  return (
    <View style={[styles.track, on && styles.trackOn]}>
      <View style={[styles.knob, on && styles.knobOn]} />
    </View>
  );
}

export function LiveDot({ color = more.mint, size = 6 }: { color?: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
}

export function Khatam({ opacity = 0.05 }: { opacity?: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" opacity={opacity}>
        <Defs>
          <Pattern id="khatam" width={46} height={46} patternUnits="userSpaceOnUse">
            <G stroke={more.ink} strokeWidth={1} fill="none">
              <Rect x={11} y={11} width={24} height={24} />
              <Rect x={11} y={11} width={24} height={24} transform="rotate(45 23 23)" />
            </G>
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#khatam)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: GUTTER - 10, gap: 2 },
  iconBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  titleCol: { flex: 1, paddingHorizontal: 10, paddingVertical: 6 },
  title: { fontFamily: fonts.serif, color: more.ink, letterSpacing: -0.4 },
  titleMeta: {
    fontFamily: fonts.regular,
    fontSize: SIZE.meta,
    lineHeight: uiLeading(SIZE.meta),
    color: more.meta,
    marginTop: 4,
  },
  titleRule: { height: 1, marginHorizontal: GUTTER, marginTop: 10 },

  headRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 26 },
  headLabel: {
    fontFamily: fonts.extrabold,
    fontSize: SIZE.caption,
    lineHeight: uiLeading(SIZE.caption),
    letterSpacing: 1.9,
    textTransform: 'uppercase',
    color: more.gold,
  },
  headRule: { flex: 1, height: 1 },
  headCount: { fontFamily: fonts.semibold, fontSize: SIZE.caption, color: more.meta },

  well: {
    backgroundColor: more.raised,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: more.liftRaised,
    overflow: 'hidden',
  },
  wellSunk: { backgroundColor: more.sunk, borderTopColor: 'transparent' },
  wellBordered: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: more.hairline,
    borderTopColor: more.hairline,
  },
  wellDivider: { borderTopWidth: 1, borderTopColor: more.rowDivider },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, minHeight: 56 },
  rowPressed: { backgroundColor: more.raisedPressed },

  goldPanel: { backgroundColor: more.goldPanel, borderRadius: 16, padding: 16, gap: 8 },
  goldPanelHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  goldPanelLabel: {
    fontFamily: fonts.extrabold,
    fontSize: SIZE.caption,
    letterSpacing: 1.9,
    textTransform: 'uppercase',
    color: more.gold,
  },
  goldPanelBody: {
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: bodyLeading(SIZE.body),
    color: more.onGoldPanel,
  },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: more.hairline,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  linkText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: bodyLeading(SIZE.body),
    color: more.ink3,
  },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: more.raised,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: more.liftRaised,
  },
  fieldInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    color: more.ink,
    paddingVertical: 0,
  },

  pill: {
    minHeight: 32,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: more.raised,
    borderWidth: 1,
    borderColor: more.pillBorder,
  },
  pillOn: { backgroundColor: more.elevated, borderColor: more.strong },
  pillMint: { backgroundColor: more.mint, borderColor: more.mint },
  pillText: { fontFamily: fonts.semibold, fontSize: SIZE.body, color: more.ink3 },
  pillTextOn: { fontFamily: fonts.bold, color: more.ink },
  pillTextMint: { fontFamily: fonts.bold, color: more.onMint },

  track: {
    width: 46,
    height: 27,
    borderRadius: 999,
    backgroundColor: more.hairline,
    padding: 3,
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: more.mintTrack, alignItems: 'flex-end' },
  knob: { width: 21, height: 21, borderRadius: 999, backgroundColor: more.metaQuiet },
  knobOn: { backgroundColor: more.ground },

  scrollFade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});

export { styles as partStyles };
