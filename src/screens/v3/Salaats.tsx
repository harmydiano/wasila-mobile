import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stagger, useStagger } from '../../components/v3/Stagger';
import { Chevron, GoldHead, GUTTER, Row, ScrollFade, TitleBlock, Well } from '../../components/v3/more/parts';
import { fonts, serifHeading, SIZE, CLAMP, bodyLeading } from '../../theme/type';
import { more } from '../../theme/v3/colors';
import { ScrollView } from 'react-native-gesture-handler';
import { loadSalaats, type Salaat } from '../../data/salaats';
import { SALAATS_SEED } from '../../data/salaatsSeed';
import { nameOf } from '../../data/hijriCalendar';
import { hijriMonthName } from '../../utils/hijri';

export default function Salaats({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<Salaat[]>(SALAATS_SEED);
  const anim = useStagger(2);

  useEffect(() => {
    let alive = true;
    loadSalaats().then((r) => alive && setRows(r));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <Stagger v={anim[0]}>
        <TitleBlock
          title="Salat"
          meta="Voluntary prayers, and when they are kept"
          onBack={() => navigation.goBack()}
        />
      </Stagger>

      <View style={styles.scrollWrap}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
          <Stagger v={anim[1]}>
            <GoldHead label="Prayers" count={`${rows.length}`} style={styles.head} />
            <Well>
              {!rows.length && <Text style={styles.empty}>No prayers are listed yet.</Text>}
              {rows.map((s) => (
                <Row
                  key={s.slug}
                  height={78}
                  onPress={() => navigation.navigate('SalaatDetail', { slug: s.slug })}
                  accessibilityLabel={nameOf(s.name)}
                >
                  <View style={styles.col}>
                    <Text style={styles.name} numberOfLines={1}>
                      {nameOf(s.name)}
                    </Text>
                    <Text style={styles.translit} numberOfLines={1}>
                      {nameOf(s.name, 'ar-Latn')}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                      {s.highlights.length
                        ? s.highlights.join(' · ')
                        : s.months.map((m) => nameOf(m.name, 'ar-Latn') || hijriMonthName(m.number)).join(' · ')}
                    </Text>
                  </View>
                  <Chevron />
                </Row>
              ))}
            </Well>
          </Stagger>
        </ScrollView>
        <ScrollFade />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: more.ground },
  scrollWrap: { flex: 1, position: 'relative' },
  scroll: { paddingHorizontal: GUTTER, paddingTop: 18, paddingBottom: 40 },
  head: { marginBottom: 12 },

  col: { flex: 1, gap: 3 },
  name: { ...serifHeading(SIZE.title), color: more.ink },
  translit: { fontFamily: fonts.regular, fontSize: SIZE.caption, color: more.gold },
  meta: { fontFamily: fonts.regular, fontSize: SIZE.caption, color: more.meta, marginTop: 2 },
  empty: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: bodyLeading(SIZE.body),
    color: more.meta,
  },
});
