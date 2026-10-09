import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import { fonts, serifHeading, tabular, SIZE, uiLeading, bodyLeading, eyebrow } from '../../theme/type';
import { colors } from '../../theme/v3/colors';
import { space, radius } from '../../theme/v3/tokens';
import { CATS, PLANS } from '../../data/content';
import { corpusTotal, freeCount } from '../../data/benefits';
import { useContentRev } from '../../data/remoteBenefits';
import { useAppState } from '../../state/AppState';

function checksFor(total: number) {
  return [
    `All ${total} benefits, in all ten categories`,
    'Every method, step and recitation in full',
    'New benefits as they are published',
  ];
}

const amountOf = (price: string) => parseFloat(price.replace(/[^\d.]/g, '')) || 0;

export default function Plus({ navigation, route }: any) {
  const { benefitTitle, categoryLabel } = (route.params ?? {}) as { benefitTitle?: string; categoryLabel?: string };
  const { subscribe, signedIn } = useAppState();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  useContentRev();
  const total = corpusTotal();
  const freeTotal = CATS.reduce((n, c) => n + freeCount(c), 0);
  const monthly = amountOf(PLANS.find((p) => p.key === 'monthly')?.price ?? '');
  const yearly = amountOf(PLANS.find((p) => p.key === 'yearly')?.price ?? '');
  const savePct = monthly && yearly ? Math.round((1 - yearly / (monthly * 12)) * 100) : 0;
  const monthsFree = monthly && yearly ? Math.round(12 - yearly / monthly) : 0;

  const start = () => {
    if (!signedIn) {
      navigation.navigate('SignUpSheet');
      return;
    }
    subscribe(plan);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()} hitSlop={10}>
          <Icon name="close" size={22} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.content}>
        {benefitTitle ? (
          <>
            <View style={styles.lockChip}>
              <Icon name="lock-outline" set="community" size={13} color={colors.gold} />
              <Text style={styles.lockChipText}>Plus practice</Text>
            </View>
            <Text style={styles.title}>{benefitTitle}</Text>
            {!!categoryLabel && <Text style={styles.sub}>{categoryLabel} · in Plus</Text>}
          </>
        ) : (
          <>
            <Text style={styles.title}>Open the whole library</Text>
            <Text style={styles.sub}>
              {`${freeTotal} benefits are free forever. Plus opens the other ${total - freeTotal}.`}
            </Text>
          </>
        )}

        <View style={{ gap: space.xs, marginVertical: space.sm }}>
          {checksFor(total).map((c) => (
            <View key={c} style={styles.checkRow}>
              <Icon name="check-circle" set="community" size={16} color={colors.accent} />
              <Text style={styles.checkLabel}>{c}</Text>
            </View>
          ))}
        </View>

        <View style={styles.planRow}>
          {PLANS.map((p) => {
            const selected = plan === p.key;
            return (
              <Pressable key={p.key} style={[styles.planCard, selected && styles.planCardOn]} onPress={() => setPlan(p.key)}>
                {p.key === 'yearly' && savePct > 0 && (
                  <View style={styles.saveTag}>
                    <Text style={styles.saveTagText}>{`Save ${savePct}%`}</Text>
                  </View>
                )}
                <Text style={styles.planName}>{p.name}</Text>
                <Text style={styles.planPrice}>{p.price}</Text>
                <Text style={styles.planPer}>{p.per}</Text>
                <Text style={styles.planNote}>
                  {p.key === 'yearly' && monthsFree > 0 ? `${monthsFree} months free` : p.note}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.cta} onPress={start}>
          <Text style={styles.ctaText}>Start Plus {plan}</Text>
        </Pressable>
        <View style={styles.noteRow}>
          <Icon name="shield-lock-outline" set="community" size={13} color={colors.textFaint} />
          <Text style={styles.noteText}>
            You'll create a free account first — that is how the purchase stays yours if you change phones.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  topRow: { flexDirection: 'row', paddingHorizontal: space.lg },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: space.lg, paddingTop: space.xs, gap: space.xxs },
  lockChip: {
    flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 4,
    backgroundColor: colors.amberCardBg, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10, marginBottom: space.xs,
  },
  lockChipText: eyebrow(colors.gold),
  title: { ...serifHeading(SIZE.display), color: colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: bodyLeading(SIZE.body), color: colors.textMuted, marginTop: space.xxs },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  checkLabel: { flex: 1, fontFamily: fonts.semibold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textSecondary },
  planRow: { flexDirection: 'row', gap: space.sm - 2, marginTop: space.xs },
  planCard: {
    flex: 1, borderRadius: radius.card, padding: space.sm + 2, backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.outlineBorder, gap: 3,
  },
  planCardOn: { borderColor: colors.accent, backgroundColor: 'rgba(123,224,190,0.06)' },
  saveTag: {
    position: 'absolute', top: -10, right: 12, backgroundColor: colors.gold, borderRadius: 999,
    paddingVertical: 3, paddingHorizontal: 9,
  },
  saveTagText: eyebrow(colors.amberBtnText),
  planName: { fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textPrimary },
  planPrice: { fontFamily: fonts.extrabold, fontSize: SIZE.heading, lineHeight: uiLeading(SIZE.heading), ...tabular, color: colors.textPrimary, marginTop: 4 },
  planPer: { fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.textMuted },
  planNote: { fontFamily: fonts.semibold, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.accent, marginTop: 4 },
  cta: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: space.sm + 2, alignItems: 'center', marginTop: space.md },
  ctaText: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.onMintText, textTransform: 'capitalize' },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.xxs, marginTop: space.sm },
  noteText: { flex: 1, fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.textFaint },
});
