import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import { fonts, arabicText, SIZE, uiLeading, eyebrow } from '../../theme/type';
import { colors, v3 } from '../../theme/v3/colors';
import { ALL_BENEFITS, kindLabel, kindOf, lineFor, searchBenefits } from '../../data/benefits';
import { queryTerms, searchBy } from '../../utils/search';
import { useContentRev } from '../../data/remoteBenefits';
import { useAppState } from '../../state/AppState';

export default function BenefitSearch({ navigation }: any) {
  const [q, setQ] = useState('');
  const { premium } = useAppState();

  const contentRev = useContentRev();
  const results = useMemo(() => searchBenefits(q), [q, contentRev]);

  const grouped = useMemo(() => {
    if (!queryTerms(q).length) return { names: [], surahs: [], benefits: [] as typeof results };

    const byName = new Map<string, { tr: string; ar: string; meaning: string; n: number }>();
    const bySurah = new Map<string, { tr: string; ar: string; meaning: string; n: number }>();
    for (const b of ALL_BENEFITS) {
      const kind = kindOf(b.dua);
      if (kind !== 'name' && kind !== 'surah') continue;
      const bucket = kind === 'surah' ? bySurah : byName;
      const cur = bucket.get(b.dua.tr);
      if (cur) cur.n += 1;
      else bucket.set(b.dua.tr, { tr: b.dua.tr, ar: b.dua.n, meaning: b.dua.m, n: 1 });
    }
    const fields = (v: { tr: string; ar: string; meaning: string }) => [v.tr, v.ar, v.meaning];

    return {
      names: searchBy([...byName.values()], q, fields).slice(0, 4),
      surahs: searchBy([...bySurah.values()], q, fields).slice(0, 3),
      benefits: results,
    };
  }, [q, results, contentRev]);

  const categoriesHit = new Set(results.map((r) => r.catId)).size;

  const refine = (term: string) => setQ(term);

  const open = (r: (typeof results)[number]) => {
    if (!r.dua.free && !premium) {
      navigation.navigate('Plus', { benefitTitle: r.dua.t, categoryLabel: r.cat.title });
      return;
    }
    navigation.navigate('Benefit', { catId: r.catId, duaIdx: r.duaIdx });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.searchRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow_back" size={23} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.field}>
          <Icon name="search" size={19} color={colors.accent} />
          <TextInput
            style={styles.input}
            value={q}
            onChangeText={setQ}
            placeholder="Search a purpose, name or surah"
            placeholderTextColor={colors.textMuted}
            autoFocus
            returnKeyType="search"
            accessibilityLabel="Search benefits"
            maxFontSizeMultiplier={1.3}
          />
          {!!q && (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={10} onPress={() => setQ('')}>
              <Icon name="close" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {!!q.trim() && (
        <Text style={styles.count}>
          {results.length === 0
            ? 'No results'
            : `${results.length} ${results.length === 1 ? 'result' : 'results'} across ${categoriesHit} ${
                categoriesHit === 1 ? 'category' : 'categories'
              }`}
        </Text>
      )}

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!q.trim() ? (
          <Text style={styles.hint}>
            Try a need (“debt”), a name (“razzaq”), or a surah (“waqi‘ah”). Diacritics are optional.
          </Text>
        ) : (
          <>
            {grouped.names.length > 0 && (
              <View style={styles.group}>
                <Text style={styles.groupLabel}>Names</Text>
                {grouped.names.map((n) => (
                  <Pressable
                    key={n.tr}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.refRow, pressed && styles.pressed]}
                    onPress={() => refine(n.tr)}
                  >
                    <Text style={styles.refArabic} numberOfLines={1} maxFontSizeMultiplier={1}>
                      {n.ar}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.refTitle}>{n.tr}</Text>
                      <Text style={styles.refSub}>{`${n.meaning} · ${n.n} ${n.n === 1 ? 'benefit' : 'benefits'}`}</Text>
                    </View>
                    <Icon name="chevron_right" size={18} color={colors.textDisabled} />
                  </Pressable>
                ))}
              </View>
            )}

            {grouped.surahs.length > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.group}>
                  <Text style={styles.groupLabel}>Surahs</Text>
                  {grouped.surahs.map((n) => (
                    <Pressable
                      key={n.tr}
                      accessibilityRole="button"
                      style={({ pressed }) => [styles.refRow, pressed && styles.pressed]}
                      onPress={() => refine(n.tr)}
                    >
                      <Text style={styles.refArabic} numberOfLines={1} maxFontSizeMultiplier={1}>
                        {n.ar}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.refTitle}>{n.tr}</Text>
                        <Text style={styles.refSub}>{`${n.meaning} · ${n.n} ${n.n === 1 ? 'benefit' : 'benefits'}`}</Text>
                      </View>
                      <Icon name="chevron_right" size={18} color={colors.textDisabled} />
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {results.length > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.group}>
                  <Text style={styles.groupLabel}>Benefits</Text>
                  {results.map((r) => (
                    <Pressable
                      key={`${r.catId}:${r.duaIdx}`}
                      accessibilityRole="button"
                      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                      onPress={() => open(r)}
                    >
                      <View style={styles.cardHead}>
                        <View style={[styles.badge, r.dua.free ? styles.badgeFree : styles.badgePremium]}>
                          {!r.dua.free && <Icon name="lock" size={11} color={colors.gold} />}
                          <Text style={[styles.badgeText, r.dua.free ? styles.badgeTextFree : styles.badgeTextPremium]}>
                            {r.dua.free ? 'FREE' : 'PLUS'}
                          </Text>
                        </View>
                        <Text style={styles.cardTitle} numberOfLines={2}>
                          {r.dua.t}
                        </Text>
                      </View>
                      <Text style={styles.cardSub} numberOfLines={1}>
                        {`${kindLabel(r.dua)} · ${lineFor(r.dua)}`}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      <Text style={styles.footnote}>Searches the title, the name, the surah and the transliteration.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingTop: 6, paddingBottom: 12 },
  backBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  field: {
    flex: 1, minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.divider, borderRadius: 999, paddingHorizontal: 15,
  },
  input: { flex: 1, fontFamily: fonts.bold, fontSize: SIZE.body, color: colors.textPrimary, padding: 0 },

  count: { fontFamily: fonts.regular, fontSize: SIZE.meta, color: colors.textMuted, paddingHorizontal: 18, paddingBottom: 12 },

  content: { paddingHorizontal: 18, paddingBottom: 20, gap: 14 },
  hint: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: 21, color: colors.textDisabled, paddingTop: 8 },

  group: { gap: 9 },
  groupLabel: eyebrow(v3.ink3),
  divider: { height: 1, backgroundColor: colors.bgCardMuted },

  refRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  refArabic: { ...arabicText(20), width: 74, textAlign: 'right', color: colors.accent },
  refTitle: { fontFamily: fonts.bold, fontSize: SIZE.body, color: colors.textPrimary },
  refSub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 17, color: colors.textMuted, marginTop: 2 },

  card: { backgroundColor: v3.surfaceCard, borderTopWidth: 1, borderTopColor: v3.cardTopHighlight, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 15 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 999, paddingVertical: 3, paddingHorizontal: 8,
  },
  badgeFree: { backgroundColor: colors.accent },
  badgePremium: { backgroundColor: colors.amberCardBg },
  badgeText: { fontFamily: fonts.extrabold, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption) },
  badgeTextFree: { color: colors.onMintText },
  badgeTextPremium: { color: colors.gold },
  cardTitle: { flex: 1, fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: 18, color: colors.textPrimary },
  cardSub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 17, color: colors.textMuted, marginTop: 5 },

  footnote: { fontFamily: fonts.regular, fontSize: SIZE.meta, color: colors.textDisabled, paddingHorizontal: 18, paddingVertical: 14 },

  pressed: { opacity: 0.9 },
});
