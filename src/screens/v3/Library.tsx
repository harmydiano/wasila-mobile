import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Screen from '../../components/Screen';
import Sheet from '../../components/Sheet';
import Icon from '../../components/Icon';
import ProgressRing from '../../components/ProgressRing';
import CategoryIcon from '../../components/v3/CategoryIcon';
import { fonts, serifHeading, tabular, SIZE, CLAMP, uiLeading, pinLeading, eyebrow } from '../../theme/type';
import { avoidOrphan } from '../../utils/typography';
import { colors, v3 } from '../../theme/v3/colors';
import { CATS } from '../../data/content';
import { benefitOfKey, corpusTotal, freeCount } from '../../data/benefits';
import { useContentRev } from '../../data/remoteBenefits';
import { SOCIAL_LIVE, approx, approxOf, categorySocial, corpusPractising, disclose } from '../../utils/social';
import { useAppState } from '../../state/AppState';
import { getBenefitsSort, setBenefitsSort } from '../../data/prefs';
import { nightForDate } from '../../utils/practice';

type SortKey = 'az' | 'most' | 'largest' | 'started';

const SORTS: { key: SortKey; label: string; sub?: string }[] = [
  { key: 'az', label: 'A to Z' },
  ...(SOCIAL_LIVE ? [{ key: 'most' as const, label: 'Most practised', sub: 'By what people in Wasīla use' }] : []),
  { key: 'largest', label: 'Largest first', sub: 'Protection, then Sustenance' },
  { key: 'started', label: 'What I have started' },
];

const SORT_CHIP: Record<SortKey, string> = {
  az: 'A–Z',
  most: 'Most used',
  largest: 'Largest',
  started: 'Started',
};

function asSortKey(v: string): SortKey {
  return SORTS.some((o) => o.key === v) ? (v as SortKey) : 'az';
}

function shortTitle(t: string) {
  return t.replace(/\s+in \d+\s+days?$/i, '');
}

export default function Library({ navigation }: any) {
  const { practice, saved, premium } = useAppState();
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>('az');
  const [hidePremium, setHidePremium] = useState(false);
  const [draftSort, setDraftSort] = useState<SortKey>('az');
  const [draftHide, setDraftHide] = useState(false);

  const openSort = () => {
    setDraftSort(sort);
    setDraftHide(hidePremium);
    setSortOpen(true);
  };
  useEffect(() => {
    let live = true;
    getBenefitsSort().then((v) => {
      if (!live) return;
      setSort(asSortKey(v.sort));
      setHidePremium(v.hidePremium);
    });
    return () => {
      live = false;
    };
  }, []);

  const applySort = () => {
    setSort(draftSort);
    setHidePremium(draftHide);
    setSortOpen(false);
    setBenefitsSort({ sort: draftSort, hidePremium: draftHide });
  };

  const contentRev = useContentRev();
  const startedRank = useMemo(() => {
    const rank: Record<string, number> = {};
    for (const key of Object.keys(saved)) {
      if (!saved[key]) continue;
      const catId = benefitOfKey(key)?.catId;
      if (catId) rank[catId] = 1;
    }
    if (practice) rank[practice.catId] = 0;
    return rank;
  }, [saved, practice, contentRev]);

  const ordered = useMemo(() => {
    const list = [...CATS];
    switch (sort) {
      case 'az':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'largest':
        return list.sort((a, b) => b.total - a.total);
      case 'started':
        return list.sort(
          (a, b) => (startedRank[a.id] ?? 2) - (startedRank[b.id] ?? 2) || a.title.localeCompare(b.title),
        );
      case 'most':
        return list.sort((a, b) => categorySocial(b.id).practising - categorySocial(a.id).practising);
      default:
        return list;
    }
  }, [sort, startedRank]);

  const corpusLine = useMemo(() => disclose(corpusPractising(), 'people practising'), []);

  const activeCat = practice ? CATS.find((c) => c.id === practice.catId) : null;
  const activeDua = activeCat && practice ? activeCat.duas[practice.duaIdx] : null;
  const night = practice ? nightForDate(practice.startedDateKey, practice.totalNights, new Date()) : 0;
  const done = !!practice && night >= practice.totalNights;

  return (
    <Screen nav="Library" contentStyle={styles.content}>
      <View style={styles.headRow}>
        <View style={styles.headText}>
          <Text style={styles.title}>Benefits</Text>
          <Text style={styles.meta}>
            {corpusLine.show
              ? `${approx(corpusLine.value)} practising · ${corpusTotal()} benefits`
              : `Grouped by purpose · ${corpusTotal()} benefits`}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Saved benefits"
          style={({ pressed }) => [styles.headBtn, pressed && styles.pressed]}
          onPress={() => navigation.navigate('Saved')}
        >
          <Icon name="bookmark" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search benefits"
        style={({ pressed }) => [styles.searchBar, pressed && styles.pressed]}
        onPress={() => navigation.navigate('BenefitSearch')}
      >
        <Icon name="search" size={20} color={colors.accent} />
        <Text style={styles.searchPlaceholder} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
          Search a purpose, name or surah
        </Text>
      </Pressable>

      {practice && activeCat && activeDua && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${done ? 'Complete' : 'In progress'}: ${shortTitle(activeDua.t)}, day ${night} of ${practice.totalNights}`}
          style={({ pressed }) => [styles.progressCard, pressed && styles.pressed]}
          onPress={() => navigation.navigate('ActivePractices')}
        >
          <ProgressRing
            size={44}
            strokeWidth={5}
            progress={night / practice.totalNights}
            color={colors.gold}
            trackColor={v3.goldWell}
          >
            <Text style={styles.ringText} numberOfLines={1} maxFontSizeMultiplier={1}>
              {`${night}/${practice.totalNights}`}
            </Text>
          </ProgressRing>
          <View style={styles.progressText}>
            <Text style={styles.progressEyebrow} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
              {done ? 'Run complete' : 'In progress'}
            </Text>
            <Text style={styles.progressTitle} numberOfLines={2}>
              {shortTitle(activeDua.t)}
            </Text>
          </View>
          <Icon name="chevron_right" size={19} color={colors.goldMeta} />
        </Pressable>
      )}

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle} numberOfLines={1}>
          Categories
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Order the list, currently ${SORT_CHIP[sort]}`}
          style={({ pressed }) => [styles.sortChip, pressed && styles.pressed]}
          onPress={openSort}
        >
          <Text style={styles.sortChipText} maxFontSizeMultiplier={CLAMP}>
            {SORT_CHIP[sort]}
          </Text>
          <Icon name="expand_more" size={17} color={colors.accent} />
        </Pressable>
      </View>

      <View style={styles.list}>
        {ordered.map((c) => {
          const free = freeCount(c);
          const locked = c.total - free;
          const activity = disclose(categorySocial(c.id).practising, 'practising');
          return (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityLabel={[
                c.title,
                c.sub,
                activity.show ? `${approxOf(activity)} practising` : null,
                `${c.total} benefits`,
              ]
                .filter(Boolean)
                .join('. ')}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              onPress={() => navigation.navigate('Category', { catId: c.id })}
            >
              <CategoryIcon catId={c.id} size={50} style={styles.rowIcon} accessible={false} />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle} numberOfLines={2}>
                  {avoidOrphan(c.title)}
                </Text>
                <Text style={styles.rowSub} numberOfLines={2}>
                  {c.sub}
                </Text>
                <View style={styles.rowRule} />
                <View style={styles.rowMeta}>
                  {activity.show ? (
                    <View style={styles.chip}>
                      <Icon name="groups" size={13} color={colors.accent} />
                      <Text style={styles.chipText} maxFontSizeMultiplier={CLAMP}>
                        {approxOf(activity)}
                      </Text>
                    </View>
                  ) : premium ? (
                    <View style={[styles.chip, styles.chipQuiet]}>
                      <Icon name="hourglass_empty" size={13} color={v3.ink2} />
                      <Text style={[styles.chipText, styles.chipTextQuiet]} maxFontSizeMultiplier={CLAMP}>
                        Too few reports
                      </Text>
                    </View>
                  ) : hidePremium ? (
                    <View style={styles.chip}>
                      <Icon name="lock_open" size={13} color={colors.accent} />
                      <Text style={styles.chipText} maxFontSizeMultiplier={CLAMP}>{`${free} free`}</Text>
                    </View>
                  ) : (
                    <View style={[styles.chip, styles.chipGold]}>
                      <Icon name="lock" size={13} color={colors.gold} />
                      <Text style={[styles.chipText, styles.chipTextGold]} maxFontSizeMultiplier={CLAMP}>
                        {`${locked} in Plus`}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.rowCount} maxFontSizeMultiplier={CLAMP}>{`${c.total} benefits`}</Text>
                </View>
              </View>
              <Icon name="chevron_right" size={19} color={v3.ink4} />
            </Pressable>
          );
        })}
      </View>

      <Sheet visible={sortOpen} onClose={() => setSortOpen(false)} bg={colors.bgCardAlt} scroll={false}>
        <View style={styles.sheetHead}>
          <Text style={styles.sheetTitle}>Order the list</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={10}
            onPress={() => setSortOpen(false)}
          >
            <Icon name="close" size={23} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.sheetOptions}>
          {SORTS.map((o) => {
            const on = draftSort === o.key;
            return (
              <Pressable
                key={o.key}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                style={({ pressed }) => [styles.option, on && styles.optionOn, pressed && styles.pressed]}
                onPress={() => setDraftSort(o.key)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, on && styles.optionLabelOn]}>{o.label}</Text>
                  {o.sub ? <Text style={styles.optionSub}>{o.sub}</Text> : null}
                </View>
                {on && <Icon name="check_circle" size={22} color={colors.accent} />}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sheetDivider} />

        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: draftHide }}
          style={({ pressed }) => [styles.toggleRow, pressed && styles.pressed]}
          onPress={() => setDraftHide((v) => !v)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.optionLabel}>Hide Plus benefits</Text>
            <Text style={styles.optionSub}>Shows the free benefit in each category</Text>
          </View>
          <View style={[styles.switchTrack, draftHide && styles.switchTrackOn]}>
            <View style={[styles.switchKnob, draftHide && styles.switchKnobOn]} />
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.apply, pressed && styles.pressed]}
          onPress={applySort}
        >
          <Text style={styles.applyText}>Apply</Text>
        </Pressable>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 16 },

  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headText: { flex: 1 },
  title: { ...serifHeading(SIZE.display), color: colors.textPrimary },
  meta: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: pinLeading(16, SIZE.meta), color: colors.textMuted, marginTop: 5 },
  headBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: v3.surfaceCard,
    alignItems: 'center', justifyContent: 'center',
  },

  searchBar: {
    minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 11,
    backgroundColor: colors.divider, borderRadius: 999, paddingHorizontal: 16,
  },
  searchPlaceholder: {
    flex: 1, fontFamily: fonts.semibold, fontSize: SIZE.body,
    lineHeight: uiLeading(SIZE.body), color: colors.textMuted,
  },

  progressCard: {
    minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.amberCardBg, borderRadius: 20, paddingVertical: 15, paddingHorizontal: 16,
  },
  ringText: { ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.caption, color: colors.gold },
  progressText: { flex: 1 },
  progressEyebrow: eyebrow(colors.gold),
  progressTitle: {
    fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: pinLeading(20, SIZE.title), color: colors.amberCardText, marginTop: 3,
  },

  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  sectionTitle: { ...serifHeading(SIZE.heading), color: colors.textPrimary, flex: 1 },
  sortChip: {
    minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingLeft: 12, paddingRight: 8, borderRadius: 999,
    borderWidth: 1, borderColor: colors.divider, flexShrink: 0,
  },
  sortChipText: { fontFamily: fonts.bold, fontSize: SIZE.body, color: colors.accent, flexShrink: 0 },

  list: { gap: 10 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 13,
    backgroundColor: v3.surfaceCard, borderTopWidth: 1, borderTopColor: v3.cardTopHighlight,
    borderRadius: 20, paddingVertical: 14, paddingHorizontal: 16,
  },
  rowIcon: { flexShrink: 0 },
  rowBody: { flex: 1 },
  rowTitle: { ...serifHeading(SIZE.title), color: colors.textPrimary },
  rowSub: {
    fontFamily: fonts.regular, fontSize: SIZE.meta,
    lineHeight: pinLeading(17, SIZE.meta), color: v3.ink1, marginTop: 3,
  },
  rowRule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.divider, marginTop: 11, marginBottom: 10 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0,
    paddingLeft: 7, paddingRight: 9, paddingVertical: 3,
    borderRadius: 999, backgroundColor: v3.accentWell,
  },
  chipGold: { backgroundColor: v3.goldWell },
  chipQuiet: { backgroundColor: v3.neutralWell },
  chipText: {
    ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.caption,
    lineHeight: uiLeading(SIZE.caption), letterSpacing: 0.3, color: colors.accent,
  },
  chipTextGold: { color: colors.gold },
  chipTextQuiet: { fontFamily: fonts.bold, letterSpacing: 0.2, color: v3.ink2 },
  rowCount: {
    flex: 1, textAlign: 'right', fontFamily: fonts.semibold, fontSize: SIZE.caption,
    lineHeight: uiLeading(SIZE.caption), letterSpacing: 0.5, color: v3.ink3,
  },

  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  sheetTitle: { ...serifHeading(SIZE.cardTitle), color: colors.textPrimary },
  sheetOptions: { gap: 9, marginTop: 16 },
  option: {
    minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.bgCard, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 16,
    borderWidth: 2, borderColor: colors.transparent,
  },
  optionOn: { borderColor: colors.accent },
  optionLabel: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: pinLeading(20, SIZE.title), color: colors.textPrimary },
  optionLabelOn: { fontFamily: fonts.extrabold },
  optionSub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: pinLeading(16, SIZE.meta), color: colors.textMuted, marginTop: 2 },

  sheetDivider: { height: 1, backgroundColor: colors.divider, marginVertical: 16 },

  toggleRow: {
    minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.bgCard, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16,
  },
  switchTrack: {
    width: 44, height: 26, borderRadius: 999, backgroundColor: colors.divider,
    padding: 3, justifyContent: 'center', flexShrink: 0,
  },
  switchTrackOn: { backgroundColor: colors.accent },
  switchKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.textMuted },
  switchKnobOn: { backgroundColor: colors.onMintText, alignSelf: 'flex-end' },

  apply: {
    minHeight: 48, borderRadius: 999, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center', marginTop: 16,
  },
  applyText: { fontFamily: fonts.extrabold, fontSize: SIZE.title, color: colors.onMintText },

  pressed: { opacity: 0.9 },
});
