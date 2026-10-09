import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import Button from '../components/Button';
import { colors } from '../theme/colors';
import { fonts } from '../theme/type';
import { useAppState } from '../state/AppState';
import { SETTING_GROUPS } from '../data/content';
import { getReciterName } from '../data/reciters';

export default function Profile({ navigation }: any) {
  const { premium, signedIn, authEmail, arabicSize, openPaywall, reciter } = useAppState();
  const groups = SETTING_GROUPS(arabicSize, signedIn, premium, getReciterName(reciter));

  return (
    <Screen nav="Profile" contentStyle={{ paddingHorizontal: 20, paddingTop: 8, gap: 18 }}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>IB</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>Ibrahim Bello</Text>
          <Text style={styles.plan}>{premium ? 'Premium · yearly' : 'Free plan'}</Text>
          <Pressable onPress={() => navigation.navigate('Auth')}>
            <Text style={styles.subPill}>{signedIn ? authEmail : 'Not signed in · tap to sync'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.statRow}>
        <View style={styles.statTile}>
          <Text style={styles.statValue}>23</Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statValue}>11</Text>
          <Text style={styles.statLabel}>Benefits completed</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statValue}>48k</Text>
          <Text style={styles.statLabel}>Total count</Text>
        </View>
      </View>

      {!premium ? (
        <LinearGradient colors={[colors.premiumGradStart, colors.premiumGradEnd]} style={styles.promoCard}>
          <Text style={styles.promoEyebrow}>Wasīla Premium</Text>
          <Text style={styles.promoBody}>Open the full corpus and your personal zikr</Text>
          <View style={{ marginTop: 12 }}>
            <Button label="See plans" variant="gold" fullWidth={false} onPress={openPaywall} />
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.activeCard}>
          <Icon name="verified" size={20} color={colors.accent} />
          <View>
            <Text style={styles.activeTitle}>Premium active</Text>
            <Text style={styles.activeSub}>Renews 3 Sep 2026 · full corpus unlocked</Text>
          </View>
        </View>
      )}

      <View style={styles.card}>
        {groups.flatMap((g) => g.rows).map((r, i, arr) => (
          <Pressable
            key={r.label}
            style={[styles.row, i < arr.length - 1 && styles.rowBorder]}
            onPress={() => (r as any).go && navigation.navigate((r as any).go)}
          >
            <Icon name={r.icon} size={19} color={colors.textMuted} />
            <Text style={styles.rowLabel}>{r.label}</Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.rowValue}>{r.value}</Text>
            <Icon name="chevron_right" size={18} color={colors.textDisabled} />
          </Pressable>
        ))}
        <Pressable style={styles.row} onPress={() => navigation.navigate('More')}>
          <Icon name="apps" size={19} color={colors.textMuted} />
          <Text style={styles.rowLabel}>All features</Text>
          <View style={{ flex: 1 }} />
          <Icon name="chevron_right" size={18} color={colors.textDisabled} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.tealGradMid, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bold, fontSize: 18, color: colors.mint },
  name: { fontFamily: fonts.extrabold, fontSize: 20, color: colors.textPrimary },
  plan: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  subPill: { fontFamily: fonts.semibold, fontSize: 12, color: colors.accent, marginTop: 4 },
  statRow: { flexDirection: 'row', gap: 10 },
  statTile: { flex: 1, backgroundColor: colors.bgCard, borderRadius: 16, paddingVertical: 14, alignItems: 'center', gap: 4 },
  statValue: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.textPrimary },
  statLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textFaint, textAlign: 'center' },
  promoCard: { borderRadius: 20, padding: 20 },
  promoEyebrow: { fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 1, textTransform: 'uppercase', color: colors.goldEyebrow },
  promoBody: { fontFamily: fonts.bold, fontSize: 16, color: colors.amberCardText, marginTop: 6 },
  activeCard: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.iconChipBg, borderRadius: 18, padding: 18 },
  activeTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.textPrimary },
  activeSub: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
  card: { backgroundColor: colors.bgCard, borderRadius: 18, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowLabel: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.textPrimary },
  rowValue: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted, marginRight: 6 },
});
