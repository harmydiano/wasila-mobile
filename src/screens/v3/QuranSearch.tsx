import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import { fonts, arabicText, SIZE, eyebrow, CLAMP } from '../../theme/type';
import { colors, v3 } from '../../theme/v3/colors';
import { getSuraNames, prefetchSura, searchAyahs, warmAyahIndex, type Ayah } from '../../data/db';
import { fold, searchBy } from '../../utils/search';

const REF_RE = /^\s*(\d{1,3})\s*[:.\s]\s*(\d{1,3})\s*$/;

export default function QuranSearch({ navigation }: any) {
  const [q, setQ] = useState('');
  const suras = useMemo(() => getSuraNames(), []);

  const ref = useMemo(() => {
    const m = q.match(REF_RE);
    if (!m) return null;
    const sura = suras.find((s) => s.suraId === Number(m[1]));
    const verse = Number(m[2]);
    return sura && verse >= 1 && verse <= sura.verseCount ? { sura, verse } : null;
  }, [q, suras]);

  const suraHits = useMemo(
    () => searchBy(suras, q, (s) => [s.transliterate, s.english, s.arabic, String(s.suraId)]).slice(0, 5),
    [q, suras]
  );

  const [ayahs, setAyahs] = useState<{ hits: Ayah[]; total: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const seq = useRef(0);
  useEffect(() => warmAyahIndex(), []);
  useEffect(() => {
    const id = ++seq.current;
    if (fold(q).length < 2 || ref) {
      setAyahs(null);
      setBusy(false);
      return;
    }
    setBusy(true);
    const t = setTimeout(() => {
      searchAyahs(q)
        .then((r) => id === seq.current && setAyahs(r))
        .catch(() => id === seq.current && setAyahs({ hits: [], total: 0 }))
        .finally(() => id === seq.current && setBusy(false));
    }, 220);
    return () => clearTimeout(t);
  }, [q, ref]);

  const suraName = (id: number) => suras.find((s) => s.suraId === id)?.transliterate ?? `Sura ${id}`;

  const openSura = (n: number, v?: number) => {
    prefetchSura(n);
    navigation.navigate('Sura', v && v > 1 ? { n, v } : { n });
  };

  const hasQuery = !!q.trim();
  const nothing = hasQuery && !busy && !ref && suraHits.length === 0 && (!ayahs || ayahs.total === 0);

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
            placeholder="A sura, a word, or 2:255"
            placeholderTextColor={colors.textMuted}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search the Quran"
            maxFontSizeMultiplier={1.3}
          />
          {!!q && (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={10} onPress={() => setQ('')}>
              <Icon name="close" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!hasQuery ? (
          <Text style={styles.hint}>
            Try a sura (“yasin”, “the cave”), a word from the translation (“patience”), Arabic, or a verse number (“2:255”). Diacritics are optional.
          </Text>
        ) : (
          <>
            {ref && (
              <View style={styles.group}>
                <Text style={styles.groupLabel}>Verse</Text>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                  onPress={() => openSura(ref.sura.suraId, ref.verse)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{`${ref.sura.transliterate} ${ref.sura.suraId}:${ref.verse}`}</Text>
                    <Text style={styles.rowSub}>{`Open at verse ${ref.verse} of ${ref.sura.verseCount}`}</Text>
                  </View>
                  <Icon name="chevron_right" size={18} color={colors.textDisabled} />
                </Pressable>
              </View>
            )}

            {suraHits.length > 0 && (
              <View style={styles.group}>
                <Text style={styles.groupLabel}>Suras</Text>
                {suraHits.map((s) => (
                  <Pressable
                    key={s.suraId}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                    onPress={() => openSura(s.suraId)}
                  >
                    <Text style={styles.num} maxFontSizeMultiplier={CLAMP}>{s.suraId}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{s.transliterate}</Text>
                      <Text style={styles.rowSub}>{`${s.english} · ${s.verseCount} verses`}</Text>
                    </View>
                    <Text style={styles.rowArabic} numberOfLines={1} maxFontSizeMultiplier={1}>{s.arabic}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {busy && !ayahs && <ActivityIndicator color={colors.accent} style={{ marginTop: 12 }} />}

            {!!ayahs && ayahs.total > 0 && (
              <View style={styles.group}>
                <Text style={styles.groupLabel}>
                  {ayahs.total > ayahs.hits.length
                    ? `Ayahs · first ${ayahs.hits.length} of ${ayahs.total.toLocaleString()}`
                    : `Ayahs · ${ayahs.total}`}
                </Text>
                {ayahs.hits.map((a) => (
                  <Pressable
                    key={`${a.suraId}:${a.verseId}`}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                    onPress={() => openSura(a.suraId, a.verseId)}
                  >
                    <Text style={styles.cardRef}>{`${suraName(a.suraId)} · ${a.suraId}:${a.verseId}`}</Text>
                    <Text style={styles.cardArabic} numberOfLines={2} maxFontSizeMultiplier={1.2}>{a.ar}</Text>
                    <Text style={styles.cardEn} numberOfLines={3}>{a.en}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {nothing && <Text style={styles.hint}>Nothing matches “{q.trim()}”.</Text>}
          </>
        )}
      </ScrollView>
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

  content: { paddingHorizontal: 18, paddingBottom: 24, gap: 18 },
  hint: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: 21, color: colors.textDisabled, paddingTop: 8 },

  group: { gap: 9 },
  groupLabel: eyebrow(v3.ink3),

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  num: { width: 28, textAlign: 'center', fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textMuted },
  rowTitle: { fontFamily: fonts.bold, fontSize: SIZE.body, color: colors.textPrimary },
  rowSub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 17, color: colors.textMuted, marginTop: 2 },
  rowArabic: { ...arabicText(20), color: colors.accent, maxWidth: 120, textAlign: 'right' },

  card: {
    backgroundColor: v3.surfaceCard, borderTopWidth: 1, borderTopColor: v3.cardTopHighlight,
    borderRadius: 16, paddingVertical: 13, paddingHorizontal: 15, gap: 6,
  },
  cardRef: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.accent },
  cardArabic: { ...arabicText(19), color: colors.textPrimary, textAlign: 'right' },
  cardEn: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 18, color: colors.textMuted },

  pressed: { opacity: 0.9 },
});
