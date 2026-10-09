import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Share, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../../components/Icon';
import ProgressRing from '../../components/ProgressRing';
import EdgeFade from '../../components/EdgeFade';
import GeometricPattern from '../../components/GeometricPattern';
import BenefitBlocks from '../../components/v3/BenefitBlocks';
import TextSettingsSheet from '../../components/v3/TextSettingsSheet';
import RecordedSheet from './sheets/RecordedSheet';
import { confirmReplacePractice } from '../../components/v3/confirmReplacePractice';
import { fonts, serifHeading, arabicText, tabular, SIZE, CLAMP, uiLeading, pinLeading, eyebrow } from '../../theme/type';
import { avoidOrphan } from '../../utils/typography';
import { colors, v3 } from '../../theme/v3/colors';
import {
  benefitAt,
  benefitKey,
  blocksFor,
  heroShowsArabic,
  heroStatsFor,
  kindSpec,
  lineFor,
  nightsFor,
  passageOf,
  runHint,
  runLabel,
  runsFor,
} from '../../data/benefits';
import { useBenefitBody } from '../../data/remoteBenefits';
import { benefitSocial, disclose, shareOfCategory, withMyReport } from '../../utils/social';
import { currentStreakFromDates, longestStreakFromDates, nightForDate } from '../../utils/practice';
import { useAppState, dayKey } from '../../state/AppState';

type Tab = 'recite' | 'meaning';

export default function Benefit({ route, navigation }: any) {
  const { catId, duaIdx } = route.params ?? {};
  const { cat, dua, idx } = benefitAt(catId, duaIdx);
  const key = benefitKey(cat.id, idx);

  const {
    arabicSize, benefitText,
    isSaved, toggleSaved,

    benefitReports, withdrawReport,
    benefitRecited, markRecited, unmarkRecited,
    practice, startPractice,
    premium, contentRev,
  } = useAppState();

  const body = useBenefitBody(dua, premium);
  const bodyReady = body.status === 'ready';

  const [tab, setTab] = useState<Tab>('recite');
  const [textOpen, setTextOpen] = useState(false);
  const [recordedOpen, setRecordedOpen] = useState(false);

  const blocks = useMemo(() => blocksFor(dua), [dua, contentRev]);
  const passage = useMemo(() => passageOf(blocks), [blocks]);
  const runs = useMemo(() => runsFor(dua, blocks), [dua, blocks]);
  const spec = kindSpec(dua);

  const social = useMemo(() => benefitSocial(cat.id, idx), [cat.id, idx]);
  const myReport = benefitReports[key] ? 'beneficial' : null;
  const beneficialTotal = withMyReport(social.beneficial, myReport);
  const beneficial = disclose(beneficialTotal, 'marked this beneficial');
  const practising = disclose(social.practising, 'practising it right now');
  const triedShows = beneficial.show || practising.show;
  const share = useMemo(() => shareOfCategory(cat.id, social), [cat.id, social]);

  const mine = practice && practice.catId === cat.id && practice.duaIdx === idx ? practice : null;
  const night = mine ? nightForDate(mine.startedDateKey, mine.totalNights, new Date()) : 0;
  const tally = mine && mine.tallyDateKey === dayKey(new Date()) ? mine.tally : 0;

  const counting = bodyReady && runs.length > 0;
  const multi = runs.length > 1;
  const segIndex = Math.min(Math.max(0, runs.length - 1), mine?.segment ?? 0);
  const run = counting ? runs[segIndex] : null;
  const doneToday = !!mine?.completedDates.includes(dayKey(new Date()));

  const recitedDates = benefitRecited[key] ?? [];
  const recitedToday = recitedDates.includes(dayKey(new Date()));

  const openCounter = () => {
    if (!counting) return;
    if (mine) {
      navigation.navigate('BenefitCounter', { catId: cat.id, duaIdx: idx });
      return;
    }
    confirmReplacePractice(practice, () => {
      startPractice(cat.id, idx, runs.map((r) => r.target), nightsFor(dua));
      navigation.navigate('BenefitCounter', { catId: cat.id, duaIdx: idx });
    });
  };

  const onShare = () => {
    const lines = [dua.t, lineFor(dua)];
    if (passage) lines.push('', ...passage.lines.map((l) => l.tr || l.ar || '').filter(Boolean));
    if (passage?.translation) lines.push('', passage.translation);
    lines.push('', 'From Wasīla.');
    Share.share({ message: lines.join('\n') }).catch(() => {});
  };

  const insets = useSafeAreaInsets();
  const footerPad = Math.max(insets.bottom, 12) + 10;

  const heroGold = !dua.free;
  const heroStats = heroStatsFor(dua);
  const showTabs = bodyReady && !!passage;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.navRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={8} style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow_back" size={23} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isSaved(key) ? 'Remove from saved' : 'Save this benefit'}
          hitSlop={8}
          style={styles.iconBtn}
          onPress={() => toggleSaved(key)}
        >
          <Icon
            name={isSaved(key) ? 'bookmark' : 'bookmark_border'}
            size={22}
            color={isSaved(key) ? colors.gold : colors.textSecondary}
          />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Text settings" hitSlop={8} style={styles.iconBtn} onPress={() => setTextOpen(true)}>
          <Icon name="text_format" size={21} color={colors.textSecondary} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Share" hitSlop={8} style={styles.iconBtn} onPress={onShare}>
          <Icon name="ios_share" size={21} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={heroGold ? ['#2A2411', '#1A2A24'] : [colors.tealGradMid, '#123028']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <GeometricPattern color={heroGold ? colors.gold : colors.mint} opacity={0.1} />

          <View style={styles.badgeRow}>
            <View style={[styles.badge, dua.free ? styles.badgeFree : styles.badgePremium]}>
              {!dua.free && <Icon name="lock" size={11} color={colors.amberBtnText} />}
              <Text style={[styles.badgeText, dua.free ? styles.badgeTextFree : styles.badgeTextPremium]}>
                {dua.free ? 'FREE' : 'PREMIUM'}
              </Text>
            </View>
            <Text style={styles.heroEyebrow} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
              {cat.title}
            </Text>
          </View>

          <Text style={styles.heroTitle}>{avoidOrphan(dua.t)}</Text>

          {!heroShowsArabic(dua) ? (
            !!lineFor(dua) && <Text style={styles.heroSub}>{lineFor(dua)}</Text>
          ) : (
            <>
              <View style={styles.arabicRow}>
                <View style={styles.diamond} />
                <Text
                  style={[styles.heroArabic, arabicText(arabicSize)]}
                  maxFontSizeMultiplier={1}
                >
                  {dua.n}
                </Text>
                <View style={styles.diamond} />
              </View>
              {!![dua.tr, dua.m].filter(Boolean).length && (
                <Text style={styles.heroSubCentered}>{[dua.tr, dua.m].filter(Boolean).join(' · ')}</Text>
              )}
            </>
          )}

          {!triedShows && (
            <View style={styles.heroStats}>
              {heroStats.map((s) => (
                <View key={s.label} style={styles.heroStat}>
                  <Text style={styles.heroStatValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} maxFontSizeMultiplier={1.2}>
                    {s.value}
                  </Text>
                  <Text style={styles.heroStatLabel} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>

        {triedShows && (
          <View style={styles.tried}>
            <View style={styles.triedHead}>
              <Icon name="verified" size={18} color={colors.gold} />
              <Text style={styles.triedEyebrow} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                Tried by others
              </Text>
              <View style={{ flex: 1 }} />
              <Text style={styles.triedArabic} maxFontSizeMultiplier={1}>
                مُجَرَّب
              </Text>
            </View>

            <View style={styles.triedCells}>
              {beneficial.show && (
                <View style={styles.triedCell}>
                  <Text style={styles.triedGoldNum}>
                    {beneficial.exact ? beneficial.value.toLocaleString() : beneficial.text.split(' ').slice(0, 2).join(' ')}
                  </Text>
                  <Text style={styles.triedGoldLabel}>marked this beneficial</Text>
                </View>
              )}
              {practising.show && (
                <View style={styles.triedCell}>
                  <Text style={styles.triedMintNum}>
                    {practising.exact ? practising.value.toLocaleString() : practising.text.split(' ').slice(0, 2).join(' ')}
                  </Text>
                  <Text style={styles.triedMintLabel}>practising it right now</Text>
                </View>
              )}
            </View>

            <View style={styles.triedBars}>
              {beneficial.show && (
                <View style={styles.triedBarRow}>
                  <View style={styles.triedBar}>
                    <View style={[styles.triedBarGold, { flex: share.beneficialPct }]} />
                    <View style={{ flex: Math.max(0.01, 1 - share.beneficialPct) }} />
                  </View>
                  <Text style={styles.triedBarLabel} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                    beneficial
                  </Text>
                </View>
              )}
              {practising.show && (
                <View style={styles.triedBarRow}>
                  <View style={styles.triedBar}>
                    <View style={[styles.triedBarMint, { flex: share.practisingPct }]} />
                    <View style={{ flex: Math.max(0.01, 1 - share.practisingPct) }} />
                  </View>
                  <Text style={styles.triedBarLabel} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                    practising
                  </Text>
                </View>
              )}
            </View>

            {myReport === 'beneficial' && (
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.withdraw, pressed && styles.pressed]}
                onPress={() => withdrawReport(key)}
              >
                <Icon name="undo" size={15} color={v3.ink3} />
                <Text style={styles.withdrawText} maxFontSizeMultiplier={CLAMP}>
                Withdraw my report
              </Text>
              </Pressable>
            )}
          </View>
        )}

        {showTabs && (
          <View style={styles.segmented}>
            {(
              [
                ['recite', 'Recite'],
                ['meaning', 'Meaning'],
              ] as [Tab, string][]
            ).map(([k, label]) => {
              const on = tab === k;
              return (
                <Pressable
                  key={k}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  style={({ pressed }) => [styles.segment, on && styles.segmentOn, pressed && styles.pressed]}
                  onPress={() => setTab(k)}
                >
                  <Text
                    style={[styles.segmentText, on && styles.segmentTextOn]}
                    numberOfLines={1}
                    maxFontSizeMultiplier={CLAMP}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {!bodyReady && (
          <View style={styles.body}>
            <View style={[styles.card, styles.pending]}>
              {body.status === 'loading' ? (
                <>
                  <ActivityIndicator color={colors.accent} />
                  <Text style={styles.cardBody}>Opening this benefit…</Text>
                </>
              ) : body.status === 'locked' ? (
                <>
                  <Icon name="lock" size={22} color={colors.gold} />
                  <Text style={styles.pendingTitle}>Part of Wasīla Plus</Text>
                  <Text style={[styles.cardBody, styles.pendingText]}>
                    The method, the wording and what is reported open with a Plus subscription.
                  </Text>
                </>
              ) : (
                <>
                  <Icon name="cloud_off" size={22} color={colors.textMuted} />
                  <Text style={styles.pendingTitle}>Not on this phone yet</Text>
                  <Text style={[styles.cardBody, styles.pendingText]}>
                    This benefit has not been opened before, so it needs a connection the first time.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.outlineBtn, styles.pendingBtn, pressed && styles.pressed]}
                    onPress={body.retry}
                  >
                    <Text style={styles.outlineBtnTextMint}>Try again</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        )}

        {bodyReady && tab === 'recite' && (
          <View style={styles.body}>
            <BenefitBlocks
              blocks={blocks}
              text={benefitText}
              arabicSize={arabicSize}
              passageAction={
                passage ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Listen to this passage"
                    style={({ pressed }) => [styles.listen, pressed && styles.pressed]}
                    onPress={() => navigation.navigate('BenefitListen', { catId: cat.id, duaIdx: idx })}
                  >
                    <Icon name="play_arrow" size={15} color={colors.accent} />
                    <Text style={styles.listenText} maxFontSizeMultiplier={CLAMP}>
                      Listen
                    </Text>
                  </Pressable>
                ) : null
              }
              counterFor={(blockIndex) => {
                if (!run) return null;
                if (blockIndex !== run.blockIndex) {
                  const mineRuns = runs.filter((r) => r.blockIndex === blockIndex);
                  if (!mineRuns.length) return null;
                  const first = runs.indexOf(mineRuns[0]);
                  const done = doneToday || (!!mine && first < segIndex);
                  return (
                    <View style={styles.runStatus}>
                      <Icon name={done ? 'check_circle' : 'radio_button_unchecked'} size={15} color={done ? colors.accent : v3.ink3} />
                      <Text style={[styles.runStatusText, done && styles.runStatusDone]} maxFontSizeMultiplier={CLAMP}>
                        {done
                          ? 'Counted'
                          : mineRuns.length > 1
                            ? `Parts ${first + 1}–${first + mineRuns.length} of ${runs.length}`
                            : `Part ${first + 1} of ${runs.length}`}
                      </Text>
                    </View>
                  );
                }
                return (
                  <View style={styles.inlineCounter}>
                    <ProgressRing
                      size={54}
                      strokeWidth={5}
                      progress={tally / Math.max(1, run.target)}
                      color={colors.accent}
                      trackColor={colors.bgCardMuted}
                    >
                      <Text style={styles.inlineCount} maxFontSizeMultiplier={1.1}>
                        {tally}
                      </Text>
                      <Text style={styles.inlineOf} maxFontSizeMultiplier={1.1}>
                        {`of ${run.target}`}
                      </Text>
                    </ProgressRing>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inlineTitle} maxFontSizeMultiplier={CLAMP}>
                        {multi
                          ? runLabel(runs, segIndex)
                          : doneToday || tally >= run.target
                            ? 'Complete for today'
                            : tally === 0
                              ? 'Not started'
                              : 'In progress'}
                      </Text>
                      {multi ? (
                        <Text style={styles.inlineSub} numberOfLines={2}>
                          {runHint(runs, segIndex)}
                        </Text>
                      ) : null}
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Open the counter"
                      style={({ pressed }) => [styles.countPill, pressed && styles.pressed]}
                      onPress={openCounter}
                    >
                      <Text style={styles.countPillText} maxFontSizeMultiplier={CLAMP}>
                        Count
                      </Text>
                    </Pressable>
                  </View>
                );
              }}
            />

            {mine && run && (
              <View style={styles.myCount}>
                <ProgressRing
                  size={54}
                  strokeWidth={5}
                  progress={tally / Math.max(1, run.target)}
                  color={colors.accent}
                  trackColor={colors.bgCardMuted}
                >
                  <Text style={styles.inlineCount} maxFontSizeMultiplier={1.1}>
                    {tally}
                  </Text>
                  <Text style={styles.inlineOf} maxFontSizeMultiplier={1.1}>
                    {`of ${run.target}`}
                  </Text>
                </ProgressRing>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inlineTitle}>
                    {multi ? `Your count · ${runLabel(runs, segIndex)}` : 'Your count'}
                  </Text>
                  <Text style={styles.inlineSub}>
                    {`Day ${night} of ${mine.totalNights}.`}
                    {practising.show && practising.exact ? ` You are one of the ${practising.value.toLocaleString()}.` : ''}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {bodyReady && tab === 'meaning' && (
          <View style={styles.body}>
            <View style={styles.card}>
              <Text style={styles.eyebrow}>What is being asked</Text>
              <Text style={styles.cardBody}>
                {dua.meaning?.asked ??
                  `${dua.tr} — ${dua.m}. Wasīla records the wording as received and does not gloss beyond it.`}
              </Text>
            </View>

            {!!dua.meaning?.words.length && (
              <View style={styles.group}>
                <Text style={styles.eyebrow}>Key words</Text>
                {dua.meaning.words.map((w) => (
                  <View key={w.tr} style={styles.wordRow}>
                    <Text style={styles.wordArabic} maxFontSizeMultiplier={1}>
                      {w.ar}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.wordTr}>{w.tr}</Text>
                      <Text style={styles.wordGloss}>{w.gloss}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.sourceCard}>
              <Text style={styles.eyebrow}>Where it comes from</Text>
              <Text style={styles.cardBody}>
                {dua.meaning?.source ??
                  'Wasīla records the wording as received and does not grade the chain.'}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.outlineBtn, pressed && styles.pressed]}
              onPress={() => setTab('recite')}
            >
              <Text style={styles.outlineBtnText}>Back to the passage</Text>
            </Pressable>
          </View>
        )}

      </ScrollView>

      <View style={[styles.footer, { paddingBottom: footerPad }]}>
        <EdgeFade />
        <View style={styles.footerBadge}>
          <Icon
            name={counting ? 'local_fire_department' : 'favorite_border'}
            size={21}
            color={counting ? colors.gold : colors.textMuted}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={body.status === 'loading'}
          style={({ pressed }) => [styles.cta, !bodyReady && body.status !== 'locked' && styles.ctaIdle, pressed && styles.pressed]}
          onPress={() => {
            if (body.status === 'locked') {
              navigation.navigate('Plus', { benefitTitle: dua.t, categoryLabel: cat.title });
              return;
            }
            if (body.status === 'offline') {
              body.retry();
              return;
            }
            if (!bodyReady) return;
            if (counting) {
              openCounter();
              return;
            }
            markRecited(key);
            setRecordedOpen(true);
          }}
        >
          <Text style={styles.ctaText} numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={CLAMP}>
            {body.status === 'locked'
              ? 'Unlock with Plus'
              : body.status === 'offline'
                ? 'Try again'
                : counting
                  ? 'Open the counter'
                  : recitedToday
                    ? spec.recorded
                    : spec.record}
          </Text>
        </Pressable>
      </View>

      <TextSettingsSheet visible={textOpen} onClose={() => setTextOpen(false)} />
      <RecordedSheet
        visible={recordedOpen}
        onClose={() => setRecordedOpen(false)}
        title={dua.t}
        timing={dua.tm}
        streak={currentStreakFromDates(recitedDates, new Date())}
        longest={longestStreakFromDates(recitedDates)}
        onUndo={() => {
          unmarkRecited(key);
          setRecordedOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },

  navRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 4 },
  iconBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },

  content: { paddingHorizontal: 18, paddingBottom: 28, gap: 14 },

  hero: { borderRadius: 26, padding: 22, overflow: 'hidden' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10,
  },
  badgeFree: { backgroundColor: colors.accent },
  badgePremium: { backgroundColor: colors.gold },
  badgeText: { fontFamily: fonts.extrabold, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), letterSpacing: 0.5 },
  badgeTextFree: { color: colors.onMintText },
  badgeTextPremium: { color: colors.amberBtnText },
  heroEyebrow: { ...eyebrow(colors.mint), flex: 1 },
  heroTitle: { ...serifHeading(SIZE.cardTitle), color: colors.onTeal, marginTop: 14 },
  heroSub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: pinLeading(18, SIZE.meta), color: '#B4DED7', marginTop: 8 },
  heroSubCentered: {
    fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: pinLeading(18, SIZE.meta),
    color: '#B4DED7', marginTop: 4, textAlign: 'center',
  },

  arabicRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 16 },
  diamond: { width: 7, height: 7, backgroundColor: colors.gold, opacity: 0.6, transform: [{ rotate: '45deg' }] },
  heroArabic: { color: colors.gold },

  heroStats: { flexDirection: 'row', gap: 8, marginTop: 18 },
  heroStat: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 11, paddingHorizontal: 6 },
  heroStatValue: { fontFamily: fonts.extrabold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), ...tabular, color: colors.onTeal },
  heroStatLabel: { fontFamily: fonts.regular, fontSize: SIZE.caption, color: colors.mint, marginTop: 2 },

  tried: { backgroundColor: v3.surfaceCard, borderWidth: 1, borderColor: colors.divider, borderRadius: 22, padding: 18 },
  triedHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  triedEyebrow: eyebrow(colors.goldMeta),
  triedArabic: { ...arabicText(17), color: colors.gold },
  triedCells: { flexDirection: 'row', gap: 10, marginTop: 15 },
  triedCell: { flex: 1, backgroundColor: colors.bgCardMuted, borderRadius: 16, padding: 14 },
  triedGoldNum: { ...serifHeading(SIZE.cardTitle), ...tabular, color: colors.gold },
  triedGoldLabel: { fontFamily: fonts.bold, fontSize: SIZE.caption, lineHeight: pinLeading(15, SIZE.caption), color: colors.amberCardText, marginTop: 5 },
  triedMintNum: { ...serifHeading(SIZE.cardTitle), ...tabular, color: colors.accent },
  triedMintLabel: { fontFamily: fonts.bold, fontSize: SIZE.caption, lineHeight: pinLeading(15, SIZE.caption), color: colors.mint, marginTop: 5 },
  triedBars: { gap: 7, marginTop: 14 },
  triedBarRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  triedBar: { flex: 1, flexDirection: 'row', height: 4, borderRadius: 999, backgroundColor: colors.divider, overflow: 'hidden' },
  triedBarGold: { backgroundColor: colors.gold },
  triedBarMint: { backgroundColor: colors.accent },
  triedBarLabel: {
    width: 74, fontFamily: fonts.bold, fontSize: SIZE.caption,
    lineHeight: uiLeading(SIZE.caption), color: v3.ink3,
  },
  withdraw: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, minHeight: 44, marginTop: 6 },
  withdrawText: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textMuted },

  segmented: { flexDirection: 'row', gap: 5, backgroundColor: colors.bgCardMuted, borderRadius: 999, padding: 4 },
  segment: { flex: 1, minHeight: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  segmentOn: { backgroundColor: colors.mint },
  segmentText: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textMuted },
  segmentTextOn: { fontFamily: fonts.extrabold, color: colors.onMintText },

  body: { gap: 14 },
  pending: { alignItems: 'center', paddingVertical: 28, gap: 12 },
  pendingTitle: { fontFamily: fonts.extrabold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.textPrimary, textAlign: 'center' },
  pendingText: { textAlign: 'center' },
  pendingBtn: { alignSelf: 'stretch', marginTop: 4 },
  ctaIdle: { opacity: 0.5 },
  group: { gap: 9 },
  eyebrow: eyebrow(colors.textMuted),

  listen: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 32, paddingHorizontal: 11, borderRadius: 999, backgroundColor: v3.surfaceCard },
  listenText: { fontFamily: fonts.extrabold, fontSize: SIZE.meta, color: colors.accent },

  inlineCounter: {
    flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16, paddingTop: 15,
    borderTopWidth: 1, borderTopColor: 'rgba(123,224,190,0.28)',
  },
  inlineCount: { ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.textPrimary },
  inlineOf: { fontFamily: fonts.bold, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.accent },
  inlineTitle: { fontFamily: fonts.extrabold, fontSize: SIZE.meta, color: colors.textPrimary },
  inlineSub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: pinLeading(17, SIZE.meta), color: colors.textMuted, marginTop: 3 },
  countPill: {
    minHeight: 44, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 999,
    borderWidth: 1, borderColor: colors.accent, flexShrink: 0,
  },
  countPillText: { fontFamily: fonts.extrabold, fontSize: SIZE.body, color: colors.accent },
  runStatus: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, paddingTop: 11,
    borderTopWidth: 1, borderTopColor: 'rgba(123,224,190,0.18)',
  },
  runStatusText: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: v3.ink3 },
  runStatusDone: { color: colors.accent },

  myCount: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: v3.surfaceCard, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 17 },

  card: { backgroundColor: v3.surfaceCard, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 17, gap: 10 },
  sourceCard: { backgroundColor: colors.bgCardMuted, borderWidth: 1, borderColor: colors.divider, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 17, gap: 10 },
  cardBody: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: pinLeading(23, SIZE.body), color: colors.textSecondary },
  wordRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: v3.surfaceCard, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 15 },
  wordArabic: { ...arabicText(20), color: colors.accent },
  wordTr: { fontFamily: fonts.bold, fontSize: SIZE.body, color: colors.textPrimary },
  wordGloss: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: pinLeading(17, SIZE.meta), color: colors.textMuted, marginTop: 2 },

  outlineBtn: {
    minHeight: 48, borderRadius: 999, borderWidth: 1, borderColor: colors.divider,
    alignItems: 'center', justifyContent: 'center',
  },
  outlineBtnText: { fontFamily: fonts.extrabold, fontSize: SIZE.title, color: colors.textSecondary },
  outlineBtnTextMint: { fontFamily: fonts.extrabold, fontSize: SIZE.title, color: colors.accent },

  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 18, paddingTop: 14,
    backgroundColor: colors.bgRoot,
    borderTopWidth: 1, borderTopColor: colors.divider,
  },
  footerBadge: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.divider, alignItems: 'center', justifyContent: 'center' },
  cta: { flex: 1, minHeight: 50, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontFamily: fonts.extrabold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.onMintText },

  pressed: { opacity: 0.9 },
});
