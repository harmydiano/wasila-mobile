import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Circle as SvgCircle } from 'react-native-svg';
import Icon from '../../components/Icon';
import ProgressRing from '../../components/ProgressRing';
import Button from '../../components/Button';
import GeometricPattern from '../../components/GeometricPattern';
import ReflectionsSheet from '../sheets/ReflectionsSheet';
import WriteReflectionSheet from '../sheets/WriteReflectionSheet';
import { colors } from '../../theme/v2/colors';
import { fonts, ARABIC_LINE_HEIGHT } from '../../theme/type';
import { CATS, REFL_POOL } from '../../data/content';
import { duaStats, statsFor } from '../../utils/seed';
import { useAppState } from '../../state/AppState';

function parseTarget(c: string) {
  const n = parseInt(String(c).replace(/[^0-9]/g, ''), 10);
  return n || 1;
}

function Diamond() {
  return <View style={styles.diamond} />;
}

function ArabicGlow({ size = 210 }: { size?: number }) {
  return (
    <Svg width={size} height={size} style={styles.glowSvg}>
      <Defs>
        <RadialGradient id="arabicGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={colors.mint} stopOpacity={0.28} />
          <Stop offset="100%" stopColor={colors.mint} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <SvgCircle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#arabicGlow)" />
    </Svg>
  );
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
  const helpful = useMemo(() => statsFor(key), [key]);

  const [helpfulOn, setHelpfulOn] = useState(false);
  const helpfulCount = helpful.helpful + (helpfulOn ? 1 : 0);

  const pct = Math.min(1, count / Math.max(target, 1));
  const steps = dua.s.length ? dua.s : ['Instructions for this benefit load with your corpus.'];
  const outcomes = dua.outcomes?.length ? dua.outcomes : ['Specific benefits for this practice load with your corpus.'];

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 36, paddingHorizontal: 20, gap: 18 }}>
        <View style={styles.navRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Icon name="arrow_back" size={22} color={colors.textPrimary} />
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => toggleSaved(key)} style={styles.iconBtn}>
            <Icon name={saved ? 'bookmark' : 'bookmark_border'} size={22} color={colors.textPrimary} />
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Icon name="ios_share" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>

        <LinearGradient colors={[colors.tealGradMid, colors.tealGradEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <GeometricPattern color={colors.mint} opacity={0.12} />

          <View style={styles.badgeRow}>
            <View style={[styles.badge, dua.free ? styles.badgeFree : styles.badgePremium]}>
              <Text style={[styles.badgeText, dua.free ? styles.badgeTextFree : styles.badgeTextPremium]}>
                {dua.free ? 'FREE' : 'PREMIUM'}
              </Text>
            </View>
            <Text style={styles.eyebrow}>{cat.title}</Text>
          </View>

          <Text style={styles.headline}>{dua.t}</Text>
          <Text style={styles.subtitle}>{dua.tr} · {dua.m}</Text>

          <View style={styles.arabicWrap}>
            <ArabicGlow />
            <Diamond />
            <Text style={styles.arabicName}>{dua.n}</Text>
            <Diamond />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCell}>
              <Icon name="star" size={16} color={colors.gold} />
              <Text style={styles.statValue}>{stats.reflAvg}</Text>
              <Text style={styles.statLabel}>rating</Text>
            </View>
            <View style={styles.statCell}>
              <Icon name="groups" size={16} color={colors.mint} />
              <Text style={styles.statValue}>{stats.practisingToday.toLocaleString()}</Text>
              <Text style={styles.statLabel}>reciting today</Text>
            </View>
            <View style={styles.statCell}>
              <Icon name="local_fire_department" size={16} color={colors.gold} />
              <Text style={styles.statValue}>{stats.myStreak}</Text>
              <Text style={styles.statLabel}>your streak</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.chipsRow}>
          <View style={styles.attrChip}>
            <Icon name="repeat" size={15} color={colors.accent} />
            <Text style={styles.attrChipText}>{dua.c}</Text>
          </View>
          <View style={styles.attrChip}>
            <Icon name="schedule" size={15} color={colors.accent} />
            <Text style={styles.attrChipText}>{dua.tm}</Text>
          </View>
          <View style={styles.attrChip}>
            <Icon name="event" size={15} color={colors.accent} />
            <Text style={styles.attrChipText}>{dua.d}</Text>
          </View>
        </View>

        <Pressable
          style={[styles.helpfulPill, helpfulOn && styles.helpfulPillOn]}
          onPress={() => setHelpfulOn((v) => !v)}
        >
          <Icon name={helpfulOn ? 'favorite' : 'favorite_border'} size={16} color={helpfulOn ? colors.gold : colors.textMuted} />
          <Text style={[styles.helpfulText, helpfulOn && styles.helpfulTextOn]}>
            {helpfulCount} found this helpful
          </Text>
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.sectionEyebrow}>Instructions & practice</Text>
          <View style={{ gap: 12, marginTop: 12 }}>
            {steps.map((s, i) => (
              <View key={i} style={styles.stepRow}>
                <LinearGradient colors={[colors.mint, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.stepBadge}>
                  <Text style={styles.stepNum}>{i + 1}</Text>
                </LinearGradient>
                <Text style={styles.stepText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionEyebrow}>Specific benefits</Text>
          <View style={{ gap: 14, marginTop: 12 }}>
            {outcomes.map((o, i) => (
              <View key={i} style={styles.outcomeRow}>
                <Icon name="check_circle" size={18} color={colors.accent} />
                <Text style={styles.outcomeText}>{o}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
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

        <View style={styles.card}>
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
  navRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 6 },
  iconBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },

  hero: { borderRadius: 26, padding: 22, gap: 4, overflow: 'hidden' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  badgeFree: { backgroundColor: colors.mint },
  badgePremium: { backgroundColor: colors.amberBtnBg },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.4 },
  badgeTextFree: { color: colors.onMintText },
  badgeTextPremium: { color: colors.amberBtnText },
  eyebrow: { fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textTealLabel },
  headline: { fontFamily: fonts.serif, fontSize: 23, color: colors.onTeal, marginTop: 12 },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: '#B4DED7', marginTop: 4 },

  arabicWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 8 },
  glowSvg: { position: 'absolute', alignSelf: 'center' },
  diamond: { width: 7, height: 7, backgroundColor: colors.mint, opacity: 0.6, transform: [{ rotate: '45deg' }] },
  arabicName: { fontFamily: fonts.arabic, fontSize: 44, lineHeight: 44 * ARABIC_LINE_HEIGHT * 0.72, color: colors.accent },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCell: { flex: 1, alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingVertical: 10 },
  statValue: { fontFamily: fonts.bold, fontSize: 15, color: colors.onTeal },
  statLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textTealLabel },

  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  attrChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.bgCard, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  attrChipText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textSecondary },

  helpfulPill: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.divider, borderRadius: 999, paddingVertical: 12,
  },
  helpfulPillOn: { borderColor: 'rgba(224,190,133,0.4)', backgroundColor: 'rgba(224,190,133,0.15)' },
  helpfulText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textMuted },
  helpfulTextOn: { color: colors.gold },

  card: { backgroundColor: colors.bgCard, borderRadius: 20, padding: 18 },
  sectionEyebrow: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textMuted },

  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontFamily: fonts.bold, fontSize: 12, color: colors.onMintText },
  stepText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.textSecondary },

  outcomeRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  outcomeText: { flex: 1, fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 20, color: colors.textSecondary },

  counterCard: { alignItems: 'center', gap: 16 },
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
  noCounterCard: { alignItems: 'center', gap: 12 },
  noCounterText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textMuted, textAlign: 'center' },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.accent },
  reflPreview: { flexDirection: 'row', gap: 12, padding: 14, backgroundColor: colors.bgCardAlt, borderRadius: 16 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.iconChipBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bold, fontSize: 11, color: colors.accent },
  reflName: { fontFamily: fonts.bold, fontSize: 13, color: colors.textPrimary },
  reflMeta: { fontFamily: fonts.regular, fontSize: 11, color: colors.textFaint },
  reflStars: { fontFamily: fonts.semibold, fontSize: 11, color: colors.gold, marginTop: 2 },
  reflBody: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.textSecondary, marginTop: 4 },
  disclaimer: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 16, color: colors.textFaint, marginTop: 14, textAlign: 'center' },
});
