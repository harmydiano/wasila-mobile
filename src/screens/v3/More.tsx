import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../../components/BottomNav';
import Icon from '../../components/Icon';
import { Stagger, useStagger } from '../../components/v3/Stagger';
import {
  Chevron,
  GoldHead,
  GUTTER,
  Khatam,
  LiveDot,
  Row,
  TitleBlock,
  TITLE_ROOT,
  Well,
} from '../../components/v3/more/parts';
import { fonts, serifHeading, SIZE, CLAMP, uiLeading, bodyLeading } from '../../theme/type';
import { more } from '../../theme/v3/colors';
import { useAppState } from '../../state/AppState';
import { hijriMonthName } from '../../utils/hijri';
import { useHijriDate } from '../../state/useHijriDate';
import { loadMonthNames, nameOf, type HijriMonthName } from '../../data/hijriCalendar';
import { loadSalaats } from '../../data/salaats';
import { SAINTS_TOTAL } from '../../data/saints';
import { SALAWAT } from '../../data/salawat';

const SALAWAT_COUNT = SALAWAT.length;

const ICON_SALAWAT = require('../../../design-assets/v3/practice/practice-salawat.png');
const ICON_NAMES = require('../../../design-assets/v3/practice/practice-names99-star.png');
const ICON_SAINTS = require('../../../design-assets/v3/practice/practice-saints.png');
const ICON_SALAT = require('../../../design-assets/v3/practice/practice-salat.png');

export default function More({ navigation }: any) {
  const { morePractice, zakat } = useAppState();
  const anim = useStagger(6);
  const hijri = useHijriDate();
  const [monthNames, setMonthNames] = useState<HijriMonthName[]>([]);
  const [salaats, setSalaats] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    loadMonthNames().then((n) => alive && setMonthNames(n));
    loadSalaats().then((s) => alive && setSalaats(s.length));
    return () => {
      alive = false;
    };
  }, []);

  const live =
    morePractice && morePractice.kind === 'salawat'
      ? morePractice
      : null;
  const heroLine = live
    ? `${live.title.toUpperCase()} · DAY ${live.day} OF ${live.of}`
    : `CHOOSE A FORM TO BEGIN`;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Stagger v={anim[0]}>
          <TitleBlock
            title="More"
            meta="Everything outside the five tabs"
            size={TITLE_ROOT}
            right={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Settings"
                onPress={() => navigation.navigate('Settings')}
                style={({ pressed }) => [styles.settingsPill, pressed && styles.pressed]}
              >
                <Icon name="tune" size={17} color={more.ink2} />
                <Text style={styles.settingsText} maxFontSizeMultiplier={CLAMP}>
                  Settings
                </Text>
              </Pressable>
            }
          />
        </Stagger>

        <Stagger v={anim[1]} style={styles.section}>
          <GoldHead label="Practice" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Salawat — nine forms"
            onPress={() => navigation.navigate('Salawat')}
            style={({ pressed }) => [styles.hero, pressed && styles.pressed]}
          >
            <Khatam />
            <View style={styles.heroHead}>
              <Image source={ICON_SALAWAT} style={styles.heroIcon} resizeMode="contain" />
              <Chevron color={more.ink3} />
            </View>
            <Text style={styles.heroTitle}>Salawat</Text>
            <Text style={styles.heroBody}>
              {`${SALAWAT_COUNT} forms of blessing on the Prophet, each counted on its own.`}
            </Text>
            <View style={styles.heroLine}>
              {!!live && <LiveDot />}
              <Text style={[styles.heroMeta, !live && styles.heroMetaQuiet]} maxFontSizeMultiplier={CLAMP}>
                {heroLine}
              </Text>
            </View>
          </Pressable>
        </Stagger>

        <Stagger v={anim[2]} style={styles.tiles}>
          <Tile
            icon={ICON_NAMES}
            title="99 Names"
            meta="With meanings"
            onPress={() => navigation.navigate('Names99')}
          />
          <Tile
            icon={ICON_SAINTS}
            title="Saints"
            meta={`${SAINTS_TOTAL} lives`}
            onPress={() => navigation.navigate('Saints')}
          />
          <Tile
            icon={ICON_SALAT}
            title="Salat"
            meta={salaats === null ? 'Voluntary prayers' : `${salaats} ${salaats === 1 ? 'prayer' : 'prayers'}`}
            onPress={() => navigation.navigate('Salaats')}
          />
        </Stagger>

        <Stagger v={anim[3]} style={styles.section}>
          <GoldHead label="Look up" />
          <Well>
            <Row
              height={56}
              onPress={() => navigation.navigate('HijriCalendar')}
              accessibilityLabel="Hijri calendar"
            >
              <Icon name="calendar_month" size={20} color={more.ink3} />
              <Text style={styles.rowLabel}>Hijri calendar</Text>
              <Text style={styles.rowValue} maxFontSizeMultiplier={CLAMP}>
                {hijri.day}{' '}
                {nameOf(monthNames.find((m) => m.number === hijri.month)?.name, 'ar-Latn') ||
                  hijriMonthName(hijri.month)}
              </Text>
              <Chevron />
            </Row>
            <Row height={56} onPress={() => navigation.navigate('Zakat')} accessibilityLabel="Zakat">
              <Icon name="calculate" size={20} color={more.ink3} />
              <Text style={styles.rowLabel}>Zakat</Text>
              <Text style={styles.rowValue} maxFontSizeMultiplier={CLAMP}>
                Nisab · {zakat.threshold} today
              </Text>
              <Chevron />
            </Row>
          </Well>
        </Stagger>

      </ScrollView>
      <BottomNav active="More" ground={more.ground} />
    </SafeAreaView>
  );
}

function Tile({
  icon,
  title,
  meta,
  onPress,
}: {
  icon: number;
  title: string;
  meta: string;
  onPress?: () => void;
}) {
  const off = !onPress;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: off }}
      disabled={off}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, off && styles.tileOff, pressed && styles.pressed]}
    >
      <Image source={icon} style={styles.tileIcon} resizeMode="contain" />
      <Text style={styles.tileTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.tileMeta} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
        {meta}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: more.ground },
  content: { paddingBottom: 24 },

  settingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: more.raised,
    borderWidth: 1,
    borderColor: more.pillBorder,
  },
  settingsText: { fontFamily: fonts.bold, fontSize: SIZE.body, color: more.ink2 },

  section: { paddingHorizontal: GUTTER, marginTop: 24, gap: 14 },

  hero: {
    backgroundColor: more.elevated,
    borderRadius: 24,
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: more.liftElevated,
    borderWidth: 1,
    borderColor: more.strong,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
  },
  heroHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroIcon: { width: 52, height: 52 },
  heroTitle: { ...serifHeading(SIZE.cardTitle), color: more.ink },
  heroBody: {
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: bodyLeading(SIZE.body),
    color: more.ink3,
  },
  heroLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  heroMeta: {
    fontFamily: fonts.extrabold,
    fontSize: SIZE.caption,
    lineHeight: uiLeading(SIZE.caption),
    letterSpacing: 1.2,
    color: more.mint,
  },
  heroMetaQuiet: { color: more.meta },

  tiles: { flexDirection: 'row', gap: 10, paddingHorizontal: GUTTER, marginTop: 12 },
  tile: {
    flex: 1,
    backgroundColor: more.raised,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: more.liftRaised,
  },
  tileOff: { opacity: 0.45 },
  tileIcon: { width: 42, height: 42 },
  tileTitle: { ...serifHeading(SIZE.title), color: more.ink },
  tileMeta: { fontFamily: fonts.regular, fontSize: SIZE.caption, color: more.meta },

  rowLabel: { flex: 1, fontFamily: fonts.semibold, fontSize: SIZE.title, color: more.ink2 },
  rowValue: { fontFamily: fonts.regular, fontSize: SIZE.meta, color: more.meta },

  pressed: { opacity: 0.9 },
});
