import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import IconChip from '../components/IconChip';
import Button from '../components/Button';
import GeometricPattern from '../components/GeometricPattern';
import PracticeStack from '../components/PracticeStack';
import { colors, categoryTints } from '../theme/colors';
import { fonts } from '../theme/type';
import { CATS, PRACTICES } from '../data/content';
import { usePrayer } from '../state/usePrayer';
import { formatHijri } from '../utils/hijri';

const QUICK_ACCESS = [
  { label: 'Qibla', icon: 'explore', go: 'Prayer' },
  { label: 'Tasbih', icon: 'radio_button_checked', go: 'Tasbih' },
  { label: '99 Names', icon: 'grid_view', go: 'Names' },
  { label: 'My Zikr', icon: 'auto_awesome', go: 'Zikr' },
];

export default function Home({ navigation }: any) {
  const { currentName, currentLabel, timeToNext, nextName, nextLabel, nextCountdown, locationShort } = usePrayer();

  const inPrayerWindow = currentName != null;
  const heroName = inPrayerWindow ? currentName : nextName;
  const heroTime = inPrayerWindow ? currentLabel : nextLabel;
  const heroSub = inPrayerWindow ? `${timeToNext} to ${nextName}` : nextCountdown;
  return (
    <Screen nav="Home" contentStyle={{ paddingHorizontal: 20, paddingTop: 8, gap: 22 }}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hijri}>{formatHijri(new Date())}</Text>
          <Text style={styles.greeting}>Asalam Alaykum, Hamid</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Prayer')} style={styles.iconBtn}>
          <Icon name="notifications" size={22} color={colors.textMuted} />
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
          <Text style={styles.avatarText}>HA</Text>
        </Pressable>
      </View>

      <LinearGradient colors={[colors.tealGradMid, colors.tealGradEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <GeometricPattern color={colors.mint} opacity={0.12} />
        <View style={styles.heroDecoCircle} pointerEvents="none" />
        {inPrayerWindow ? (
          <View style={styles.heroNowRow}>
            <View style={styles.heroNowDot} />
            <Text style={styles.heroEyebrowNow}>Now</Text>
          </View>
        ) : (
          <Text style={styles.heroEyebrow}>Next prayer</Text>
        )}
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.heroName}>{heroName ?? '—'}</Text>
            <Text style={styles.heroCountdown}>{heroSub ?? ''}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.heroTime}>{heroTime ?? '--:--'}</Text>
            <Text style={styles.heroLoc}>{locationShort}</Text>
          </View>
        </View>
        <View style={[styles.heroBtnRow, { marginTop: 6 }]}>
          <Pressable style={styles.heroBtnMint} onPress={() => navigation.navigate('Prayer')}>
            <Text style={styles.heroBtnMintText}>All times</Text>
          </Pressable>
          <Pressable style={styles.heroBtnOutline} onPress={() => navigation.navigate('Prayer')}>
            <Text style={styles.heroBtnOutlineText}>Qibla</Text>
          </Pressable>
        </View>
      </LinearGradient>

      <View style={{ gap: 12 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>In progress</Text>
          <Text style={styles.metaText}>{PRACTICES.length} active</Text>
        </View>
        <PracticeStack
          practices={PRACTICES}
          onPressPractice={(p) => navigation.navigate('DuaDetail', { catId: p.catId, duaIdx: p.duaIdx })}
        />
      </View>

      <View style={{ gap: 12 }}>
        <Text style={styles.sectionTitle}>Quick access</Text>
        <View style={styles.quickRow}>
          {QUICK_ACCESS.map((q) => (
            <Pressable key={q.label} style={styles.quickTile} onPress={() => navigation.navigate(q.go)}>
              <IconChip icon={q.icon} size={34} radius={12} />
              <Text style={styles.quickLabel}>{q.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>What do you need?</Text>
          <Pressable onPress={() => navigation.navigate('Library')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>
        <View style={styles.catGrid}>
          {CATS.slice(0, 6).map((c) => {
            const tint = categoryTints[c.id];
            return (
              <Pressable key={c.id} style={styles.catTile} onPress={() => navigation.navigate('Category', { catId: c.id })}>
                <IconChip icon={c.icon} size={38} radius={12} bg={tint.bg} iconColor={tint.dark} />
                <Text style={styles.catTitle}>{c.title}</Text>
                <Text style={styles.catMeta}>{c.total} practices</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 6 },
  hijri: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.accent },
  greeting: { fontFamily: fonts.extrabold, fontSize: 21, color: colors.textPrimary, marginTop: 4 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.tealGradMid, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bold, fontSize: 13, color: colors.mint },
  hero: { borderRadius: 26, padding: 22, gap: 16, overflow: 'hidden' },
  heroDecoCircle: {
    position: 'absolute',
    top: -36,
    right: -36,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroEyebrow: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.textTealLabel },
  heroNowRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroNowDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: colors.accent },
  heroEyebrowNow: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.mint },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroName: { fontFamily: fonts.extrabold, fontSize: 32, color: colors.onTeal },
  heroCountdown: { fontFamily: fonts.regular, fontSize: 13, color: '#B4DED7', marginTop: 4 },
  heroTime: { fontFamily: fonts.bold, fontSize: 26, color: colors.onTeal },
  heroLoc: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textTealLabel, marginTop: 4 },
  heroBtnRow: { flexDirection: 'row', gap: 10 },
  heroBtnMint: { flex: 1, backgroundColor: colors.mint, borderRadius: 999, paddingVertical: 11, alignItems: 'center' },
  heroBtnMintText: { fontFamily: fonts.bold, fontSize: 13, color: colors.onMintText },
  heroBtnOutline: { flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: 999, paddingVertical: 11, alignItems: 'center' },
  heroBtnOutlineText: { fontFamily: fonts.bold, fontSize: 13, color: colors.onTeal },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: fonts.extrabold, fontSize: 16, color: colors.textPrimary },
  metaText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textSecondary },
  seeAll: { fontFamily: fonts.bold, fontSize: 13, color: colors.accent },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickTile: { flex: 1, backgroundColor: colors.bgCard, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 12, gap: 8, alignItems: 'flex-start' },
  quickLabel: { fontFamily: fonts.bold, fontSize: 12, color: colors.textPrimary },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catTile: { width: '48%', backgroundColor: colors.bgCard, borderRadius: 18, padding: 14, gap: 8 },
  catTitle: { fontFamily: fonts.bold, fontSize: 13, color: colors.textPrimary },
  catMeta: { fontFamily: fonts.semibold, fontSize: 11, color: colors.textMuted },
});
