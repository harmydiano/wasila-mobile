import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { colors } from '../theme/colors';
import { fonts } from '../theme/type';
import { MORE_GROUPS } from '../data/content';

export default function More({ navigation }: any) {
  return (
    <Screen nav="More" contentStyle={{ paddingHorizontal: 20, paddingTop: 8, gap: 20 }}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>All features</Text>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => navigation.navigate('Settings')} style={styles.iconBtn}>
          <Icon name="settings" size={22} color={colors.textMuted} />
        </Pressable>
      </View>

      {MORE_GROUPS.map((g) => (
        <View key={g.title} style={{ gap: 10 }}>
          <Text style={styles.groupTitle}>{g.title}</Text>
          <View style={styles.grid}>
            {g.items.map((item) => (
              <Pressable key={item.label} style={styles.tile} onPress={() => navigation.navigate(item.go)}>
                <Icon name={item.icon} size={22} color={colors.accent} />
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
  title: { fontFamily: fonts.extrabold, fontSize: 26, color: colors.textPrimary },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  groupTitle: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '48%', backgroundColor: colors.bgCard, borderRadius: 16, padding: 16, gap: 10 },
  tileLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.textPrimary },
  tag: { position: 'absolute', top: 10, right: 10, backgroundColor: colors.amberCardBg, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 8 },
  tagText: { fontFamily: fonts.bold, fontSize: 11, color: colors.gold },
});
