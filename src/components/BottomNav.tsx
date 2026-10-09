import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, LayoutChangeEvent } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, type Palette } from '../theme/theme';
import { v3 as v3Colors, more as moreColors } from '../theme/v3/colors';
import { fonts, SIZE, CLAMP, uiLeading } from '../theme/type';
import Icon from './Icon';
import EdgeFade from './EdgeFade';
import { claimBottomBarSlot, releaseBottomBarSlot, reportBottomBarHeight } from '../state/bottomBar';

const TABS: { key: string; label: string; icon: string; iconV2: string; iconV3: string; route: string }[] = [
  { key: 'Home', label: 'Home', icon: 'home', iconV2: 'home-outline', iconV3: 'dashboard', route: 'Home' },
  { key: 'Library', label: 'Benefits', icon: 'volunteer_activism', iconV2: 'hand-heart-outline', iconV3: 'menu_book', route: 'Library' },
  { key: 'Quran', label: 'Quran', icon: 'menu_book', iconV2: 'book-open-outline', iconV3: 'auto_stories', route: 'Quran' },
  { key: 'Prayer', label: 'Prayer', icon: 'mosque', iconV2: 'mosque-outline', iconV3: 'mosque', route: 'Prayer' },
  { key: 'More', label: 'More', icon: 'apps', iconV2: 'view-grid-outline', iconV3: 'more_horiz', route: 'More' },
];

const BAR_PADDING_H = 8;
const BAR_BORDER_W = 1;

const LIBRARY_GROUP = new Set([
  'Library', 'Category', 'Search', 'Bookmarks', 'Names',
  'Benefit', 'BenefitCounter', 'BenefitListen', 'BenefitSearch', 'Saved', 'ActivePractices',
]);

export default function BottomNav({ active, ground }: { active: string; ground?: string }) {
  const { colors, version } = useTheme();
  const v3 = version === 'v3';
  const v2 = version !== 'v1';
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const activeKey = LIBRARY_GROUP.has(active) ? 'Library' : active;
  const activeIndex = Math.max(0, TABS.findIndex((t) => t.key === activeKey));

  const [barWidth, setBarWidth] = useState(0);
  const tabWidth = barWidth > 0 ? (barWidth - BAR_PADDING_H * 2 - BAR_BORDER_W * 2) / TABS.length : 0;
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!v2 || tabWidth === 0) return;
    Animated.spring(slide, {
      toValue: activeIndex * tabWidth,
      stiffness: 380,
      damping: 32,
      mass: 1,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, tabWidth, v2, slide]);

  const onBarLayout = (e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width);

  const focused = useIsFocused();
  const slot = useRef(claimBottomBarSlot()).current;
  const measured = useRef(0);
  useEffect(() => {
    reportBottomBarHeight(slot, focused ? measured.current : 0);
  }, [slot, focused]);
  useEffect(() => () => releaseBottomBarSlot(slot), [slot]);
  const onWrapLayout = (e: LayoutChangeEvent) => {
    measured.current = e.nativeEvent.layout.height;
    if (focused) reportBottomBarHeight(slot, measured.current);
  };

  if (v3) {
    return (
      <View
        style={[
          styles.barV3,
          { paddingBottom: Math.max(insets.bottom, 12) + 10 },
          ground ? { backgroundColor: ground, borderTopColor: moreColors.navBorder } : null,
        ]}
        onLayout={onWrapLayout}
      >
        <EdgeFade ground={ground} />
        {TABS.map((t) => {
          const isActive = t.key === activeKey;
          const tone = isActive ? colors.accent : v3Colors.ink4;
          return (
            <Pressable
              key={t.key}
              style={({ pressed }) => [styles.itemV3, pressed && styles.pressed]}
              onPress={() => navigation.navigate(t.route)}
            >
              <Icon name={t.iconV3} size={22} color={tone} />
              <Text style={[styles.labelV3, { color: tone }]} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  if (!v2) {
    return (
      <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]} onLayout={onWrapLayout}>
        {TABS.map((t) => {
          const isActive = t.key === activeKey;
          return (
            <Pressable key={t.key} style={styles.item} onPress={() => navigation.navigate(t.route)}>
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <Icon name={t.icon} size={20} color={isActive ? colors.onMintText : colors.textSecondary} />
              </View>
              <Text
                style={[styles.label, { color: isActive ? colors.mint : colors.textSecondary, fontFamily: isActive ? fonts.bold : fonts.semibold }]}
                numberOfLines={1}
                maxFontSizeMultiplier={CLAMP}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={[styles.floatWrap, { paddingBottom: Math.max(insets.bottom, 12) }]} onLayout={onWrapLayout}>
      <View style={styles.bar} onLayout={onBarLayout}>
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[styles.pill, { width: tabWidth, transform: [{ translateX: slide }] }]}
          />
        )}
        {TABS.map((t) => {
          const isActive = t.key === activeKey;
          const tone = isActive ? colors.accent : colors.textMuted;
          return (
            <Pressable
              key={t.key}
              style={({ pressed }) => [styles.itemV2, pressed && styles.pressed]}
              onPress={() => navigation.navigate(t.route)}
            >
              <Icon name={t.iconV2} set="community" size={21} color={tone} />
              <Text
                style={[styles.labelV2, { color: tone, fontFamily: fonts.bold }]}
                numberOfLines={1}
                maxFontSizeMultiplier={CLAMP}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      backgroundColor: colors.bgSheet,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      paddingTop: 10,
      paddingHorizontal: 6,
    },
    item: { flex: 1, alignItems: 'center', gap: 4 },
    iconWrap: { width: 40, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    iconWrapActive: { backgroundColor: colors.mint },
    label: { fontSize: 11 },

    floatWrap: { paddingHorizontal: 12, backgroundColor: 'transparent' },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 26,
      borderWidth: BAR_BORDER_W,
      borderColor: 'rgba(255,255,255,0.07)',
      backgroundColor: '#0D211B',
      paddingVertical: 8,
      paddingHorizontal: BAR_PADDING_H,
      shadowColor: '#010907',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.6,
      shadowRadius: 22,
      elevation: 12,
    },
    pill: {
      position: 'absolute',
      top: 4,
      bottom: 4,
      borderRadius: 16,
      backgroundColor: 'rgba(123,224,190,0.15)',
    },
    itemV2: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', gap: 4 },

    barV3: {
      flexDirection: 'row',
      backgroundColor: colors.bgRoot,
      borderTopWidth: 1,
      borderTopColor: v3Colors.navBorder,
      paddingTop: 9,
      paddingHorizontal: 12,
    },
    itemV3: { flex: 1, minHeight: 44, alignItems: 'center', gap: 4 },
    labelV3: { fontFamily: fonts.bold, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption) },
    labelV2: { fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), letterSpacing: 0.3 },
    pressed: { opacity: 0.85 },
  });
