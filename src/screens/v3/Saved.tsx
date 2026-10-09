import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Screen from '../../components/Screen';
import Icon from '../../components/Icon';
import { fonts, serifHeading, SIZE } from '../../theme/type';
import { colors, v3 } from '../../theme/v3/colors';
import { ALL_BENEFITS, benefitKey, heroShowsArabic, kindLabel, lineFor, runLabel, runsFor, type Run } from '../../data/benefits';
import { useContentRev } from '../../data/remoteBenefits';
import { useAppState, dayKey } from '../../state/AppState';

type Filter = 'all' | 'passages' | 'practices';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'passages', label: 'Passages' },
  { key: 'practices', label: 'Practices' },
];

function runLine(runs: Run[], segment: number, tally: number, target: number) {
  const where = runs.length > 1 ? runLabel(runs, Math.min(segment, runs.length - 1)) : null;
  return [where, `${tally} of ${target}`].filter(Boolean).join(' · ');
}

export default function Saved({ navigation }: any) {
  const { saved, practice, premium } = useAppState();
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState(false);
  const { toggleSaved } = useAppState();
  const contentRev = useContentRev();

  const rows = useMemo(
    () =>
      ALL_BENEFITS.filter((b) => saved[benefitKey(b.catId, b.duaIdx)]).map((b) => {
        const runs = runsFor(b.dua);
        const isPractice = runs.length > 0;
        const mine =
          practice && practice.catId === b.catId && practice.duaIdx === b.duaIdx ? practice : null;
        return { ...b, runs, isPractice, mine };
      }),
    [saved, practice, contentRev],
  );

  const shown = useMemo(
    () =>
      filter === 'all'
        ? rows
        : rows.filter((r) => (filter === 'practices' ? r.isPractice : !r.isPractice)),
    [rows, filter],
  );

  const running = rows.filter((r) => r.mine).length;

  const open = (catId: string, duaIdx: number, free: boolean, title: string, catTitle: string) => {
    if (!free && !premium) {
      navigation.navigate('Plus', { benefitTitle: title, categoryLabel: catTitle });
      return;
    }
    navigation.navigate('Benefit', { catId, duaIdx });
  };

  return (
    <Screen nav="Library" contentStyle={styles.content}>
      <View style={styles.head}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow_back" size={23} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Saved</Text>
          <Text style={styles.sub}>
            {rows.length === 0
              ? 'Nothing saved yet'
              : `${rows.length} ${rows.length === 1 ? 'benefit' : 'benefits'}${
                  running ? ` · ${running} with a count running` : ''
                }`}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={editing ? 'Done editing' : 'Edit saved list'}
          hitSlop={10}
          style={styles.backBtn}
          onPress={() => setEditing((e) => !e)}
        >
          <Icon name={editing ? 'check' : 'edit'} size={21} color={editing ? colors.accent : colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.segmented}>
        {FILTERS.map((f) => {
          const on = filter === f.key;
          return (
            <Pressable
              key={f.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={({ pressed }) => [styles.segment, on && styles.segmentOn, pressed && styles.pressed]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.segmentText, on && styles.segmentTextOn]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {shown.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="bookmark_border" size={30} color={colors.textDisabled} />
          <Text style={styles.emptyText}>
            {rows.length === 0
              ? 'The bookmark on any benefit puts it here, so what you keep returning to is one tap from the tab.'
              : 'Nothing saved under this filter yet.'}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {shown.map((r) => {
            const key = benefitKey(r.catId, r.duaIdx);
            const live = r.mine;
            const tally = live && live.tallyDateKey === dayKey(new Date()) ? live.tally : 0;
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                onPress={() => open(r.catId, r.duaIdx, r.dua.free, r.dua.t, r.cat.title)}
              >
                <View style={[styles.rowIcon, live && styles.rowIconLive]}>
                  <Icon name={r.cat.icon} size={20} color={live ? colors.gold : colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={2}>
                    {r.dua.t}
                  </Text>
                  <Text style={[styles.rowSub, live && styles.rowSubLive]} numberOfLines={1}>
                    {live && r.isPractice
                      ? runLine(r.runs, live.segment ?? 0, tally, live.target)
                      : `${kindLabel(r.dua)} · ${heroShowsArabic(r.dua) ? lineFor(r.dua) : r.cat.title}`}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={editing ? `Remove ${r.dua.t} from saved` : 'Saved'}
                  hitSlop={10}
                  disabled={!editing}
                  onPress={() => toggleSaved(key)}
                >
                  <Icon
                    name={editing ? 'remove_circle_outline' : 'bookmark'}
                    size={20}
                    color={editing ? colors.warmAccent : live ? colors.gold : colors.accent}
                  />
                </Pressable>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 28, gap: 14 },

  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  title: { ...serifHeading(SIZE.display), color: colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 17, color: colors.textMuted, marginTop: 3 },

  segmented: { flexDirection: 'row', gap: 5, backgroundColor: colors.bgCardMuted, borderRadius: 999, padding: 4 },
  segment: { flex: 1, minHeight: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  segmentOn: { backgroundColor: colors.mint },
  segmentText: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textMuted },
  segmentTextOn: { fontFamily: fonts.extrabold, color: colors.onMintText },

  list: { gap: 10 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: v3.surfaceCard, borderTopWidth: 1, borderTopColor: v3.cardTopHighlight, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 15,
  },
  rowIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.iconChipBg, alignItems: 'center', justifyContent: 'center' },
  rowIconLive: { backgroundColor: colors.amberCardBg },
  rowTitle: { fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: 19, color: colors.textPrimary },
  rowSub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 17, color: colors.textMuted, marginTop: 3 },
  rowSubLive: { fontFamily: fonts.bold, color: colors.gold },

  empty: { alignItems: 'center', gap: 12, paddingVertical: 40, paddingHorizontal: 20 },
  emptyText: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: 21, color: colors.textMuted, textAlign: 'center' },

  pressed: { opacity: 0.9 },
});
