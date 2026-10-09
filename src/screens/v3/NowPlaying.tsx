import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import Sheet from '../../components/Sheet';
import { fonts, serifHeading, arabicText, eyebrow, tabular, SIZE, CLAMP, uiLeading, bodyLeading } from '../../theme/type';
import { colors, v3 } from '../../theme/v3/colors';
import { getSuraMeta, getCachedSuraVerses, getSuraVerses, type Ayah } from '../../data/db';
import { getReciterName } from '../../data/reciters';
import { listDownloads } from '../../data/audioDownloads';
import { useQuranAudio, useAudioPosition, SPEEDS } from '../../state/QuranAudio';

function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const s = Math.floor(seconds % 60);
  return `${Math.floor(seconds / 60)}:${String(s).padStart(2, '0')}`;
}

const RANGE_LENGTHS = [3, 5, 10, 20];

export default function NowPlaying({ navigation }: any) {
  const {
    now, playing, toggle, next, previous,
    repeat, setRepeat, playRange, speed, setSpeed,
    sleepMinutes, setSleepMinutes, sleepAt,
  } = useQuranAudio();
  const { position, duration } = useAudioPosition();
  const [rangeOpen, setRangeOpen] = useState(false);

  const sura = now ? getSuraMeta(now.suraId) : null;
  const [verses, setVerses] = useState<Ayah[] | null>(() => (now ? getCachedSuraVerses(now.suraId) : null));

  React.useEffect(() => {
    if (!now) return;
    const cached = getCachedSuraVerses(now.suraId);
    if (cached) {
      setVerses(cached);
      return;
    }
    let alive = true;
    getSuraVerses(now.suraId).then((v) => alive && setVerses(v));
    return () => {
      alive = false;
    };
  }, [now?.suraId]);

  const current = useMemo(
    () => (now?.verseId != null && verses ? verses.find((v) => v.verseId === now.verseId) ?? null : null),
    [now?.verseId, verses]
  );

  const upNext = useMemo(() => {
    if (!now || !verses) return [];
    const from = (now.verseId ?? 0) + 1;
    return verses.filter((v) => v.verseId >= from).slice(0, 3);
  }, [now?.verseId, verses]);

  const setRangeOfLength = useCallback(
    (length: number) => {
      if (!now || now.verseId == null || !sura) return;
      const from = now.verseId;
      const to = Math.min(sura.verseCount, from + length - 1);
      playRange(now.suraId, from, to, repeat.times);
      setRangeOpen(false);
    },
    [now, sura, playRange, repeat.times]
  );

  if (!now) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} onPress={() => navigation.goBack()}>
            <Icon name="expand_more" size={24} color={colors.textMuted} />
          </Pressable>
          <Text style={styles.topLabel}>Now reciting</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.empty}>
          <Icon name="graphic_eq" size={30} color={colors.textDisabled} />
          <Text style={styles.emptyText}>
            Nothing is playing. Press play on a sura or on any ayah and it appears here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const pct = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;
  const saved = listDownloads().filter((d) => d.reciter === now.reciter);
  const savedMb = saved.reduce((n, d) => n + d.bytes, 0) / (1024 * 1024);
  const sleepLeft = sleepAt ? Math.max(0, Math.round((sleepAt - Date.now()) / 60000)) : 0;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="expand_more" size={24} color={colors.textMuted} />
        </Pressable>
        <Text style={styles.topLabel}>Now reciting</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose a reciter"
          hitSlop={10}
          onPress={() => navigation.navigate('Reciters')}
        >
          <Icon name="queue_music" size={22} color={colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.plate}>
          <Text style={styles.plateArabic} numberOfLines={1} maxFontSizeMultiplier={1}>
            {sura?.arabic ?? ''}
          </Text>
          <Text style={styles.plateName} numberOfLines={1}>
            {now.suraName}
          </Text>
          <Text style={styles.plateMeta} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
            {now.verseId == null
              ? `Bismillah · ${sura?.english ?? ''}`
              : `Aya ${now.verseId} of ${sura?.verseCount ?? '?'} · ${sura?.english ?? ''}`}
          </Text>
        </View>

        {current ? (
          <Text style={styles.ayah} numberOfLines={3} maxFontSizeMultiplier={1}>
            {current.ar}
          </Text>
        ) : null}

        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${pct}%` }]} />
        </View>
        <View style={styles.times}>
          <Text style={styles.time} maxFontSizeMultiplier={CLAMP}>{clock(position)}</Text>
          <Text style={styles.time} maxFontSizeMultiplier={CLAMP}>{clock(duration)}</Text>
        </View>

        <View style={styles.transport}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Playback speed ${speed}×`}
            style={({ pressed }) => [styles.sidePill, pressed && styles.pressed]}
            onPress={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed as any) + 1) % SPEEDS.length])}
          >
            <Text style={styles.sidePillText} maxFontSizeMultiplier={CLAMP}>{`${speed}×`}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Previous" hitSlop={8} onPress={previous}>
            <Icon name="skip_previous" size={32} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={playing ? 'Pause' : 'Play'}
            style={({ pressed }) => [styles.bigPlay, pressed && styles.pressed]}
            onPress={toggle}
          >
            <Icon name={playing ? 'pause' : 'play_arrow'} size={40} color={colors.onMintTextAlt} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Next sura" hitSlop={8} onPress={next}>
            <Icon name="skip_next" size={32} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Repeat ${repeat.mode}`}
            style={({ pressed }) => [styles.sidePill, repeat.mode !== 'off' && styles.sidePillOn, pressed && styles.pressed]}
            onPress={() =>
              setRepeat({ mode: repeat.mode === 'off' ? 'ayah' : repeat.mode === 'ayah' ? 'sura' : 'off' })
            }
          >
            <Icon
              name={repeat.mode === 'sura' ? 'repeat' : 'repeat_one'}
              size={18}
              color={repeat.mode === 'off' ? colors.textMuted : colors.accent}
            />
            {repeat.mode === 'ayah' || repeat.mode === 'range' ? (
              <Text style={styles.sidePillCount} maxFontSizeMultiplier={CLAMP}>
                {repeat.times}
              </Text>
            ) : null}
          </Pressable>
        </View>

        <View style={styles.rows}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={() => setRangeOpen(true)}
          >
            <Icon name="format_list_numbered" size={21} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Verse range</Text>
              <Text style={styles.rowSub} numberOfLines={1}>
                {repeat.mode === 'range'
                  ? `Aya ${repeat.from} to ${repeat.to} · loop the set ×${repeat.times}`
                  : 'Loop a run of ayat from here'}
              </Text>
            </View>
            <Icon name="chevron_right" size={19} color={v3.ink4} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Reciters')}
          >
            <Icon name="record_voice_over" size={21} color={colors.gold} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {getReciterName(now.reciter)}
              </Text>
              <Text style={[styles.rowSub, { color: colors.goldMeta }]} numberOfLines={1}>
                {saved.length > 0
                  ? `Saved for offline · ${saved.length} ${saved.length === 1 ? 'sura' : 'suras'} · ${savedMb.toFixed(0)} MB`
                  : 'Saves each sura as you play it'}
              </Text>
            </View>
            <Icon name="chevron_right" size={19} color={v3.ink4} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={() => setSleepMinutes(sleepMinutes === 0 ? 20 : 0)}
          >
            <Icon name="bedtime" size={21} color={sleepMinutes > 0 ? colors.accent : colors.textMuted} />
            <Text style={[styles.rowTitle, { flex: 1 }]}>Sleep timer</Text>
            <Text style={[styles.rowValue, sleepMinutes > 0 && { color: colors.accent }]} maxFontSizeMultiplier={CLAMP}>
              {sleepMinutes === 0 ? 'Off' : `${sleepLeft} min left`}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, styles.rowAccent, pressed && styles.pressed]}
            onPress={() =>
              navigation.navigate('Sura', now.verseId ? { n: now.suraId, v: now.verseId } : { n: now.suraId })
            }
          >
            <Icon name="auto_stories" size={21} color={colors.accent} />
            <Text style={[styles.rowTitle, { flex: 1 }]}>Open the reader at this ayah</Text>
            <Icon name="arrow_forward" size={19} color={colors.accent} />
          </Pressable>
        </View>

        {upNext.length > 0 && (
          <>
            <Text style={styles.eyebrow}>Up next</Text>
            <View style={styles.upNext}>
              {upNext.map((v, i) => {
                const endOfRange = repeat.mode === 'range' && v.verseId === repeat.to;
                return (
                  <View key={v.verseId} style={[styles.upRow, i === 2 && styles.upRowFaded]}>
                    <Text style={styles.upNum} maxFontSizeMultiplier={CLAMP}>
                      {v.verseId}
                    </Text>
                    <Text style={styles.upLabel} numberOfLines={1}>
                      {endOfRange ? `Aya ${v.verseId} · end of range` : `Aya ${v.verseId}`}
                    </Text>
                    <Text style={styles.upArabic} numberOfLines={1} maxFontSizeMultiplier={1}>
                      {v.ar.split(' ').slice(0, 2).join(' ')}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      <Sheet visible={rangeOpen} onClose={() => setRangeOpen(false)} bg={colors.bgCardAlt} scroll={false}>
        <View style={styles.sheetHead}>
          <Text style={styles.sheetTitle}>Loop a range</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} onPress={() => setRangeOpen(false)}>
            <Icon name="close" size={23} color={colors.textMuted} />
          </Pressable>
        </View>
        <View style={styles.sheetOptions}>
          {RANGE_LENGTHS.map((len) => {
            const from = now.verseId ?? 1;
            const to = Math.min(sura?.verseCount ?? from, from + len - 1);
            const on = repeat.mode === 'range' && repeat.from === from && repeat.to === to;
            return (
              <Pressable
                key={len}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                style={({ pressed }) => [styles.option, on && styles.optionOn, pressed && styles.pressed]}
                onPress={() => setRangeOfLength(len)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, on && { color: colors.accent }]}>{`${len} ayat`}</Text>
                  <Text style={styles.optionSub}>{`Aya ${from} to ${to}, looped ×${repeat.times}`}</Text>
                </View>
                {on && <Icon name="check_circle" size={22} color={colors.accent} />}
              </Pressable>
            );
          })}
          {repeat.mode === 'range' && (
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}
              onPress={() => {
                setRepeat({ mode: 'off' });
                setRangeOpen(false);
              }}
            >
              <Text style={[styles.optionLabel, { color: colors.textMuted }]}>Stop looping</Text>
            </Pressable>
          )}
        </View>
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  pressed: { opacity: 0.85 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  topLabel: eyebrow(colors.textMuted),
  content: { paddingHorizontal: 20, paddingBottom: 32 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 40 },
  emptyText: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: bodyLeading(SIZE.body), color: colors.textMuted, textAlign: 'center' },

  plate: { backgroundColor: '#1F3D34', borderRadius: 26, paddingVertical: 32, paddingHorizontal: 22, alignItems: 'center' },
  plateArabic: { ...arabicText(46), color: colors.mint, textAlign: 'center' },
  plateName: { ...serifHeading(SIZE.display - 4), color: colors.textPrimary, marginTop: 14 },
  plateMeta: { fontFamily: fonts.regular, fontSize: SIZE.meta, color: colors.mint, marginTop: 5 },

  ayah: { ...arabicText(22), color: colors.textSecondary, textAlign: 'right', marginTop: 20 },

  track: { marginTop: 16, height: 4, borderRadius: 2, backgroundColor: colors.bgCard, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 2, backgroundColor: colors.accent },
  times: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  time: { ...tabular, fontFamily: fonts.bold, fontSize: SIZE.caption, color: colors.textMuted },

  transport: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 },
  bigPlay: { width: 74, height: 74, borderRadius: 37, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  sidePill: {
    minWidth: 48, minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    borderRadius: 999, backgroundColor: colors.bgCard, paddingHorizontal: 12,
  },
  sidePillOn: { backgroundColor: colors.iconChipBg },
  sidePillText: { ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.meta, color: colors.mint },
  sidePillCount: { ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.meta, color: colors.accent },

  rows: { marginTop: 22, gap: 9 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: v3.surfaceCard, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16,
  },
  rowAccent: { backgroundColor: colors.bgCardMuted, borderWidth: 1, borderColor: colors.outlineBorder },
  rowTitle: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.textPrimary },
  rowSub: { fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.textMuted, marginTop: 2 },
  rowValue: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textMuted },

  eyebrow: { ...eyebrow(colors.textMuted), marginTop: 22 },
  upNext: { marginTop: 10, gap: 9 },
  upRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  upRowFaded: { opacity: 0.6 },
  upNum: { ...tabular, width: 26, fontFamily: fonts.extrabold, fontSize: SIZE.meta, color: colors.textDisabled },
  upLabel: { flex: 1, fontFamily: fonts.bold, fontSize: SIZE.body, color: colors.textSecondary },
  upArabic: { ...arabicText(17), color: colors.textFaint, maxWidth: '45%' },

  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14 },
  sheetTitle: { ...serifHeading(SIZE.heading), color: colors.textPrimary, flex: 1 },
  sheetOptions: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: v3.surfaceCard, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 1, borderColor: 'transparent',
  },
  optionOn: { borderColor: colors.accent, backgroundColor: v3.accentTint },
  optionLabel: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.textPrimary },
  optionSub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: colors.textMuted, marginTop: 2 },
});
