import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import ReciterPickerSheet from '../../components/ReciterPickerSheet';
import { fonts, serifHeading, tabular, SIZE, bodyLeading, eyebrow } from '../../theme/type';
import { avoidOrphan } from '../../utils/typography';
import { colors, v3 } from '../../theme/v3/colors';
import { benefitAt, benefitKey, blocksFor, passageOf } from '../../data/benefits';
import { getReciterName } from '../../data/reciters';
import { useAppState } from '../../state/AppState';

const SPEEDS = [1, 1.25, 1.5, 0.75];
const REPEATS = [1, 3, 5, 0];

function clock(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function Listen({ route, navigation }: any) {
  const { catId, duaIdx } = route.params ?? {};
  const { cat, dua, idx } = benefitAt(catId, duaIdx);
  const key = benefitKey(cat.id, idx);

  const { isSaved, toggleSaved, reciter, setReciter } = useAppState();
  const [reciterOpen, setReciterOpen] = useState(false);

  const passage = useMemo(() => passageOf(blocksFor(dua)), [dua]);
  const lines = passage?.lines ?? [];
  const total = passage?.seconds ?? Math.max(20, lines.length * 11);
  const bounds = useMemo(() => {
    const weights = lines.map((l) => Math.max(1, (l.tr || l.ar || '').length));
    const sum = weights.reduce((a, b) => a + b, 0) || 1;
    let acc = 0;
    return weights.map((w) => {
      acc += (w / sum) * total;
      return acc;
    });
  }, [lines, total]);

  const [playing, setPlaying] = useState(true);
  const [position, setPosition] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [repeat, setRepeat] = useState(1);
  const [pass, setPass] = useState(1);

  const lineIndex = bounds.findIndex((b) => position < b);
  const current = lineIndex === -1 ? Math.max(0, lines.length - 1) : lineIndex;

  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!playing) return;
    tick.current = setInterval(() => {
      setPosition((p) => {
        const next = p + 0.25 * speed;
        if (next < total) return next;
        if (repeat === 0) return 0;
        setPass((n) => {
          if (n >= repeat) setPlaying(false);
          return n + 1;
        });
        return 0;
      });
    }, 250);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [playing, speed, total, repeat]);

  const seekLine = (delta: number) => {
    const target = Math.max(0, Math.min(lines.length - 1, current + delta));
    setPosition(target === 0 ? 0 : bounds[target - 1]);
    setPass(1);
  };

  if (!passage) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} onPress={() => navigation.goBack()}>
            <Icon name="expand_more" size={24} color={colors.textMuted} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>This benefit has no passage to recite.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="expand_more" size={24} color={colors.textMuted} />
        </Pressable>
        <Text style={styles.topEyebrow}>Now reciting</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isSaved(key) ? 'Remove from saved' : 'Save this benefit'}
          hitSlop={10}
          onPress={() => toggleSaved(key)}
        >
          <Icon name={isSaved(key) ? 'bookmark' : 'bookmark_border'} size={22} color={isSaved(key) ? colors.gold : colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroEyebrow} numberOfLines={1} maxFontSizeMultiplier={1.3}>
          {cat.title}
        </Text>
        <Text style={styles.heroTitle}>{avoidOrphan(dua.t)}</Text>
        <Text style={styles.heroMeta}>
          {`Line ${current + 1} of ${lines.length} · ${clock(position)} total ${clock(total)}`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.lines}>
        {lines.map((l, i) => {
          const state = i === current ? 'live' : i < current ? 'past' : 'ahead';
          return (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={`Jump to line ${i + 1}`}
              style={state === 'live' ? styles.lineLive : styles.line}
              onPress={() => {
                setPosition(i === 0 ? 0 : bounds[i - 1]);
                setPass(1);
              }}
            >
              <Text
                style={[
                  styles.lineText,
                  state === 'live' && styles.lineTextLive,
                  state === 'ahead' && styles.lineTextAhead,
                ]}
              >
                {l.tr || l.ar}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { flex: Math.min(1, position / total) }]} />
          <View style={{ flex: Math.max(0, 1 - position / total) }} />
        </View>
        <View style={styles.times}>
          <Text style={styles.time}>{clock(position)}</Text>
          <Text style={styles.time}>{clock(total)}</Text>
        </View>
      </View>

      <View style={styles.transport}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Speed ${speed}×`}
          style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
          onPress={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length])}
        >
          <Text style={styles.pillText}>{`${speed}×`}</Text>
        </Pressable>

        <Pressable accessibilityRole="button" accessibilityLabel="Previous line" hitSlop={8} onPress={() => seekLine(-1)}>
          <Icon name="skip_previous" size={30} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Pause' : 'Play'}
          style={({ pressed }) => [styles.play, pressed && styles.pressed]}
          onPress={() => setPlaying((p) => !p)}
        >
          <Icon name={playing ? 'pause' : 'play_arrow'} size={38} color={colors.onMintText} />
        </Pressable>

        <Pressable accessibilityRole="button" accessibilityLabel="Next line" hitSlop={8} onPress={() => seekLine(1)}>
          <Icon name="skip_next" size={30} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={repeat === 0 ? 'Repeat forever' : `Repeat ${repeat} times`}
          style={({ pressed }) => [styles.pill, styles.pillRepeat, pressed && styles.pressed]}
          onPress={() => setRepeat((r) => REPEATS[(REPEATS.indexOf(r) + 1) % REPEATS.length])}
        >
          <Icon name="repeat" size={18} color={colors.accent} />
          <Text style={styles.pillTextMint}>{repeat === 0 ? '∞' : String(repeat)}</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.reciterRow, pressed && styles.pressed]}
        onPress={() => setReciterOpen(true)}
      >
        <Icon name="record_voice_over" size={20} color={colors.gold} />
        <Text style={styles.reciterText} numberOfLines={1}>
          {`${getReciterName(reciter)} · reading pace`}
        </Text>
        <Icon name="chevron_right" size={19} color={v3.ink4} />
      </Pressable>

      <ReciterPickerSheet
        visible={reciterOpen}
        onClose={() => setReciterOpen(false)}
        value={reciter}
        onChange={(id) => {
          setReciter(id);
          setReciterOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 6, minHeight: 44 },
  topEyebrow: eyebrow(colors.textMuted),

  hero: { marginHorizontal: 18, marginTop: 6, backgroundColor: colors.tealGradMid, borderRadius: 26, paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center' },
  heroEyebrow: eyebrow(colors.mint),
  heroTitle: { ...serifHeading(SIZE.cardTitle), color: colors.onTeal, textAlign: 'center', marginTop: 12 },
  heroMeta: { ...tabular, fontFamily: fonts.regular, fontSize: SIZE.meta, color: '#B4DED7', marginTop: 8 },

  lines: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 4, gap: 10 },
  line: { paddingVertical: 12, paddingHorizontal: 16 },
  lineLive: {
    backgroundColor: v3.accentTint, borderLeftWidth: 2, borderLeftColor: colors.accent,
    borderTopLeftRadius: 4, borderBottomLeftRadius: 4, borderTopRightRadius: 16, borderBottomRightRadius: 16,
    paddingVertical: 14, paddingHorizontal: 16,
  },
  lineText: { fontFamily: fonts.serifMedium, fontSize: SIZE.title, lineHeight: bodyLeading(SIZE.title), color: colors.textFaint },
  lineTextLive: { color: colors.textPrimary },
  lineTextAhead: { color: '#4E635B' },

  progressWrap: { paddingHorizontal: 20, paddingTop: 12 },
  progressTrack: { flexDirection: 'row', height: 4, borderRadius: 2, backgroundColor: v3.surfaceCard, overflow: 'hidden' },
  progressFill: { backgroundColor: colors.accent, borderRadius: 2 },
  times: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  time: { ...tabular, fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textMuted },

  transport: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 12 },
  pill: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 13, borderRadius: 999, backgroundColor: v3.surfaceCard },
  pillRepeat: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11 },
  pillText: { ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.meta, color: colors.mint },
  pillTextMint: { ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.meta, color: colors.accent },
  play: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },

  reciterRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8, minHeight: 52 },
  reciterText: { flex: 1, fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textSecondary },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyText: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: 21, color: colors.textMuted, textAlign: 'center' },

  pressed: { opacity: 0.9 },
});
