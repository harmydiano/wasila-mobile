import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, ImageBackground, useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../../components/Screen';
import Icon from '../../components/Icon';
import IconChip from '../../components/IconChip';
import ProgressRing from '../../components/ProgressRing';
import { colors, categoryTints } from '../../theme/v2/colors';
import { fonts, serifHeading } from '../../theme/type';
import {
  space, rhythm, radius, size, leading, tracking, elevation, motion, minTouch,
} from '../../theme/v2/tokens';
import { CATS } from '../../data/content';
import { getSelectedNeedCat } from '../../data/prefs';
import { usePrayer, type PrayerRow } from '../../state/usePrayer';
import { useAppState } from '../../state/AppState';
import { formatHijri, formatGregorian } from '../../utils/hijri';
import { formatCountdown } from '../../utils/prayerTime';
import { dayKey } from '../../utils/prayerLog';
import { nightForDate, endDateLabel, currentStreakFromDates, longestStreakFromDates } from '../../utils/practice';

const HEADER_BG = require('../../../design-assets/v3/img_bg_top_v3.png');

const QUICK_ACCESS = [
  { label: 'Qibla', icon: 'compass-outline', go: 'Prayer' },
  { label: 'Tasbih', icon: 'record-circle-outline', go: 'Tasbih' },
  { label: '99 Names', icon: 'view-grid-outline', go: 'Names' },
  { label: 'My Zikr', icon: 'star-four-points-outline', go: 'Zikr' },
];

const ALSO_TODAY = [
  {
    key: 'status', title: 'Elevation in rank at work', sub: 'Missed yesterday · day 6 of 21',
    cta: 'Restart', tone: 'missed' as const, catId: 'status', duaIdx: 0,
  },
  {
    key: 'protect', title: 'Protection of the home', sub: 'Al-Baqarah 1–5 · before sleep · day 12',
    cta: 'Start', tone: 'open' as const, catId: 'protect', duaIdx: 0,
  },
  {
    key: 'names', title: 'Relief from a constricted chest', sub: 'Yā Muʾmin 136 · as needed',
    cta: 'Start', tone: 'open' as const, catId: null, duaIdx: null,
  },
];
const ALSO_TODAY_DONE_COUNT = 2;

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Zuhr', 'Asr', 'Maghrib', 'Isha'];
function findTimingRow(tm: string, rows: PrayerRow[]): PrayerRow | null {
  const name = PRAYER_NAMES.find((n) => tm.includes(n));
  return name ? rows.find((r) => r.name === name) ?? null : null;
}

export default function Home({ navigation }: any) {
  const { currentName, nextName, nextLabel, nextCountdown, city, rows } = usePrayer();
  const { practice, startPractice, creditPractice, setPracticeTally, openPaywall, authName } = useAppState();
  const { width: winWidth } = useWindowDimensions();
  const chooseAnotherTarget = 'Library';
  const goLockedPaywall = () => openPaywall();

  const today = new Date();
  const todayKey = dayKey(today);

  const [selectedNeedCatId, setSelectedNeedCatId] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    getSelectedNeedCat().then((id) => {
      if (alive) setSelectedNeedCatId(id);
    });
    return () => {
      alive = false;
    };
  }, []);

  const defaultSeedCat = CATS.find((c) => c.id === 'rizq')!;
  const seedCat = (selectedNeedCatId && CATS.find((c) => c.id === selectedNeedCatId)) || defaultSeedCat;
  const seedDua = seedCat.duas[0];
  const seedTarget = parseInt(seedDua.c, 10) || 1000;
  const seedNights = parseInt(seedDua.d, 10) || 7;

  const activeCat = (practice ? CATS.find((c) => c.id === practice.catId) : null) ?? seedCat;
  const activeDua = (practice ? activeCat.duas[practice.duaIdx] : null) ?? seedDua;
  const target = practice ? practice.target : seedTarget;
  const totalNights = practice ? practice.totalNights : seedNights;
  const night = practice ? nightForDate(practice.startedDateKey, practice.totalNights, today) : 0;
  const tally = practice && practice.tallyDateKey === todayKey ? practice.tally : 0;
  const endLabel = endDateLabel(practice ? practice.startedDateKey : todayKey, totalNights);
  const stage: 'a' | 'b' | 'c' = !practice ? 'a' : night <= 1 ? 'b' : 'c';

  const streakCurrent = practice ? currentStreakFromDates(practice.completedDates, today) : 0;
  const streakLongest = practice ? Math.max(streakCurrent, longestStreakFromDates(practice.completedDates)) : 0;

  const timingRow = findTimingRow(activeDua.tm, rows);
  const windowOpen = !!timingRow?.current;
  const windowLabel = timingRow ? formatCountdown(Date.now(), timingRow.time.getTime()) : activeDua.tm;
  const cleanTitle = activeDua.t.replace(/ in \d+ days?$/i, '');
  const afterPhrase = activeDua.tm.charAt(0).toLowerCase() + activeDua.tm.slice(1);

  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState('');

  const cardWidth = winWidth - rhythm.screenX * 2;
  const [railIndex, setRailIndex] = useState(0);
  const onRailScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setRailIndex(Math.round(e.nativeEvent.contentOffset.x / (cardWidth + rhythm.cardGap)));
  };

  const inWindow = currentName != null;
  const prayerStripText = inWindow
    ? `${currentName} window open · ${nextName ?? ''} ${nextLabel ?? ''}`.trim()
    : `${nextName ?? ''} ${nextLabel ?? ''} · ${nextCountdown ?? ''}`.trim();

  const missedCount = ALSO_TODAY.filter((a) => a.tone === 'missed').length;
  const openCount = ALSO_TODAY.filter((a) => a.tone === 'open').length;

  const onStart = () => startPractice(seedCat.id, 0, seedTarget, seedNights);
  const onTap = () => creditPractice(1);
  const onFinished = () => setPracticeTally(target);
  const goTasbih = () =>
    navigation.navigate('Tasbih', { creditsPractice: true, target: Math.max(1, target - tally) });
  const onManualSubmit = () => {
    const n = parseInt(manualValue, 10);
    if (!Number.isNaN(n)) setPracticeTally(n);
    setManualOpen(false);
    setManualValue('');
  };

  const goAlso = (item: (typeof ALSO_TODAY)[number]) =>
    item.catId ? navigation.navigate('DuaDetail', { catId: item.catId, duaIdx: item.duaIdx }) : navigation.navigate('Names');

  return (
    <Screen nav="Home" contentStyle={{ paddingHorizontal: rhythm.screenX, paddingTop: space.xs, gap: rhythm.section }}>
      <ImageBackground source={HEADER_BG} style={styles.headerBand} imageStyle={styles.headerBandImg} resizeMode="cover">
        <LinearGradient
          colors={['rgba(10,21,18,0.1)', 'rgba(10,21,18,0.55)', colors.bgRoot]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dateLine} numberOfLines={1}>
              {`${formatGregorian(today).split(',')[0]} · ${formatHijri(today)} · ${city}`}
            </Text>
            <Text style={styles.greeting} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {authName ? `Assalamu alaykum, ${authName}` : 'Assalamu alaykum'}
            </Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Prayer')} style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
            <Icon name="bell" set="community" size={22} color={colors.textMuted} />
            <View style={styles.notifDot} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Profile')}>
            {authName ? (
              <LinearGradient colors={[colors.mint, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
                <Text style={styles.avatarText}>{authName.slice(0, 2).toUpperCase()}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.avatarGuest}>
                <Icon name="account-outline" set="community" size={20} color={colors.accent} />
              </View>
            )}
          </Pressable>
        </View>

        <Pressable onPress={() => navigation.navigate('Prayer')} style={({ pressed }) => [styles.prayerStrip, pressed && styles.pressed]}>
          <IconChip icon="mosque" size={36} radius={12} />
          <Text style={styles.prayerStripText} numberOfLines={1} ellipsizeMode="tail">{prayerStripText}</Text>
          <Icon name="chevron_right" size={20} color={colors.textFaint} />
        </Pressable>
      </ImageBackground>

      <View style={{ gap: rhythm.sectionHeader }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={cardWidth + rhythm.cardGap}
          contentContainerStyle={{ gap: rhythm.cardGap }}
          onMomentumScrollEnd={onRailScrollEnd}
        >
          <View style={{ width: cardWidth }}>
            {stage === 'a' && (
              <View style={styles.ownCard}>
                <Text style={styles.eyebrow}>{`Free practice · ${totalNights} nights · ends ${endLabel}`}</Text>
                <Text style={styles.cardTitle}>{cleanTitle}</Text>
                <Text style={styles.cardBody}>
                  {`${activeDua.tr} · ${activeDua.c} ${afterPhrase}, ${totalNights} nights running. Your first window ${windowOpen ? 'is open now' : `opens ${windowLabel}`}.`}
                </Text>
                <View style={styles.ctaRow}>
                  <Pressable style={({ pressed }) => [styles.ctaPrimary, pressed && styles.pressed]} onPress={onStart}>
                    <Text style={styles.ctaPrimaryText}>Start this practice</Text>
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.ctaOutline, pressed && styles.pressed]} onPress={() => navigation.navigate(chooseAnotherTarget)}>
                    <Text style={styles.ctaOutlineText}>Choose another</Text>
                  </Pressable>
                </View>
                <Text style={styles.footnote}>One slot on the free plan. Swap it any time before it starts.</Text>
              </View>
            )}

            {stage === 'b' && (
              <View style={styles.ownCard}>
                <Text style={styles.eyebrow}>{`Night 1 of ${totalNights} · ${windowOpen ? 'window open' : `opens ${windowLabel}`}`}</Text>
                <Text style={styles.cardBody}>{`${activeDua.tr} · ${target} tonight · ends ${endLabel}`}</Text>
                <View style={styles.counterRow}>
                  <Pressable onPress={onTap} style={({ pressed }) => pressed && styles.pressed}>
                    <ProgressRing size={72} strokeWidth={7} progress={tally / target} color={colors.accent} trackColor={colors.divider}>
                      <Text style={styles.ringNumber}>{tally}</Text>
                    </ProgressRing>
                  </Pressable>
                  <View>
                    <Text style={styles.cardTitle}>{cleanTitle}</Text>
                    <Text style={styles.counterCaption}>{`of ${target}`}</Text>
                  </View>
                </View>
                <View style={styles.creditRow}>
                  <Pressable style={({ pressed }) => [styles.creditBtn, pressed && styles.pressed]} onPress={onTap}>
                    <Icon name="touch_app" size={16} color={colors.accent} />
                    <Text style={styles.creditBtnText}>Count in app</Text>
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.creditBtn, pressed && styles.pressed]} onPress={() => goTasbih()}>
                    <Icon name="linear_scale" size={16} color={colors.accent} />
                    <Text style={styles.creditBtnText}>My tasbih</Text>
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.creditBtn, pressed && styles.pressed]} onPress={onFinished}>
                    <Icon name="check_circle" size={16} color={colors.accent} />
                    <Text style={styles.creditBtnText} numberOfLines={1}>{`I finished tonight's ${target}`}</Text>
                  </Pressable>
                </View>
                {!manualOpen ? (
                  <Pressable onPress={() => setManualOpen(true)}>
                    <View style={styles.manualLink}>
                      <Icon name="edit" size={14} color={colors.textMuted} />
                      <Text style={styles.manualLinkText}>Counted fewer? Enter a number</Text>
                    </View>
                  </Pressable>
                ) : (
                  <View style={styles.manualRow}>
                    <TextInput
                      value={manualValue}
                      onChangeText={setManualValue}
                      keyboardType="number-pad"
                      placeholder={`0–${target}`}
                      placeholderTextColor={colors.textFaint}
                      style={styles.manualInput}
                      autoFocus
                    />
                    <Pressable style={({ pressed }) => [styles.manualSetBtn, pressed && styles.pressed]} onPress={onManualSubmit}>
                      <Text style={styles.ctaPrimaryText}>Set</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}

            {stage === 'c' && (
              <View style={styles.ownCard}>
                <Text style={styles.eyebrow}>{`Day ${night} of ${totalNights} · ends ${endLabel}`}</Text>
                <Text style={styles.cardBody}>{`${activeDua.tr} · ${Math.max(0, target - tally)} left of tonight's ${target}`}</Text>
                <View style={styles.counterRow}>
                  <Pressable onPress={onTap} style={({ pressed }) => pressed && styles.pressed}>
                    <ProgressRing size={56} strokeWidth={6} progress={tally / target} color={colors.accent} trackColor={colors.divider}>
                      <Text style={styles.ringNumberSm}>{tally}</Text>
                    </ProgressRing>
                  </Pressable>
                  <View>
                    <Text style={styles.cardTitle}>{cleanTitle}</Text>
                    <Text style={styles.counterCaption}>{`${tally} of ${target}`}</Text>
                  </View>
                </View>
                <View style={styles.ctaRow}>
                  <Pressable style={({ pressed }) => [styles.ctaPrimary, pressed && styles.pressed]} onPress={onTap}>
                    <Text style={styles.ctaPrimaryText}>Continue counting</Text>
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.ctaOutline, pressed && styles.pressed]} onPress={() => goTasbih()}>
                    <Text style={styles.ctaOutlineText}>Tasbih</Text>
                  </Pressable>
                </View>
                {streakCurrent > 0 && (
                  <Text style={styles.streakLine}>
                    {`${streakCurrent} day${streakCurrent === 1 ? '' : 's'} unbroken · longest ${streakLongest}`}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={{ width: cardWidth }}>
            <View style={styles.socialCard}>
              <Text style={styles.eyebrow}>What others are running</Text>
              <Text style={styles.cardTitle}>Ease in a difficult matter</Text>
              <Text style={styles.cardBody}>1,240 people started this week.</Text>
              <Pressable style={({ pressed }) => [styles.ctaOutline, pressed && styles.pressed, { marginTop: space.sm }]} onPress={() => navigation.navigate('Library')}>
                <Text style={styles.ctaOutlineText}>Browse Benefits</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ width: cardWidth }}>
            <View style={styles.lockedCard}>
              <View style={styles.lockChip}>
                <Icon name="lock" size={12} color={colors.gold} />
                <Text style={styles.lockChipText}>Premium practice</Text>
              </View>
              <Text style={styles.pagerPos}>4 of 41</Text>
              <Text style={styles.cardTitle}>The forty-day Ṣalawāt</Text>
              <Text style={styles.cardBody}>
                Ṣalawāt Ṭibb al-Qulūb · 100 after Fajr for forty days. The longest practice in the library, and the one members finish most.
              </Text>
              <Text style={styles.socialProof}>1,208 members are on day 17 tonight</Text>
              <View style={styles.ctaRow}>
                <Pressable style={({ pressed }) => [styles.ctaPrimary, pressed && styles.pressed]} onPress={goLockedPaywall}>
                  <Text style={styles.ctaPrimaryText}>See what premium opens</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [styles.ctaOutline, pressed && styles.pressed]} onPress={() => navigation.navigate('Library')}>
                  <Text style={styles.ctaOutlineText}>Read it</Text>
                </Pressable>
              </View>
              <Text style={styles.footnote}>You can read the method and the source for free. Only the tracked forty-day run needs premium.</Text>
              <Text style={styles.hintText}>Swipe back to your count</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.railFooter}>
          <View style={styles.dotsRow}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.dot, i === railIndex && styles.dotActive]} />
            ))}
          </View>
          <Text style={styles.railHint}>Swipe for what others are running</Text>
        </View>
      </View>

      <View style={{ gap: rhythm.sectionHeader }}>
        <Text style={styles.sectionTitle}>Quick access</Text>
        <View style={styles.quickRow}>
          {QUICK_ACCESS.map((q) => (
            <Pressable key={q.label} style={({ pressed }) => [styles.quickTile, pressed && styles.pressed]} onPress={() => navigation.navigate(q.go)}>
              <IconChip icon={q.icon} set="community" size={40} radius={12} />
              <Text style={styles.quickLabel}>{q.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ gap: rhythm.sectionHeader }}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>What do you need?</Text>
          <Pressable onPress={() => navigation.navigate('Library')}>
            <Text style={styles.seeAll}>All 10</Text>
          </Pressable>
        </View>
        <View style={{ gap: space.xs }}>
          {CATS.slice(0, 4).map((c) => {
            const tint = categoryTints[c.id];
            const seeded = practice ? c.id === practice.catId : c.id === seedCat.id;
            return (
              <Pressable key={c.id} style={({ pressed }) => [styles.needRow, pressed && styles.pressed]} onPress={() => navigation.navigate('Category', { catId: c.id })}>
                <IconChip icon={c.icon} size={40} radius={12} bg={tint.bg} iconColor={tint.dark} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.needTitle}>{c.title}</Text>
                  <Text style={styles.needMeta}>{`${c.total} practices${seeded ? ' · what you asked for' : ''}`}</Text>
                </View>
                <Icon name="chevron_right" size={20} color={colors.textFaint} />
              </Pressable>
            );
          })}
        </View>
      </View>

      {stage === 'c' && (
        <View style={{ gap: rhythm.sectionHeader }}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Also today</Text>
            <Pressable onPress={() => navigation.navigate('Library')}>
              <Text style={styles.seeAll}>Full day</Text>
            </Pressable>
          </View>
          <Text style={styles.metaText}>{`${openCount} open · ${missedCount} missed · ${ALSO_TODAY_DONE_COUNT} done`}</Text>
          <View style={{ gap: space.xs }}>
            {ALSO_TODAY.map((a) => (
              <View key={a.key} style={styles.alsoRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.needTitle}>{a.title}</Text>
                  <Text style={[styles.needMeta, a.tone === 'missed' && { color: colors.gold }]}>{a.sub}</Text>
                </View>
                <Pressable style={({ pressed }) => [styles.alsoCta, a.tone === 'missed' && styles.alsoCtaGold, pressed && styles.pressed]} onPress={() => goAlso(a)}>
                  <Text style={[styles.alsoCtaText, a.tone === 'missed' && { color: colors.gold }]}>{a.cta}</Text>
                </Pressable>
              </View>
            ))}
          </View>
          <Pressable onPress={() => navigation.navigate('Library')}>
            <Text style={styles.footerLink}>Looking for something else? Browse all 10 in Benefits</Text>
          </Pressable>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerBand: {
    marginHorizontal: -rhythm.screenX, paddingHorizontal: rhythm.screenX,
    paddingTop: space.xs, paddingBottom: space.sm, gap: rhythm.sectionHeader,
    overflow: 'hidden',
  },
  headerBandImg: { height: 260, top: 0 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.xs, paddingTop: space.xxs },
  dateLine: {
    fontFamily: fonts.semibold, fontSize: size.caption, color: colors.textMuted,
  },
  greeting: {
    ...serifHeading(size.title1, fonts.serifBold),
    letterSpacing: tracking.title, color: colors.textPrimary, marginTop: space.sm,
  },
  iconBtn: { width: minTouch, height: minTouch, alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 6, right: 6, width: 11, height: 11, borderRadius: 6, backgroundColor: colors.gold },
  avatar: { width: minTouch, height: minTouch, borderRadius: minTouch / 2, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bold, fontSize: size.bodySm, color: colors.onMintText },
  avatarGuest: {
    width: minTouch, height: minTouch, borderRadius: minTouch / 2, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.iconChipBg, borderWidth: 1, borderColor: colors.outlineBorder,
  },

  prayerStrip: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    backgroundColor: colors.bgCard, borderRadius: radius.card, padding: space.sm,
    borderWidth: 1, borderColor: colors.outlineBorder,
  },
  prayerStripText: { flex: 1, fontFamily: fonts.bold, fontSize: size.bodySm, color: colors.textPrimary },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: {
    ...serifHeading(size.title2),
    letterSpacing: tracking.title, color: colors.textPrimary,
  },
  metaText: { fontFamily: fonts.semibold, fontSize: size.label, color: colors.textSecondary },
  seeAll: { fontFamily: fonts.bold, fontSize: size.bodySm, color: colors.accent },

  ownCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.hero, padding: space.lg, gap: space.sm,
    borderWidth: 1, borderColor: colors.freeCardBorder, ...elevation.card,
  },
  socialCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.hero, padding: space.lg, gap: space.sm,
    borderWidth: 1, borderColor: colors.outlineBorder, ...elevation.card,
  },
  lockedCard: {
    backgroundColor: colors.amberCardBg, borderRadius: radius.hero, padding: space.lg, gap: space.sm,
    borderWidth: 1, borderColor: colors.brokenStreakBorder, ...elevation.card,
  },
  eyebrow: {
    fontFamily: fonts.bold, fontSize: size.caption, letterSpacing: tracking.eyebrow,
    textTransform: 'uppercase', color: colors.accent,
  },
  cardTitle: {
    ...serifHeading(size.title2, fonts.serifBold),
    letterSpacing: tracking.title, color: colors.textPrimary,
  },
  cardBody: { fontFamily: fonts.regular, fontSize: size.bodySm, lineHeight: leading.bodySm, color: colors.textSecondary },
  socialProof: { fontFamily: fonts.semibold, fontSize: size.label, color: colors.goldMeta },

  ctaRow: { flexDirection: 'row', gap: space.xs, marginTop: space.xxs },
  ctaPrimary: { flex: 1, backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: space.sm, alignItems: 'center' },
  ctaPrimaryText: { fontFamily: fonts.bold, fontSize: size.bodySm, color: colors.onMintText },
  ctaOutline: {
    flex: 1, borderWidth: 1, borderColor: colors.outlineBorder, borderRadius: radius.pill,
    paddingVertical: space.sm, alignItems: 'center',
  },
  ctaOutlineText: { fontFamily: fonts.bold, fontSize: size.bodySm, color: colors.textPrimary },
  footnote: { fontFamily: fonts.regular, fontSize: size.caption, color: colors.textFaint, marginTop: space.xxs },
  hintText: { fontFamily: fonts.semibold, fontSize: size.caption, color: colors.goldMeta },
  streakLine: { fontFamily: fonts.semibold, fontSize: size.label, color: colors.textMuted, marginTop: space.xxs },

  lockChip: {
    flexDirection: 'row', alignItems: 'center', gap: space.xxs, alignSelf: 'flex-start',
    backgroundColor: colors.premiumGradStart, borderRadius: radius.pill,
    paddingVertical: space.xxs, paddingHorizontal: space.sm - 2,
  },
  lockChipText: { fontFamily: fonts.extrabold, fontSize: size.caption, letterSpacing: tracking.eyebrow, textTransform: 'uppercase', color: colors.gold },
  pagerPos: { fontFamily: fonts.semibold, fontSize: size.caption, color: colors.goldMeta },

  counterRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  ringNumber: { fontFamily: fonts.extrabold, fontSize: size.title3, color: colors.textPrimary },
  ringNumberSm: { fontFamily: fonts.extrabold, fontSize: size.bodySm, color: colors.textPrimary },
  counterCaption: { fontFamily: fonts.semibold, fontSize: size.label, color: colors.textMuted, marginTop: space.xxs },

  creditRow: { flexDirection: 'row', gap: space.xxs, flexWrap: 'wrap' },
  creditBtn: {
    flexDirection: 'row', alignItems: 'center', gap: space.xxs, flexGrow: 1, flexBasis: '30%',
    backgroundColor: colors.bgInput, borderRadius: radius.chip, paddingVertical: space.xs, paddingHorizontal: space.xs,
    justifyContent: 'center',
  },
  creditBtnText: { fontFamily: fonts.bold, fontSize: size.caption, color: colors.textPrimary, flexShrink: 1 },
  manualLink: { flexDirection: 'row', alignItems: 'center', gap: space.xxs },
  manualLinkText: { fontFamily: fonts.semibold, fontSize: size.caption, color: colors.textMuted },
  manualRow: { flexDirection: 'row', gap: space.xs },
  manualInput: {
    flex: 1, backgroundColor: colors.bgInput, borderRadius: radius.chip, borderWidth: 1, borderColor: colors.outlineBorder,
    paddingHorizontal: space.sm, paddingVertical: space.xs, fontFamily: fonts.semibold, fontSize: size.bodySm, color: colors.textPrimary,
  },
  manualSetBtn: { backgroundColor: colors.accent, borderRadius: radius.chip, paddingHorizontal: space.md, alignItems: 'center', justifyContent: 'center' },

  railFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  dotsRow: { flexDirection: 'row', gap: space.xxs + 2 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.outlineBorder },
  dotActive: { width: 18, backgroundColor: colors.accent },
  railHint: { fontFamily: fonts.semibold, fontSize: size.caption, color: colors.textFaint },

  quickRow: { flexDirection: 'row', gap: space.sm - 2 },
  quickTile: {
    flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.tile,
    paddingVertical: space.sm + 2, paddingHorizontal: space.sm, gap: space.xs, alignItems: 'flex-start',
    ...elevation.card,
  },
  quickLabel: { fontFamily: fonts.bold, fontSize: size.label, color: colors.textPrimary },

  needRow: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    backgroundColor: colors.bgCard, borderRadius: radius.card, padding: space.sm,
    borderWidth: 1, borderColor: colors.outlineBorder,
  },
  needTitle: { fontFamily: fonts.bold, fontSize: size.bodySm, color: colors.textPrimary },
  needMeta: { fontFamily: fonts.semibold, fontSize: size.caption, color: colors.textMuted, marginTop: space.xxs },

  alsoRow: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    backgroundColor: colors.bgCard, borderRadius: radius.card, padding: space.sm,
    borderWidth: 1, borderColor: colors.outlineBorder,
  },
  alsoCta: { borderWidth: 1, borderColor: colors.outlineBorder, borderRadius: radius.pill, paddingVertical: space.xs, paddingHorizontal: space.sm },
  alsoCtaGold: { borderColor: colors.brokenStreakBorder },
  alsoCtaText: { fontFamily: fonts.bold, fontSize: size.caption, color: colors.textPrimary },
  footerLink: { fontFamily: fonts.semibold, fontSize: size.bodySm, color: colors.accent, textAlign: 'center' },

  pressed: { opacity: 0.9, transform: [{ scale: motion.pressScale }] },
});
