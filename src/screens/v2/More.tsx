import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../../components/Screen';
import Icon from '../../components/Icon';
import { colors } from '../../theme/v2/colors';
import { fonts } from '../../theme/type';
import { MORE_GROUPS } from '../../data/content';
import { useAppState } from '../../state/AppState';

export default function More({ navigation }: any) {
  const { premium, openPaywall } = useAppState();

  return (
    <Screen nav="More" contentStyle={{ paddingHorizontal: 20, paddingTop: 8, gap: 20 }}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>All features</Text>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => navigation.navigate('Settings')} style={styles.iconBtn}>
          <Icon name="settings" size={22} color={colors.textMuted} />
        </Pressable>
      </View>

      {!premium && (
        <Pressable onPress={openPaywall}>
          <LinearGradient colors={[colors.premiumGradStart, colors.premiumGradEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.premiumCard}>
            <View style={styles.premiumIconWrap}>
              <Icon name="workspace_premium" size={22} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.premiumTitle}>Go Premium</Text>
              <Text style={styles.premiumSub}>Unlock the full corpus · Free 7-day trial</Text>
            </View>
            <Icon name="arrow_forward" size={18} color={colors.gold} />
          </LinearGradient>
        </Pressable>
      )}

      {MORE_GROUPS.map((g) => (
        <View key={g.title} style={{ gap: 10 }}>
          <Text style={styles.groupTitle}>{g.title}</Text>
          <View style={styles.grid}>
            {g.items.map((item) => (
              <Pressable key={item.label} style={styles.tile} onPress={() => navigation.navigate(item.go)}>
                <View style={styles.tileIconWrap}>
                  <Icon name={item.icon} size={20} color={colors.accent} />
                </View>
                <Text style={styles.tileLabel}>{item.label}</Text>
                {item.tag && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{item.tag}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontFamily: fonts.serif, fontSize: 25, color: colors.textPrimary },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  premiumCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 20, padding: 16 },
  premiumIconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(224,190,133,0.16)', alignItems: 'center', justifyContent: 'center' },
  premiumTitle: { fontFamily: fonts.serif, fontSize: 16, color: colors.amberCardText },
  premiumSub: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.goldBody, marginTop: 2 },
  groupTitle: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '48%', backgroundColor: colors.bgCard, borderRadius: 16, padding: 16, gap: 10 },
  tileIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.iconChipBg, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.textPrimary },
  tag: { position: 'absolute', top: 10, right: 10, backgroundColor: colors.amberCardBg, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 8 },
  tagText: { fontFamily: fonts.bold, fontSize: 11, color: colors.gold },
});
