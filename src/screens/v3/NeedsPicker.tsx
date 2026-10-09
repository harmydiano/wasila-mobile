import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Easing, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import CategoryIcon, { NEEDS_CATS } from '../../components/v3/CategoryIcon';
import { useReduceMotion } from '../../components/v3/Stagger';
import { setPendingFlight } from '../../components/v3/sharedElement';
import { fonts, serifHeading, SIZE, uiLeading, bodyLeading, eyebrow } from '../../theme/type';
import { colors, v3 } from '../../theme/v3/colors';
import { CATS } from '../../data/content';
import { setSelectedNeedCat, markOnboardingCompleted } from '../../data/prefs';
import { useAppState } from '../../state/AppState';

const OVERSHOOT = Easing.bezier(0.34, 1.56, 0.64, 1);

function Row({
  cat,
  selected,
  dimmed,
  onPress,
  iconRef,
}: {
  cat: (typeof CATS)[number];
  selected: boolean;
  dimmed: boolean;
  onPress: () => void;
  iconRef: (v: View | null) => void;
}) {
  const check = useRef(new Animated.Value(selected ? 1 : 0.86)).current;
  React.useEffect(() => {
    Animated.timing(check, {
      toValue: selected ? 1 : 0.86,
      duration: 180,
      easing: OVERSHOOT,
      useNativeDriver: true,
    }).start();
  }, [selected, check]);

  return (
    <Pressable
      style={[styles.row, selected && styles.rowSelected, dimmed && styles.rowDimmed]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View ref={iconRef} collapsable={false} style={styles.rowIconSlot}>
        <CategoryIcon catId={cat.id} size={40} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{cat.title}</Text>
        <Text style={[styles.rowMeta, selected && styles.rowMetaSelected]}>{`${cat.total} practices`}</Text>
      </View>
      <Animated.View
        style={[styles.check, selected && styles.checkOn, { transform: [{ scale: check }] }]}
      >
        {selected && <Icon name="check" size={18} color={colors.onMintText} />}
      </Animated.View>
    </Pressable>
  );
}

export default function NeedsPicker({ navigation }: any) {
  const [selected, setSelected] = useState<string | null>(null);
  const reduced = useReduceMotion();
  const iconRefs = useRef<Record<string, View | null>>({});

  const go = () => navigation.replace('Home');

  const { practice, endPractice } = useAppState();

  const onSubmit = () => {
    if (!selected) return;
    if (practice && practice.catId !== selected) {
      const current = CATS.find((c) => c.id === practice.catId)?.duas[practice.duaIdx]?.t ?? 'your current practice';
      Alert.alert(
        `Replace “${current.replace(/ in \d+ days?$/i, '')}”?`,
        'Its count and the days kept so far end here.',
        [
          { text: 'Keep it', style: 'cancel' },
          { text: 'Replace', style: 'destructive', onPress: () => { endPractice(); commit(); } },
        ],
      );
      return;
    }
    commit();
  };

  const commit = () => {
    if (!selected) return;
    Promise.all([setSelectedNeedCat(selected), markOnboardingCompleted()]).then(() => {
      const node = iconRefs.current[selected];
      if (reduced || !node) return go();
      node.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) setPendingFlight(selected, { x, y, width, height });
        go();
      });
    });
  };

  const onEssentials = () => {
    Promise.all([setSelectedNeedCat('essentials'), markOnboardingCompleted()]).then(go);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back"
        >
          <Icon name="arrow_back" size={21} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerEyebrow}>Setting up</Text>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>What do you need?</Text>
        <Text style={styles.sub}>
          Pick one. Wasīla returns a single practice with a count, a window and an end date.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {NEEDS_CATS.map((cat) => (
          <Row
            key={cat.id}
            cat={cat}
            selected={selected === cat.id}
            dimmed={selected != null && selected !== cat.id}
            onPress={() => setSelected(cat.id)}
            iconRef={(v) => {
              iconRefs.current[cat.id] = v;
            }}
          />
        ))}

        <Pressable
          style={({ pressed }) => [styles.escapeRow, selected != null && styles.rowDimmed, pressed && styles.pressed]}
          onPress={onEssentials}
        >
          <Icon name="schedule" size={22} color={v3.ink3} />
          <Text style={styles.escapeText}>Not sure yet — start me on the daily essentials</Text>
          <Icon name="chevron_right" size={20} color={v3.ink4} />
        </Pressable>
      </ScrollView>

      <LinearGradient
        colors={['rgba(10,21,18,0)', colors.bgRoot]}
        locations={[0, 0.34]}
        style={styles.footer}
      >
        <Pressable
          style={[styles.cta, !selected && styles.ctaDisabled]}
          disabled={!selected}
          onPress={onSubmit}
        >
          <Text style={[styles.ctaText, !selected && styles.ctaTextDisabled]}>Show me the practice</Text>
        </Pressable>
        <Text style={styles.footnote}>One at a time on the free plan. Picking again replaces this.</Text>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },

  header: {
    paddingHorizontal: 20, paddingTop: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: v3.surfaceRow,
    alignItems: 'center', justifyContent: 'center',
  },
  headerEyebrow: eyebrow(v3.ink3),

  titleBlock: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, gap: 7 },
  title: { ...serifHeading(SIZE.display), letterSpacing: 0, color: colors.textPrimary },
  sub: { fontFamily: fonts.medium, fontSize: SIZE.body, lineHeight: bodyLeading(SIZE.body), color: v3.ink1 },

  list: { paddingHorizontal: 20, paddingBottom: 8, gap: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 13,
    paddingVertical: 14, paddingHorizontal: 15,
    backgroundColor: v3.surfaceRow, borderWidth: 1, borderColor: v3.hairline, borderRadius: 18,
  },
  rowSelected: { backgroundColor: v3.accentTint, borderWidth: 1.5, borderColor: colors.accent },
  rowDimmed: { opacity: 0.62 },
  rowIconSlot: { width: 40, height: 40 },
  rowTitle: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.textPrimary },
  rowMeta: { fontFamily: fonts.semibold, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: v3.ink3, marginTop: 2 },
  rowMetaSelected: { color: v3.ink1 },
  check: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 1, borderColor: v3.borderStrong,
    alignItems: 'center', justifyContent: 'center',
  },
  checkOn: { borderWidth: 0, backgroundColor: colors.accent },

  escapeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 13, minHeight: 52,
    paddingVertical: 14, paddingHorizontal: 15,
    borderRadius: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: v3.borderStrong,
  },
  escapeText: { flex: 1, fontFamily: fonts.semibold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: v3.ink1 },

  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 26, gap: 9 },
  cta: {
    minHeight: 52, borderRadius: 999, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaDisabled: { backgroundColor: v3.surfaceRow, borderWidth: 1, borderColor: v3.hairline },
  ctaText: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.onMintText },
  ctaTextDisabled: { color: '#5F7570' },
  footnote: { fontFamily: fonts.semibold, fontSize: SIZE.meta, lineHeight: bodyLeading(SIZE.meta), color: v3.ink3, textAlign: 'center' },
  pressed: { opacity: 0.9 },
});
