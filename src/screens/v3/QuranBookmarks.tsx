import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import { fonts, serifHeading, arabicText, SIZE, CLAMP } from '../../theme/type';
import { colors, v3 } from '../../theme/v3/colors';
import { getSuraNames, getCachedSuraVerses, getSuraVerses, prefetchSura, type Ayah } from '../../data/db';
import { toggleBookmark, useQuranProgress } from '../../data/quranProgress';

export default function QuranBookmarks({ navigation }: any) {
  const { marks } = useQuranProgress();
  const suras = useMemo(() => getSuraNames(), []);

  const items = useMemo(
    () =>
      marks
        .map((k) => k.split(':').map(Number))
        .filter(([s, v]) => s > 0 && v > 0)
        .map(([suraId, verseId]) => ({ suraId, verseId })),
    [marks]
  );

  const [texts, setTexts] = useState<Record<string, Ayah>>({});
  useEffect(() => {
    let alive = true;
    const need = [...new Set(items.map((i) => i.suraId))];
    Promise.all(need.map((id) => getCachedSuraVerses(id) ?? getSuraVerses(id).catch(() => [] as Ayah[]))).then((lists) => {
      if (!alive) return;
      const next: Record<string, Ayah> = {};
      for (const list of lists) for (const a of list) next[`${a.suraId}:${a.verseId}`] = a;
      setTexts(next);
    });
    return () => {
      alive = false;
    };
  }, [items]);

  const suraName = (id: number) => suras.find((s) => s.suraId === id)?.transliterate ?? `Sura ${id}`;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow_back" size={23} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Bookmarks</Text>
          <Text style={styles.meta} maxFontSizeMultiplier={CLAMP}>
            {items.length === 0 ? 'No ayahs saved yet' : `${items.length} ${items.length === 1 ? 'ayah' : 'ayahs'} saved`}
          </Text>
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="bookmark_border" size={30} color={colors.textDisabled} />
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyBody}>Tap the bookmark on any ayah in the reader to keep it here.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => `${i.suraId}:${i.verseId}`}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const a = texts[`${item.suraId}:${item.verseId}`];
            return (
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                onPress={() => {
                  prefetchSura(item.suraId);
                  navigation.navigate('Sura', item.verseId > 1 ? { n: item.suraId, v: item.verseId } : { n: item.suraId });
                }}
              >
                <View style={styles.cardHead}>
                  <Text style={styles.cardRef}>{`${suraName(item.suraId)} · ${item.suraId}:${item.verseId}`}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remove bookmark"
                    hitSlop={12}
                    onPress={() => toggleBookmark(item.suraId, item.verseId)}
                  >
                    <Icon name="bookmark" size={20} color={colors.accent} />
                  </Pressable>
                </View>
                {!!a && (
                  <>
                    <Text style={styles.cardArabic} numberOfLines={3} maxFontSizeMultiplier={1.2}>{a.ar}</Text>
                    <Text style={styles.cardEn} numberOfLines={3}>{a.en}</Text>
                  </>
                )}
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 6, paddingBottom: 12 },
  backBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  title: { ...serifHeading(SIZE.heading), color: colors.textPrimary },
  meta: { fontFamily: fonts.regular, fontSize: SIZE.meta, color: colors.textMuted, marginTop: 2 },

  list: { paddingHorizontal: 18, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: v3.surfaceCard, borderTopWidth: 1, borderTopColor: v3.cardTopHighlight,
    borderRadius: 16, paddingVertical: 13, paddingHorizontal: 15, gap: 8,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  cardRef: { flex: 1, fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.accent },
  cardArabic: { ...arabicText(20), color: colors.textPrimary, textAlign: 'right' },
  cardEn: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 18, color: colors.textMuted },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 40, paddingBottom: 80 },
  emptyTitle: { fontFamily: fonts.bold, fontSize: SIZE.body, color: colors.textPrimary },
  emptyBody: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 18, color: colors.textMuted, textAlign: 'center' },

  pressed: { opacity: 0.9 },
});
