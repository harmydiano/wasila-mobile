import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import { Stagger, useStagger } from '../../components/v3/Stagger';
import Prose from '../../components/v3/more/Prose';
import { GoldHead, GoldPanel, GUTTER, Row, Well } from '../../components/v3/more/parts';
import { fonts, serifHeading, SIZE, CLAMP } from '../../theme/type';
import { more } from '../../theme/v3/colors';
import { loadSalaats, type Salaat } from '../../data/salaats';
import { SALAATS_SEED } from '../../data/salaatsSeed';
import { nameOf } from '../../data/hijriCalendar';
import { hijriMonthName } from '../../utils/hijri';
import { useAppState } from '../../state/AppState';

export default function SalaatDetail({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const slug: string = route?.params?.slug ?? '';
  const [rows, setRows] = useState<Salaat[]>(SALAATS_SEED);
  const { moreSaved, toggleMoreSaved } = useAppState();
  const anim = useStagger(6);

  useEffect(() => {
    let alive = true;
    loadSalaats().then((r) => alive && setRows(r));
    return () => {
      alive = false;
    };
  }, []);

  const salaat = useMemo(() => rows.find((s) => s.slug === slug), [rows, slug]);
  const key = `salaat:${slug}`;
  const saved = !!moreSaved[key];

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow_back" size={23} color={more.ink} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove bookmark' : 'Bookmark this prayer'}
          hitSlop={10}
          style={styles.iconBtn}
          onPress={() => toggleMoreSaved(key)}
        >
          <Icon name={saved ? 'bookmark' : 'bookmark_border'} size={22} color={saved ? more.gold : more.ink3} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Share" hitSlop={10} style={styles.iconBtn}>
          <Icon name="ios_share" size={21} color={more.ink3} />
        </Pressable>
      </View>

      {!salaat ? (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Nothing here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
          <Stagger v={anim[0]} style={styles.title}>
            <Text style={styles.name}>{nameOf(salaat.name)}</Text>
            {!!nameOf(salaat.name, 'ar') && (
              <Text style={styles.arabicName} maxFontSizeMultiplier={1}>
                {nameOf(salaat.name, 'ar')}
              </Text>
            )}
            <Text style={styles.translit}>{nameOf(salaat.name, 'ar-Latn')}</Text>
          </Stagger>

          {!!salaat.highlights.length && (
            <Stagger v={anim[1]} style={styles.chips}>
              {salaat.highlights.map((h) => (
                <View key={h} style={styles.chip}>
                  <Text style={styles.chipText} maxFontSizeMultiplier={CLAMP}>
                    {h}
                  </Text>
                </View>
              ))}
            </Stagger>
          )}

          {!!salaat.description && (
            <Stagger v={anim[2]} style={styles.block}>
              <Prose raw={salaat.description} />
            </Stagger>
          )}

          {!!salaat.method && (
            <Stagger v={anim[3]} style={styles.block}>
              <GoldHead label="The method" />
              <View style={styles.well}>
                <Prose raw={salaat.method} />
              </View>
            </Stagger>
          )}

          {(!!salaat.months.length || !!salaat.days.length) && (
            <Stagger v={anim[4]} style={styles.block}>
              <GoldHead label="When it is kept" />
              <Well>
                {salaat.days.map((d) => (
                  <Row key={`${d.month}-${d.day}`} height={68}>
                    <Text style={styles.when} maxFontSizeMultiplier={1}>
                      {d.day}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.whenTitle} numberOfLines={1}>
                        {nameOf(d.name) || `${d.day} ${hijriMonthName(d.month)}`}
                      </Text>
                      <Text style={styles.whenMeta} numberOfLines={2}>
                        {[
                          hijriMonthName(d.month),
                          d.note,
                          d.times?.map((t) => t.label).join(' · '),
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                    </View>
                  </Row>
                ))}
                {salaat.months.map((m) => (
                  <Row key={`m-${m.number}`} height={68}>
                    <Icon name="calendar_month" size={20} color={more.ink3} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.whenTitle} numberOfLines={1}>
                        {nameOf(m.name, 'ar-Latn') || hijriMonthName(m.number)}
                      </Text>
                      <Text style={styles.whenMeta} numberOfLines={2}>
                        {m.note ?? 'Throughout the month'}
                      </Text>
                    </View>
                  </Row>
                ))}
              </Well>
            </Stagger>
          )}

          {!!salaat.source && (
            <Stagger v={anim[5]} style={styles.block}>
              <GoldPanel label="Where it comes from">{salaat.source}</GoldPanel>
            </Stagger>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: more.ground },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: GUTTER - 10, paddingTop: 4 },
  iconBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },

  scroll: { paddingHorizontal: GUTTER, paddingTop: 6, paddingBottom: 36, gap: 20 },
  title: { gap: 6 },
  name: { ...serifHeading(SIZE.display), color: more.ink },
  arabicName: { fontFamily: fonts.arabic, fontSize: 26, lineHeight: 54, color: more.gold, writingDirection: 'rtl' },
  translit: { fontFamily: fonts.regular, fontSize: SIZE.meta, color: more.meta },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 30,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: more.raised,
    borderWidth: 1,
    borderColor: more.pillBorder,
  },
  chipText: { fontFamily: fonts.semibold, fontSize: SIZE.meta, color: more.ink2 },

  block: { gap: 12 },
  well: {
    backgroundColor: more.raised,
    borderRadius: 20,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: more.liftRaised,
  },

  when: { width: 28, fontFamily: fonts.serif, fontSize: SIZE.title + 2, color: more.gold },
  whenTitle: { fontFamily: fonts.semibold, fontSize: SIZE.title, color: more.ink },
  whenMeta: { fontFamily: fonts.regular, fontSize: SIZE.caption, color: more.meta, marginTop: 3 },

  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontFamily: fonts.regular, fontSize: SIZE.body, color: more.meta },
});
