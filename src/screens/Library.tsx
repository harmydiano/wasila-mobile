import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { colors, categoryTints } from '../theme/colors';
import { fonts } from '../theme/type';
import { CATS } from '../data/content';

const SHORTCUTS = [
  { label: 'Saved', icon: 'bookmark', go: 'Bookmarks' },
  { label: 'Tasbih', icon: 'radio_button_checked', go: 'Tasbih' },
  { label: '99 Names', icon: 'grid_view', go: 'Names' },
  { label: 'My Zikr', icon: 'auto_awesome', go: 'Zikr' },
];

const CORPUS = CATS.reduce((sum, c) => sum + c.total, 0);

export default function Library({ navigation }: any) {
  return (
    <Screen nav="Library" contentStyle={{ paddingHorizontal: 20, paddingTop: 8, gap: 20 }}>
      <View>
        <Text style={styles.title}>Benefits</Text>
        <Text style={styles.meta}>{CORPUS} entries · grouped by purpose</Text>
      </View>

      <Pressable style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
        <Icon name="search" size={18} color={colors.accent} />
        <Text style={styles.searchPlaceholder}>Search a purpose, name or surah</Text>
      </Pressable>

      <View style={styles.shortcutRow}>
        {SHORTCUTS.map((s) => (
          <Pressable key={s.label} style={styles.shortcutTile} onPress={() => navigation.navigate(s.go)}>
            <Icon name={s.icon} size={20} color={colors.accent} />
            <Text style={styles.shortcutLabel}>{s.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ gap: 14 }}>
        {CATS.map((c) => {
          const tint = categoryTints[c.id];
          return (
            <Pressable key={c.id} style={styles.card} onPress={() => navigation.navigate('Category', { catId: c.id })}>
              <LinearGradient colors={[tint.light, tint.dark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconTile}>
                <Icon name={c.icon} size={26} color="#06201B" />
              </LinearGradient>
              <Text style={styles.arabicSub}>{c.arabicSub}</Text>
              <Text style={styles.cardTitle}>{c.title}</Text>
              <Text style={styles.cardSub}>{c.sub}</Text>
              <View style={styles.divider} />
              <View style={styles.cardFooter}>
                <Text style={styles.practices}>{c.total} PRACTICES</Text>
                <View style={styles.exploreRow}>
                  <Text style={styles.explore}>Explore</Text>
                  <Icon name="arrow_forward" size={14} color={colors.gold} />
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.extrabold, fontSize: 26, color: colors.textPrimary },
  meta: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.textMuted, marginTop: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.divider, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 13 },
  searchPlaceholder: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textMuted },
  shortcutRow: { flexDirection: 'row', gap: 10 },
  shortcutTile: { flex: 1, backgroundColor: colors.bgCard, borderRadius: 16, paddingVertical: 14, alignItems: 'center', gap: 8 },
  shortcutLabel: { fontFamily: fonts.bold, fontSize: 11, color: colors.textPrimary },
  card: { backgroundColor: colors.bgCardAlt, borderRadius: 24, padding: 20, gap: 4 },
  iconTile: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  arabicSub: { fontFamily: fonts.arabic, fontSize: 17, color: colors.gold, textAlign: 'right' },
  cardTitle: { fontFamily: fonts.extrabold, fontSize: 20, color: colors.textPrimary, marginTop: 2 },
  cardSub: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: '#93AFA9', marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  practices: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.8, color: colors.textFaint },
  exploreRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  explore: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.gold },
});
