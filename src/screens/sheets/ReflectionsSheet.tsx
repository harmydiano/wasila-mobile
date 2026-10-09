import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Sheet from '../../components/Sheet';
import Button from '../../components/Button';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/type';
import { REFL_POOL } from '../../data/content';
import { shuffledReflections } from '../../utils/seed';

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

export default function ReflectionsSheet({
  visible,
  onClose,
  duaTitle,
  seedKey,
  reflAvg,
  reflTotal,
  onWriteReflection,
}: {
  visible: boolean;
  onClose: () => void;
  duaTitle: string;
  seedKey: string;
  reflAvg: number;
  reflTotal: number;
  onWriteReflection: () => void;
}) {
  const [helpful, setHelpful] = useState<Record<number, boolean>>({});
  const list = shuffledReflections(REFL_POOL, seedKey);

  return (
    <Sheet visible={visible} onClose={onClose} maxHeightPct={82}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Reflections</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{duaTitle}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.avg}>★ {reflAvg}</Text>
          <Text style={styles.count}>{reflTotal} ratings</Text>
        </View>
      </View>

      <View style={{ gap: 12, marginTop: 8 }}>
        {list.map((r, i) => (
          <View key={r.name} style={styles.card}>
            <View style={styles.rowTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(r.name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{r.name}</Text>
                <Text style={styles.meta}>{r.place} · practising {r.days}</Text>
              </View>
              <Text style={styles.stars}>{'★'.repeat(r.stars)}</Text>
            </View>
            <Text style={styles.body}>{r.body}</Text>
            <View style={styles.footerRow}>
              <Pressable
                style={[styles.helpfulBtn, helpful[i] && styles.helpfulBtnOn]}
                onPress={() => setHelpful((h) => ({ ...h, [i]: !h[i] }))}
              >
                <Text style={[styles.helpfulText, helpful[i] && { color: colors.accent }]}>
                  Helpful · {r.d + (helpful[i] ? 1 : 0)}
                </Text>
              </Pressable>
              <Text style={styles.report}>Report</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 16 }}>
        <Button label="Share your reflection" variant="outline" onPress={onWriteReflection} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  avg: { fontFamily: fonts.bold, fontSize: 15, color: colors.gold },
  count: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  card: { backgroundColor: colors.bgRoot, borderRadius: 16, padding: 14, gap: 8 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.iconChipBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bold, fontSize: 12, color: colors.accent },
  name: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.textPrimary },
  meta: { fontFamily: fonts.regular, fontSize: 11, color: colors.textFaint },
  stars: { fontFamily: fonts.semibold, fontSize: 12, color: colors.gold },
  body: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  helpfulBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.iconChipBg },
  helpfulBtnOn: { backgroundColor: 'rgba(79,209,160,0.18)' },
  helpfulText: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.textMuted },
  report: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.textFaint },
});
