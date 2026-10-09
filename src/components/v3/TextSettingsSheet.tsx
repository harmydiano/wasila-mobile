import React from 'react';
import { View, Text, StyleSheet, Pressable, LayoutChangeEvent, PanResponder } from 'react-native';
import Sheet from '../Sheet';
import Icon from '../Icon';
import { fonts, serifHeading, tabular, SIZE, eyebrow } from '../../theme/type';
import { colors, v3 } from '../../theme/v3/colors';
import { useAppState } from '../../state/AppState';

const MIN = 20;
const MAX = 46;
const STEP = 2;

const MODES: { key: 'tap' | 'sound' | 'haptic'; label: string; icon: string }[] = [
  { key: 'tap', label: 'Tap', icon: 'touch_app' },
  { key: 'sound', label: 'Sound', icon: 'volume_up' },
  { key: 'haptic', label: 'Haptic', icon: 'vibration' },
];

function Toggle({ on }: { on: boolean }) {
  return (
    <View style={[styles.track, on && styles.trackOn]}>
      <View style={[styles.knob, on && styles.knobOn]} />
    </View>
  );
}

function ToggleRow({
  label,
  sub,
  on,
  onPress,
}: {
  label: string;
  sub: string;
  on: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Toggle on={on} />
    </Pressable>
  );
}

export default function TextSettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { arabicSize, setArabicSize, benefitText, setBenefitText, resetBenefitText } = useAppState();
  const [trackWidth, setTrackWidth] = React.useState(0);

  const widthRef = React.useRef(0);
  const onTrackLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const seek = React.useCallback(
    (x: number) => {
      const w = widthRef.current;
      if (!w) return;
      const pct = Math.max(0, Math.min(1, x / w));
      const raw = MIN + pct * (MAX - MIN);
      setArabicSize(Math.round(raw / STEP) * STEP);
    },
    [setArabicSize],
  );

  const grantX = React.useRef(0);
  const pan = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          grantX.current = e.nativeEvent.locationX;
          seek(grantX.current);
        },
        onPanResponderMove: (_e, g) => seek(grantX.current + g.dx),
      }),
    [seek],
  );

  const pct = (Math.max(MIN, Math.min(MAX, arabicSize)) - MIN) / (MAX - MIN);
  const t = benefitText;

  return (
    <Sheet visible={visible} onClose={onClose} bg={colors.bgCardAlt}>
      <View style={styles.head}>
        <Text style={styles.title}>Text settings</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} onPress={onClose}>
          <Icon name="close" size={23} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.sizeCard}>
        <View style={styles.sizeHead}>
          <Text style={styles.rowLabel}>Arabic size</Text>
          <Text style={styles.sizeValue}>{`${arabicSize} pt`}</Text>
        </View>
        <View style={styles.sliderRow}>
          <Text style={styles.aSmall}>A</Text>
          <View
            style={styles.sliderTrack}
            onLayout={onTrackLayout}
            accessibilityRole="adjustable"
            accessibilityLabel="Arabic size"
            accessibilityValue={{ min: MIN, max: MAX, now: arabicSize }}
            {...pan.panHandlers}
          >
            <View style={[styles.sliderFill, { width: `${pct * 100}%` }]} />
            <View
              style={[styles.thumb, { left: Math.max(0, pct * trackWidth - 10) }]}
              pointerEvents="none"
            />
          </View>
          <Text style={styles.aLarge}>A</Text>
        </View>
      </View>

      <View style={styles.rows}>
        <ToggleRow
          label="Show transliteration"
          sub="Latin script under each line"
          on={t.showTranslit}
          onPress={() => setBenefitText({ showTranslit: !t.showTranslit })}
        />
        <ToggleRow
          label="Show translation"
          sub="English · one block per passage"
          on={t.showTranslation}
          onPress={() => setBenefitText({ showTranslation: !t.showTranslation })}
        />
        <ToggleRow
          label="Split passage into lines"
          sub="Off shows the passage as one block"
          on={t.splitPassage}
          onPress={() => setBenefitText({ splitPassage: !t.splitPassage })}
        />
        <ToggleRow
          label="Keep screen on"
          sub="While a benefit is open"
          on={t.keepAwake}
          onPress={() => setBenefitText({ keepAwake: !t.keepAwake })}
        />
      </View>

      <Text style={[styles.eyebrow, { marginTop: 18 }]}>Counting</Text>
      <View style={styles.modes}>
        {MODES.map((m) => {
          const on = t.countMode === m.key;
          return (
            <Pressable
              key={m.key}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              style={({ pressed }) => [styles.mode, on && styles.modeOn, pressed && styles.pressed]}
              onPress={() => setBenefitText({ countMode: m.key })}
            >
              <Icon name={m.icon} size={21} color={on ? colors.accent : colors.textMuted} />
              <Text style={[styles.modeLabel, on && styles.modeLabelOn]}>{m.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.reset, pressed && styles.pressed]}
        onPress={() => {
          resetBenefitText();
          setArabicSize(30);
        }}
      >
        <Text style={styles.resetText}>Reset text settings</Text>
      </Pressable>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  title: { ...serifHeading(SIZE.cardTitle), color: colors.textPrimary },

  eyebrow: eyebrow(colors.textMuted),

  sizeCard: { backgroundColor: v3.surfaceCard, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, marginTop: 18 },
  sizeHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sizeValue: { ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.meta, color: colors.accent },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  aSmall: { fontFamily: fonts.regular, fontSize: SIZE.body, color: colors.textMuted },
  aLarge: { fontFamily: fonts.regular, fontSize: 22, color: colors.textSecondary },
  sliderTrack: { flex: 1, height: 22, justifyContent: 'center' },
  sliderFill: {
    position: 'absolute', left: 0, height: 4, borderRadius: 2, backgroundColor: colors.accent,
  },
  thumb: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: colors.textPrimary },

  rows: { gap: 9, marginTop: 18 },
  row: {
    minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: v3.surfaceCard, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16,
  },
  rowText: { flex: 1 },
  rowLabel: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: 20, color: colors.textPrimary },
  rowSub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 16, color: colors.textMuted, marginTop: 2 },

  track: { width: 44, height: 26, borderRadius: 999, backgroundColor: colors.divider, padding: 3, justifyContent: 'center', flexShrink: 0 },
  trackOn: { backgroundColor: colors.accent },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.textDisabled },
  knobOn: { backgroundColor: colors.textPrimary, alignSelf: 'flex-end' },

  modes: { flexDirection: 'row', gap: 8, marginTop: 11 },
  mode: {
    flex: 1, alignItems: 'center', gap: 5, paddingVertical: 13,
    backgroundColor: v3.surfaceCard, borderRadius: 16, borderWidth: 1, borderColor: colors.divider,
  },
  modeOn: { borderWidth: 2, borderColor: colors.accent },
  modeLabel: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textSecondary },
  modeLabelOn: { fontFamily: fonts.extrabold, color: colors.textPrimary },

  reset: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 2, marginTop: 16 },
  resetText: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textFaint },

  pressed: { opacity: 0.9 },
});
