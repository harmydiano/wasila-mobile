import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Sheet from '../Sheet';
import Button from '../Button';
import Icon from '../Icon';
import { colors } from '../../theme/v2/colors';
import { fonts } from '../../theme/type';
import { PLANS, CATS } from '../../data/content';
import { useAppState } from '../../state/AppState';

const PERKS = [
  `All ${CATS.reduce((s, c) => s + c.total, 0)} benefits across every category`,
  'Full instructions, counts, timings and herb notes',
  'Personal zikr from your name and your mother’s',
  'Offline access and unlimited counters',
];

export default function PaywallSheet() {
  const { paywallVisible, closePaywall, subscribe } = useAppState();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const selectedPlan = PLANS.find((p) => p.key === plan) ?? PLANS[0];

  return (
    <Sheet visible={paywallVisible} onClose={closePaywall}>
      <Text style={styles.title}>Unlock the full corpus</Text>
      <Text style={styles.sub}>One free benefit stays open in every category. Premium opens the rest.</Text>

      <View style={{ gap: 12, marginVertical: 18 }}>
        {PERKS.map((p) => (
          <View key={p} style={styles.perkRow}>
            <View style={styles.perkIcon}>
              <Icon name="check" size={13} color={colors.onMintText} />
            </View>
            <Text style={styles.perkText}>{p}</Text>
          </View>
        ))}
      </View>

      <View style={styles.planRow}>
        {PLANS.map((p) => (
          <Pressable key={p.key} style={[styles.planCard, plan === p.key && styles.planCardOn]} onPress={() => setPlan(p.key)}>
            {p.key === 'yearly' && (
              <View style={styles.bestValueTag}>
                <Text style={styles.bestValueText}>Best value</Text>
              </View>
            )}
            <Text style={styles.planName}>{p.name}</Text>
            <Text style={styles.planPrice}>{p.price}</Text>
            <Text style={styles.planPer}>{p.per}</Text>
            <Text style={styles.planNote}>{p.note}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ marginTop: 20, gap: 14 }}>
        <Button
          label={`Start 7-day free trial — then ${selectedPlan.price}${plan === 'monthly' ? '/mo' : '/yr'}`}
          onPress={() => subscribe(plan)}
        />
        <Pressable onPress={closePaywall} hitSlop={8} style={{ alignSelf: 'center' }}>
          <Text style={styles.notNow}>Not now</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontSize: 20, color: colors.textPrimary, textAlign: 'center' },
  sub: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textMuted, marginTop: 6, textAlign: 'center' },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  perkIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  perkText: { flex: 1, fontFamily: fonts.semibold, fontSize: 13, color: colors.textSecondary },
  planRow: { flexDirection: 'row', gap: 10 },
  planCard: { flex: 1, borderRadius: 16, padding: 16, backgroundColor: colors.bgRoot, borderWidth: 1, borderColor: colors.divider, gap: 3 },
  planCardOn: { borderColor: colors.accent, backgroundColor: '#123B33' },
  bestValueTag: { position: 'absolute', top: -10, right: 12, backgroundColor: colors.gold, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 },
  bestValueText: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.amberBtnText },
  planName: { fontFamily: fonts.bold, fontSize: 13, color: colors.textPrimary },
  planPrice: { fontFamily: fonts.extrabold, fontSize: 20, color: colors.textPrimary, marginTop: 4 },
  planPer: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  planNote: { fontFamily: fonts.semibold, fontSize: 11, color: colors.accent, marginTop: 4 },
  notNow: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textMuted },
});
