import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Sheet from './Sheet';
import Button from './Button';
import Icon from './Icon';
import { colors } from '../theme/colors';
import { fonts } from '../theme/type';
import { PLANS, CATS } from '../data/content';
import { useAppState } from '../state/AppState';

const PERKS = [
  `All ${CATS.reduce((s, c) => s + c.total, 0)} benefits across every category`,
  'Full instructions, counts, timings and herb notes',
  'Personal zikr from your name and your mother’s',
  'Offline access and unlimited counters',
];

export default function PaywallSheet() {
  const { paywallVisible, closePaywall, subscribe } = useAppState();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <Sheet visible={paywallVisible} onClose={closePaywall}>
      <Text style={styles.title}>Unlock the full corpus</Text>
      <Text style={styles.sub}>One free benefit stays open in every category. Premium opens the rest.</Text>

      <View style={{ gap: 10, marginVertical: 16 }}>
        {PERKS.map((p) => (
          <View key={p} style={styles.perkRow}>
            <Icon name="check_circle" size={17} color={colors.accent} />
            <Text style={styles.perkText}>{p}</Text>
          </View>
        ))}
      </View>

      <View style={styles.planRow}>
        {PLANS.map((p) => (
          <Pressable key={p.key} style={[styles.planCard, plan === p.key && styles.planCardOn]} onPress={() => setPlan(p.key)}>
            <Text style={styles.planName}>{p.name}</Text>
            <Text style={styles.planPrice}>{p.price}</Text>
            <Text style={styles.planPer}>{p.per}</Text>
            <Text style={styles.planNote}>{p.note}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ marginTop: 18, gap: 10 }}>
        <Button label="Start 7-day free trial" onPress={() => subscribe(plan)} />
        <Button label="Not now" variant="ghost" onPress={closePaywall} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.extrabold, fontSize: 19, color: colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textMuted, marginTop: 6 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  perkText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  planRow: { flexDirection: 'row', gap: 10 },
  planCard: { flex: 1, borderRadius: 16, padding: 16, backgroundColor: colors.bgRoot, borderWidth: 1, borderColor: colors.divider, gap: 3 },
  planCardOn: { borderColor: colors.accent, backgroundColor: '#123B33' },
  planName: { fontFamily: fonts.bold, fontSize: 13, color: colors.textPrimary },
  planPrice: { fontFamily: fonts.extrabold, fontSize: 20, color: colors.textPrimary, marginTop: 4 },
  planPer: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  planNote: { fontFamily: fonts.semibold, fontSize: 11, color: colors.accent, marginTop: 4 },
});
