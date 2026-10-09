import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import { fonts, serifHeading, SIZE, CLAMP, uiLeading, bodyLeading, tabular } from '../../theme/type';
import { colors, v3 } from '../../theme/v3/colors';
import { RECITERS, getReciterName } from '../../data/reciters';
import { searchBy } from '../../utils/search';
import { listDownloads } from '../../data/audioDownloads';
import { getSuraNames } from '../../data/db';
import { useAppState } from '../../state/AppState';
import { useQuranAudio } from '../../state/QuranAudio';

const PREMIUM = new Set(['ar.abdulsamad', 'ar.alafasy']);

export default function Reciters({ navigation }: any) {
  const { reciter, setReciter, premium } = useAppState();
  const { now } = useQuranAudio();
  const [query, setQuery] = useState('');

  const total = getSuraNames().length || 114;

  const saved = useMemo(() => {
    const byReciter = new Map<string, { count: number; bytes: number }>();
    for (const d of listDownloads()) {
      const e = byReciter.get(d.reciter) ?? { count: 0, bytes: 0 };
      e.count += 1;
      e.bytes += d.bytes;
      byReciter.set(d.reciter, e);
    }
    return byReciter;
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? searchBy(RECITERS, q, (r) => [r.name]) : RECITERS;
  }, [query]);

  const pick = (id: string) => {
    if (PREMIUM.has(id) && !premium) {
      navigation.navigate('Plus', { benefitTitle: getReciterName(id), categoryLabel: 'Reciters' });
      return;
    }
    setReciter(id);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.head}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="arrow_back" size={23} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Reciters</Text>
      </View>

      <View style={styles.search}>
        <Icon name="search" size={20} color={colors.accent} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search a reciter"
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search a reciter"
        />
        {query.length > 0 && (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8} onPress={() => setQuery('')}>
            <Icon name="close" size={19} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      <View style={styles.list}>
        {rows.map((r) => {
          const on = r.id === reciter;
          const locked = PREMIUM.has(r.id) && !premium;
          const s = saved.get(r.id);
          const sounding = now?.reciter === r.id;
          const tone = locked ? colors.gold : on ? colors.accent : colors.textMuted;
          return (
            <Pressable
              key={r.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={[
                r.name,
                on ? 'selected' : null,
                locked ? 'in Plus' : null,
                s ? `${s.count} of ${total} saved` : 'nothing saved',
              ]
                .filter(Boolean)
                .join('. ')}
              style={({ pressed }) => [styles.row, on && styles.rowOn, pressed && styles.pressed]}
              onPress={() => pick(r.id)}
            >
              <View style={styles.avatar}>
                <Icon name="record_voice_over" size={24} color={tone} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.name, on && styles.nameOn]} numberOfLines={1}>
                  {r.name}
                </Text>
                <Text style={[styles.meta, locked && styles.metaGold, on && styles.metaOn]} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                  {locked
                    ? 'Plus · murattal'
                    : [
                        on ? 'Selected' : sounding ? 'Playing' : `${r.bitrate} kbps`,
                        s ? `${s.count} of ${total} saved · ${(s.bytes / (1024 * 1024)).toFixed(0)} MB` : 'Nothing saved yet',
                      ].join(' · ')}
                </Text>
                {s && s.count > 0 && s.count < total ? (
                  <View style={styles.track}>
                    <View style={[styles.trackFill, { width: `${Math.round((s.count / total) * 100)}%` }]} />
                  </View>
                ) : null}
              </View>
              <Icon
                name={locked ? 'lock' : on ? 'check_circle' : 'chevron_right'}
                size={locked ? 22 : on ? 26 : 20}
                color={locked ? colors.gold : on ? colors.accent : v3.ink4}
              />
            </Pressable>
          );
        })}
        {rows.length === 0 && <Text style={styles.empty}>No reciter by that name.</Text>}
      </View>

      {!premium && (
        <View style={styles.plusCard}>
          <Text style={styles.plusTitle}>Every voice, and every sura offline</Text>
          <Text style={styles.plusBody}>
            Plus opens the premium reciters and saves whole recitations for listening without a connection.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.plusCta, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Plus', { categoryLabel: 'Reciters' })}
          >
            <Text style={styles.plusCtaText}>See plans</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.footNote}>
        <Icon name="info" size={16} color={v3.ink3} />
        <Text style={styles.footNoteText}>
          A sura is saved the first time you play it. Remove what is stored under More › Downloads.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot, paddingHorizontal: 20 },
  pressed: { opacity: 0.85 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 8, paddingBottom: 14 },
  title: { ...serifHeading(SIZE.display - 4), color: colors.textPrimary },

  search: {
    flexDirection: 'row', alignItems: 'center', gap: 11, minHeight: 48,
    backgroundColor: colors.divider, borderRadius: 999, paddingHorizontal: 16, marginBottom: 14,
  },
  searchInput: {
    flex: 1, fontFamily: fonts.semibold, fontSize: SIZE.body,
    color: colors.textPrimary, paddingVertical: 0,
  },

  list: { gap: 9 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 13,
    backgroundColor: v3.surfaceCard, borderTopWidth: 1, borderTopColor: v3.cardTopHighlight,
    borderWidth: 1, borderColor: 'transparent',
    borderRadius: 18, paddingVertical: 13, paddingHorizontal: 14,
  },
  rowOn: { backgroundColor: colors.bgCardMuted, borderColor: colors.accent },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.iconChipBg,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  name: { ...serifHeading(SIZE.title), color: colors.textPrimary },
  nameOn: { fontFamily: fonts.serifBold },
  meta: { fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.textMuted, marginTop: 2 },
  metaOn: { color: colors.accent },
  metaGold: { color: colors.gold },
  track: { marginTop: 7, height: 3, borderRadius: 2, backgroundColor: colors.outlineBorder, overflow: 'hidden' },
  trackFill: { height: '100%', backgroundColor: colors.accent },
  empty: { fontFamily: fonts.regular, fontSize: SIZE.body, color: colors.textMuted, paddingVertical: 20, textAlign: 'center' },

  plusCard: {
    backgroundColor: colors.bgCardMuted, borderWidth: 1, borderColor: colors.outlineBorder,
    borderRadius: 20, padding: 16, marginTop: 14,
  },
  plusTitle: { ...serifHeading(SIZE.heading), color: colors.textPrimary },
  plusBody: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: bodyLeading(SIZE.meta), color: colors.textMuted, marginTop: 5 },
  plusCta: { backgroundColor: colors.accent, borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 14 },
  plusCtaText: { fontFamily: fonts.extrabold, fontSize: SIZE.title, color: colors.onMintTextAlt },

  footNote: { flexDirection: 'row', gap: 9, alignItems: 'flex-start', paddingVertical: 14 },
  footNoteText: { flex: 1, ...tabular, fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: bodyLeading(SIZE.caption), color: v3.ink3 },
});
