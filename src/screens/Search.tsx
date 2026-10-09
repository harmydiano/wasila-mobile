import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Icon from '../components/Icon';
import { colors } from '../theme/colors';
import { fonts } from '../theme/type';
import { CATS } from '../data/content';
import { useAppState } from '../state/AppState';

const SUGGESTIONS = ['When sick', 'To clear a debt', 'Protection of the home', 'Ease in labour', 'Yā Laṭīf', 'Al-Wāqiʿah'];
const RECENTS = ['Increase in sustenance in 7 days', 'Relief from a constricted chest', 'Elevation in rank at work'];

export default function Search({ navigation }: any) {
  const [query, setQuery] = useState('');
  const { premium } = useAppState();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: { catId: string; catTitle: string; duaIdx: number; dua: any }[] = [];
    for (const cat of CATS) {
      cat.duas.forEach((d, i) => {
        const hay = `${d.t} ${d.tr} ${d.m} ${cat.title} ${cat.sub}`.toLowerCase();
        if (hay.includes(q)) out.push({ catId: cat.id, catTitle: cat.title, duaIdx: i, dua: d });
      });
    }
    return out.slice(0, 12);
  }, [query]);

  const hasQuery = query.trim().length > 0;

  return (
    <Screen nav="Library" contentStyle={{ paddingHorizontal: 20, gap: 16 }}>
      <Header title="" onBack={() => navigation.goBack()} />
      <View style={styles.searchBar}>
        <Icon name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="When sick, for debt, Yā Laṭīf…"
          placeholderTextColor={colors.textFaint}
          value={query}
          onChangeText={setQuery}
        />
        {hasQuery && (
          <Pressable onPress={() => setQuery('')}>
            <Icon name="close" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {!hasQuery && (
        <View style={{ gap: 20 }}>
          <View style={{ gap: 10 }}>
            <Text style={styles.eyebrow}>Try</Text>
            <View style={styles.chipWrap}>
              {SUGGESTIONS.map((s) => (
                <Pressable key={s} style={styles.chip} onPress={() => setQuery(s)}>
                  <Text style={styles.chipText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={{ gap: 6 }}>
            <Text style={styles.eyebrow}>Recent</Text>
            {RECENTS.map((r) => (
              <Pressable key={r} style={styles.recentRow} onPress={() => setQuery(r)}>
                <Icon name="history" size={16} color={colors.textMuted} />
                <Text style={styles.recentText}>{r}</Text>
                <View style={{ flex: 1 }} />
                <Icon name="north_west" size={14} color={colors.textDisabled} />
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {hasQuery && results.length === 0 && (
        <View style={styles.emptyWrap}>
          <Icon name="search_off" size={30} color={colors.textDisabled} />
          <Text style={styles.emptyTitle}>Nothing for that yet</Text>
          <Text style={styles.emptyBody}>Try a purpose in plain words, or the name of a surah.</Text>
        </View>
      )}

      {hasQuery && results.length > 0 && (
        <View style={{ gap: 10 }}>
          <Text style={styles.eyebrow}>{results.length} {results.length === 1 ? 'result' : 'results'}</Text>
          {results.map((r) => {
            const locked = !r.dua.free && !premium;
            return (
              <Pressable
                key={`${r.catId}:${r.duaIdx}`}
                style={styles.resultRow}
                onPress={() => navigation.navigate('DuaDetail', { catId: r.catId, duaIdx: r.duaIdx })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultCat}>{r.catTitle}</Text>
                  <Text style={styles.resultTitle}>{r.dua.t}</Text>
                  <Text style={styles.resultSummary}>{r.dua.tr} · {r.dua.c} · {r.dua.tm}</Text>
                </View>
                {locked ? (
                  <View style={styles.lockCircle}>
                    <Icon name="lock" size={13} color={colors.gold} />
                  </View>
                ) : (
                  <Icon name="chevron_right" size={18} color={colors.textDisabled} />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.bgInput, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 12 },
  input: { flex: 1, fontFamily: fonts.semibold, fontSize: 13.5, color: colors.textPrimary },
  eyebrow: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.textMuted },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.outlineBorder },
  chipText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.textSecondary },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  recentText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textSecondary },
  emptyWrap: { alignItems: 'center', gap: 8, paddingVertical: 50 },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.textPrimary },
  emptyBody: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted, textAlign: 'center' },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bgCard, borderRadius: 16, padding: 14 },
  resultCat: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textFaint },
  resultTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.textPrimary, marginTop: 3 },
  resultSummary: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
  lockCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.amberCardBg, alignItems: 'center', justifyContent: 'center' },
});
