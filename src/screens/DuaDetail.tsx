import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import Icon from '../components/Icon';
import MetaChip from '../components/MetaChip';
import ProgressRing from '../components/ProgressRing';
import Button from '../components/Button';
import ReflectionsSheet from './sheets/ReflectionsSheet';
import WriteReflectionSheet from './sheets/WriteReflectionSheet';
import { colors } from '../theme/colors';
import { fonts } from '../theme/type';
import { CATS, REFL_POOL } from '../data/content';
import { duaStats } from '../utils/seed';
import { useAppState } from '../state/AppState';

function parseTarget(c: string) {
  const n = parseInt(String(c).replace(/[^0-9]/g, ''), 10);
  return n || 1;
}

export default function DuaDetail({ route, navigation }: any) {
  const { catId, duaIdx } = route.params;
  const cat = CATS.find((c) => c.id === catId) || CATS[0];
  const dua = cat.duas[duaIdx] || cat.duas[0];
  const target = parseTarget(dua.c);
  const hasCounter = target > 1;

  const [count, setCount] = useState(hasCounter ? Math.min(340, Math.floor(target * 0.34)) : 0);
  const [doneOnce, setDoneOnce] = useState(false);
  const [reflOpen, setReflOpen] = useState(false);
  const [writeOpen, setWriteOpen] = useState(false);

  const { isSaved, toggleSaved } = useAppState();
  const key = `${catId}:${duaIdx}`;
  const saved = isSaved(key);
  const stats = useMemo(() => duaStats(catId, duaIdx), [catId, duaIdx]);

  const pct = Math.min(1, count / Math.max(target, 1));
  const steps = dua.s.length ? dua.s : ['Instructions for this benefit load with your corpus.'];
  const note = dua.note || 'No accompanying preparation is recorded for this benefit.';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Icon name="arrow_back" size={22} color={colors.onTeal} />
            </Pressable>
            <View style={styles.headerActions}>
              <Pressable onPress={() => toggleSaved(key)} style={styles.iconBtn}>
                <Icon name={saved ? 'bookmark' : 'bookmark_border'} size={22} color={colors.onTeal} />
              </Pressable>
              <Pressable style={styles.iconBtn}>
                <Icon name="ios_share" size={20} color={colors.onTeal} />
              </Pressable>
            </View>
          </View>
          <Text style={styles.eyebrow}>{cat.title}</Text>
          <Text style={styles.headline}>{dua.t}</Text>
          <View style={styles.chipRow}>
            <MetaChip label={dua.c} bg={colors.mint} color={colors.onMintText} />
            <MetaChip label={dua.tm} bg="rgba(255,255,255,0.14)" color={colors.onTeal} />
            <MetaChip label={dua.d} bg="rgba(255,255,255,0.14)" color={colors.onTeal} />
          </View>
        </View>

        <View style={styles.nameBlock}>
          <Text style={styles.arabicName}>{dua.n}</Text>
          <Text style={styles.translit}>{dua.tr}</Text>
          <Text style={styles.meaning}>{dua.m}</Text>
        </View>

        <View style={styles.statsRow}>
          <Pressable style={styles.statCol} onPress={() => setReflOpen(true)}>
            <Text style={styles.statValue}>★ {stats.reflAvg}</Text>
            <Text style={styles.statLabel}>rating</Text>
          </Pressable>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statValue}>{stats.practisingToday.toLocaleString()}</Text>
            <Text style={styles.statLabel}>reciting today</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statValue}>🔥 {stats.myStreak}</Text>
            <Text style={styles.statLabel}>your streak</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>Instructions</Text>
          <View style={{ gap: 12, marginTop: 10 }}>
            {steps.map((s, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNum}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.noteCard}>
          <Icon name="spa" size={18} color={colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={styles.noteEyebrow}>Herbs & oils</Text>
            <Text style={styles.noteBody}>{note}</Text>
          </View>
        </View>

        <View style={styles.section}>
          {hasCounter ? (
            <View style={styles.counterCard}>
              <Text style={styles.sectionEyebrow}>Counter</Text>
              <View style={styles.ringWrap}>
                <ProgressRing size={176} strokeWidth={12} progress={pct}>
                  <Text style={styles.ringCount}>{count}</Text>
                  <Text style={styles.ringTarget}>of {target}</Text>
                </ProgressRing>
              </View>
              <View style={styles.counterControls}>
                <Pressable style={styles.resetBtn} onPress={() => setCount(0)}>
                  <Icon name="refresh" size={18} color={colors.textMuted} />
                </Pressable>
                <Pressable style={styles.countBtn} onPress={() => setCount((c) => Math.min(target, c + 1))}>
                  <Text style={styles.countBtnText}>Count</Text>
                </Pressable>
                <Pressable style={styles.plusBtn} onPress={() => setCount((c) => Math.min(target, c + 10))}>
                  <Text style={styles.plusBtnText}>+10</Text>
                </Pressable>
              </View>
              <Text style={styles.hint}>
                {count >= target ? 'Complete for today. Continue tomorrow.' : `${dua.tm} · ${target - count} remaining`}
              </Text>
            </View>
          ) : (
            <View style={styles.noCounterCard}>
              <Icon name="event_available" size={22} color={colors.accent} />
              <Text style={styles.noCounterText}>A single recitation — no count to keep. Mark it done once you have finished.</Text>
              <Button label={doneOnce ? 'Marked done today' : 'Mark as done'} onPress={() => setDoneOnce((d) => !d)} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionEyebrow}>Reflections</Text>
            <Pressable onPress={() => setReflOpen(true)}>
              <Text style={styles.seeAll}>See all {stats.reflTotal}</Text>
            </Pressable>
          </View>
          <View style={{ gap: 10, marginTop: 12 }}>
            {REFL_POOL.slice(0, 2).map((r) => (
              <View key={r.name} style={styles.reflPreview}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{r.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reflName}>{r.name}</Text>
                  <Text style={styles.reflMeta}>{r.place} · practising {r.days}</Text>
                  <Text style={styles.reflStars}>{'★'.repeat(r.stars)}</Text>
                  <Text style={styles.reflBody} numberOfLines={3}>{r.body}</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={{ marginTop: 14 }}>
            <Button label="Share your reflection" variant="outline" onPress={() => setWriteOpen(true)} />
          </View>
          <Text style={styles.disclaimer}>Reflections are reviewed before they appear. Outcomes rest with Allah alone.</Text>
        </View>
      </ScrollView>

      <ReflectionsSheet
        visible={reflOpen}
        onClose={() => setReflOpen(false)}
        duaTitle={dua.t}
        seedKey={key}
        reflAvg={stats.reflAvg}
        reflTotal={stats.reflTotal}
        onWriteReflection={() => {
          setReflOpen(false);
          setWriteOpen(true);
        }}
      />
      <WriteReflectionSheet visible={writeOpen} onClose={() => setWriteOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  header: { backgroundColor: colors.tealGradMid, padding: 20, paddingBottom: 24, gap: 4 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerActions: { flexDirection: 'row' },
  iconBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 1, textTransform: 'uppercase', color: colors.textTealLabel, marginTop: 10 },
  headline: { fontFamily: fonts.extrabold, fontSize: 24, color: colors.onTeal, marginTop: 6 },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  nameBlock: { alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: colors.divider, gap: 4 },
  arabicName: { fontFamily: fonts.arabic, fontSize: 48, color: colors.accent },
  translit: { fontFamily: fonts.bold, fontSize: 16, color: colors.textPrimary, marginTop: 6 },
  meaning: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  statsRow: { flexDirection: 'row', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.divider },
  statCol: { flex: 1, alignItems: 'center', gap: 3 },
  statDivider: { width: 1, backgroundColor: colors.divider },
  statValue: { fontFamily: fonts.bold, fontSize: 15, color: colors.textPrimary },
  statLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textFaint },
  section: { paddingHorizontal: 20, paddingVertical: 20 },
  sectionEyebrow: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.textMuted },
  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.iconChipBg, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontFamily: fonts.bold, fontSize: 12, color: colors.accent },
  stepText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  noteCard: { flexDirection: 'row', gap: 12, marginHorizontal: 20, padding: 16, backgroundColor: colors.amberCardBg, borderRadius: 16 },
  noteEyebrow: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.gold },
  noteBody: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18, color: colors.amberBody, marginTop: 3 },
  counterCard: { backgroundColor: colors.bgRoot, borderRadius: 20, alignItems: 'center', gap: 16 },
  ringWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  ringCount: { fontFamily: fonts.extrabold, fontSize: 34, color: colors.textPrimary },
  ringTarget: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted },
  counterControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resetBtn: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: colors.outlineBorder, alignItems: 'center', justifyContent: 'center' },
  countBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 999, paddingVertical: 15, alignItems: 'center' },
  countBtnText: { fontFamily: fonts.bold, fontSize: 15, color: '#fff' },
  plusBtn: { borderWidth: 1, borderColor: colors.outlineBorder, borderRadius: 999, paddingVertical: 14, paddingHorizontal: 16 },
  plusBtnText: { fontFamily: fonts.bold, fontSize: 13, color: colors.textSecondary },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.textFaint },
  noCounterCard: { backgroundColor: colors.bgRoot, borderRadius: 20, padding: 20, alignItems: 'center', gap: 12 },
  noCounterText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textMuted, textAlign: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.accent },
  reflPreview: { flexDirection: 'row', gap: 12, padding: 14, backgroundColor: colors.bgCard, borderRadius: 16 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.iconChipBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bold, fontSize: 11, color: colors.accent },
  reflName: { fontFamily: fonts.bold, fontSize: 13, color: colors.textPrimary },
  reflMeta: { fontFamily: fonts.regular, fontSize: 11, color: colors.textFaint },
  reflStars: { fontFamily: fonts.semibold, fontSize: 11, color: colors.gold, marginTop: 2 },
  reflBody: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.textSecondary, marginTop: 4 },
  disclaimer: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 16, color: colors.textFaint, marginTop: 14, textAlign: 'center' },
});
