import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import { fonts, serifHeading, arabicText, tabular, SIZE, CLAMP, uiLeading, pinLeading, eyebrow } from '../../theme/type';
import { avoidOrphan } from '../../utils/typography';
import { colors, v3 } from '../../theme/v3/colors';
import { CATS } from '../../data/content';
import { freeCount, kindOf, lineFor } from '../../data/benefits';
import { useContentRev } from '../../data/remoteBenefits';
import { BENEFIT_KINDS, KIND_ORDER } from '../../data/benefitKinds';
import type { BenefitKind } from '../../types/models';
import { SOCIAL_LIVE, approx, approxOf, benefitSocial, categorySocial, disclose } from '../../utils/social';
import { useAppState } from '../../state/AppState';

type Filter = 'all' | BenefitKind;

type Order = 'editorial' | 'practised';

export default function Category({ route, navigation }: any) {
  const { catId } = route.params ?? {};
  const cat = CATS.find((c) => c.id === catId) ?? CATS[0];
  const { premium } = useAppState();
  const contentRev = useContentRev();

  const [filter, setFilter] = useState<Filter>('all');
  const [order, setOrder] = useState<Order>('editorial');

  const free = freeCount(cat);
  const lockedTotal = cat.total - free;
  const catPractising = useMemo(() => categorySocial(cat.id).practising, [cat.id]);
  const catLine = disclose(catPractising, 'practising now');

  const filters = useMemo(() => {
    const present = new Set(cat.duas.map(kindOf));
    const keys = KIND_ORDER.filter((k) => present.has(k));
    return keys.length > 1 ? keys.map((key) => ({ key, label: BENEFIT_KINDS[key].plural })) : [];
  }, [cat, contentRev]);

  const entries = useMemo(() => {
    const rows = cat.duas.map((dua, duaIdx) => ({
      dua,
      duaIdx,
      kind: kindOf(dua),
      social: benefitSocial(cat.id, duaIdx),
    }));
    const filtered = filter === 'all' ? rows : rows.filter((r) => r.kind === filter);
    return order === 'practised'
      ? [...filtered].sort((a, b) => b.social.practising - a.social.practising)
      : filtered;
  }, [cat, filter, order, contentRev]);

  const open = (duaIdx: number) => {
    const dua = cat.duas[duaIdx];
    if (!dua.free && !premium) {
      navigation.navigate('Plus', { benefitTitle: dua.t, categoryLabel: cat.title });
      return;
    }
    navigation.navigate('Benefit', { catId: cat.id, duaIdx });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={10}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow_back" size={23} color={colors.onTeal} />
          </Pressable>
          <Text style={styles.headEyebrow}>Category</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search benefits"
            hitSlop={10}
            onPress={() => navigation.navigate('BenefitSearch')}
          >
            <Icon name="search" size={21} color={colors.mint} />
          </Pressable>
        </View>
        <Text style={styles.title}>{avoidOrphan(cat.title)}</Text>
        <Text style={styles.sub}>
          {[
            `${cat.total} benefits`,
            `${free} free`,
            catLine.show ? `${approx(catLine.value)} practising now` : null,
          ]
            .filter(Boolean)
            .join('  ·  ')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.chipScroll}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: filter === 'all' }}
            style={({ pressed }) => [styles.chip, filter === 'all' && styles.chipOn, pressed && styles.pressed]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[styles.chipText, filter === 'all' && styles.chipTextOn]}
              maxFontSizeMultiplier={CLAMP}
            >{`All ${cat.total}`}</Text>
          </Pressable>

          {SOCIAL_LIVE && <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: order === 'practised' }}
            style={({ pressed }) => [
              styles.chip, styles.chipIcon, order === 'practised' && styles.chipOn, pressed && styles.pressed,
            ]}
            onPress={() => setOrder((o) => (o === 'practised' ? 'editorial' : 'practised'))}
          >
            <Icon name="sort" size={14} color={order === 'practised' ? colors.onMintText : colors.textMuted} />
            <Text
              style={[styles.chipText, order === 'practised' && styles.chipTextOn]}
              maxFontSizeMultiplier={CLAMP}
            >
              Most practised
            </Text>
          </Pressable>}

          {filters.map((f) => (
            <Pressable
              key={f.key}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === f.key }}
              style={({ pressed }) => [styles.chip, filter === f.key && styles.chipOn, pressed && styles.pressed]}
              onPress={() => setFilter((cur) => (cur === f.key ? 'all' : f.key))}
            >
              <Text
                style={[styles.chipText, filter === f.key && styles.chipTextOn]}
                maxFontSizeMultiplier={CLAMP}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.list}>
          {entries.map(({ dua, duaIdx, social }) => {
            const locked = !dua.free && !premium;
            const beneficial = disclose(social.beneficial, 'found it beneficial');
            const practising = disclose(social.practising, 'practising now');
            const beneficialText = approxOf(beneficial);
            const practisingText = approxOf(practising);
            return (
              <Pressable
                key={`${dua.t}-${duaIdx}`}
                accessibilityRole="button"
                accessibilityLabel={[
                  dua.t,
                  dua.free ? 'Free' : 'In Plus',
                  lineFor(dua),
                  beneficial.show ? beneficial.text : null,
                  practising.show ? `${practising.value.toLocaleString()} practising now` : null,
                ]
                  .filter(Boolean)
                  .join('. ')}
                style={({ pressed }) => [styles.card, locked && styles.cardLocked, pressed && styles.pressed]}
                onPress={() => open(duaIdx)}
              >
                <View style={styles.cardHead}>
                  <View style={[styles.badge, dua.free ? styles.badgeFree : styles.badgePremium]}>
                    {!dua.free && <Icon name="lock" size={11} color={colors.gold} />}
                    <Text
                      style={[styles.badgeText, dua.free ? styles.badgeTextFree : styles.badgeTextPremium]}
                      maxFontSizeMultiplier={CLAMP}
                    >
                      {dua.free ? 'FREE' : 'PLUS'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{avoidOrphan(dua.t)}</Text>
                    <Text style={styles.cardLine} numberOfLines={2} maxFontSizeMultiplier={CLAMP}>
                      {lineFor(dua)}
                    </Text>
                  </View>
                  <Text
                    style={[styles.cardArabic, !dua.free && styles.cardArabicGold]}
                    numberOfLines={1}
                    maxFontSizeMultiplier={1}
                  >
                    {dua.n}
                  </Text>
                </View>

                {SOCIAL_LIVE && <View style={styles.social}>
                  {beneficial.show || practising.show ? (
                    <>
                      {beneficial.show ? (
                        <View style={styles.socialPill}>
                          <Icon name="verified" size={13} color={v3.ink2} />
                          <Text style={styles.socialPillText} maxFontSizeMultiplier={CLAMP}>
                            {`${beneficialText} beneficial`}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.socialSpacer} />
                      )}
                      {practising.show && (
                        <Text style={styles.socialMint} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                          {`${practisingText} practising`}
                        </Text>
                      )}
                    </>
                  ) : (
                    <View style={styles.socialItem}>
                      <Icon name="hourglass_empty" size={14} color={v3.ink3} />
                      <Text style={styles.socialNone} maxFontSizeMultiplier={CLAMP}>
                        Too few reports to show yet
                      </Text>
                    </View>
                  )}
                </View>}
              </Pressable>
            );
          })}
        </View>

        {!premium && lockedTotal > 0 && (
          <View style={styles.unlock}>
            <Text style={styles.unlockTitle}>{`Unlock ${lockedTotal} more in this category`}</Text>
            <Text style={styles.unlockSub}>
              Grouping by need is Wasīla’s own categorisation, not a claim from a source text.
            </Text>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.unlockBtn, pressed && styles.pressed]}
              onPress={() => navigation.navigate('Plus', { categoryLabel: cat.title })}
            >
              <Text style={styles.unlockBtnText}>See plans</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },

  header: { backgroundColor: colors.tealGradMid, paddingHorizontal: 18, paddingTop: 6, paddingBottom: 18 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  headEyebrow: { ...eyebrow(colors.mint), flex: 1 },
  title: { ...serifHeading(SIZE.display), color: colors.onTeal, marginTop: 12 },
  sub: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: pinLeading(20, SIZE.body), color: '#B4DED7', marginTop: 6 },

  content: { paddingBottom: 32, gap: 14 },
  chipScroll: { flexGrow: 0, marginTop: 14 },
  chips: { paddingHorizontal: 20, gap: 7 },
  chip: {
    minHeight: 34, justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 999, backgroundColor: colors.bgCardMuted,
  },
  chipIcon: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  chipOn: { backgroundColor: colors.mint },
  chipText: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textMuted },
  chipTextOn: { fontFamily: fonts.extrabold, color: colors.onMintText },

  list: { paddingHorizontal: 20, gap: 10 },
  card: {
    backgroundColor: v3.surfaceCard, borderTopWidth: 1, borderTopColor: v3.cardTopHighlight,
    borderRadius: 20, paddingVertical: 15, paddingHorizontal: 16,
  },
  cardLocked: { opacity: 0.62 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 999, paddingVertical: 4, paddingHorizontal: 9,
  },
  badgeFree: { backgroundColor: colors.accent },
  badgePremium: { backgroundColor: colors.amberCardBg },
  badgeText: {
    flexShrink: 0, fontFamily: fonts.extrabold, fontSize: SIZE.caption,
    lineHeight: uiLeading(SIZE.caption), letterSpacing: 0.5,
  },
  badgeTextFree: { color: colors.onMintText },
  badgeTextPremium: { color: colors.gold },

  cardBody: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 10 },
  cardText: { flex: 1 },
  cardTitle: { ...serifHeading(SIZE.title), color: colors.textPrimary },
  cardLine: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: pinLeading(17, SIZE.meta), color: colors.textMuted, marginTop: 5 },
  cardArabic: { ...arabicText(21), color: colors.accent },
  cardArabicGold: { color: colors.gold },

  social: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderTopColor: colors.bgCardMuted,
  },
  socialItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  socialPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0,
    paddingLeft: 7, paddingRight: 9, paddingVertical: 3,
    borderRadius: 999, backgroundColor: v3.neutralWell,
  },
  socialPillText: {
    ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.caption,
    lineHeight: uiLeading(SIZE.caption), letterSpacing: 0.3, color: v3.ink1,
  },
  socialSpacer: { flexShrink: 0 },
  socialMint: {
    ...tabular, flex: 1, textAlign: 'right', fontFamily: fonts.bold,
    fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption),
    letterSpacing: 0.5, color: colors.accent,
  },
  socialNone: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: v3.ink3 },

  unlock: {
    marginHorizontal: 14, backgroundColor: colors.bgCardMuted, borderWidth: 1, borderColor: colors.divider,
    borderRadius: 20, padding: 16,
  },
  unlockTitle: { ...serifHeading(SIZE.heading), color: colors.textPrimary },
  unlockSub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: pinLeading(19, SIZE.meta), color: colors.textMuted, marginTop: 5 },
  unlockBtn: {
    minHeight: 48, borderRadius: 999, backgroundColor: colors.gold,
    alignItems: 'center', justifyContent: 'center', marginTop: 14,
  },
  unlockBtnText: { fontFamily: fonts.extrabold, fontSize: SIZE.title, color: colors.amberBtnText },

  pressed: { opacity: 0.9 },
});
