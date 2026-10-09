import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import { Stagger, useReduceMotion, useStagger } from '../../components/v3/Stagger';
import {
  Chevron,
  GUTTER,
  LiveDot,
  Row,
  ScrollFade,
  SearchInput,
  TitleBlock,
  Well,
} from '../../components/v3/more/parts';
import { fonts, serifHeading, arabicText, SIZE, CLAMP, uiLeading, bodyLeading } from '../../theme/type';
import { more } from '../../theme/v3/colors';
import { SALAWAT, type Salawat as Form } from '../../data/salawat';
import { queryTerms, searchBy } from '../../utils/search';
import { useAppState, dayKey } from '../../state/AppState';

type Tab = 'all' | 'saved';

export default function Salawat({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { moreSaved, morePractice } = useAppState();
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const anim = useStagger(3);

  const live = morePractice && morePractice.kind === 'salawat' ? morePractice : null;
  const doneToday = live && live.doneDateKey === dayKey(new Date()) ? live.done : 0;

  const rows = useMemo(() => {
    const pool = tab === 'saved' ? SALAWAT.filter((f) => moreSaved[`form:${f.id}`]) : SALAWAT;
    if (!queryTerms(query).length) return pool;
    return searchBy(pool, query, (f) => [f.title, f.english, f.arTitle]);
  }, [tab, query, moreSaved]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <Stagger v={anim[0]}>
        <TitleBlock
          title="Salawat"
          meta="Nine forms · numbered as in the collection"
          onBack={() => navigation.goBack()}
        />
      </Stagger>

      <View style={styles.scrollWrap}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
          <Stagger v={anim[1]} style={styles.controls}>
            <SearchInput placeholder="Search the forms" value={query} onChangeText={setQuery} />
            <Tabs tab={tab} onChange={setTab} />
          </Stagger>

          <Stagger v={anim[2]}>
            {rows.length === 0 ? (
              <Text style={styles.none}>
                {tab === 'saved' ? 'The bookmark on a form puts it here.' : 'No form matches that.'}
              </Text>
            ) : (
              <Well>
                {rows.map((f) => (
                  <FormRow
                    key={f.id}
                    form={f}
                    running={
                      live && live.id === f.id
                        ? { done: doneToday, target: live.target, day: live.day, of: live.of }
                        : null
                    }
                    onPress={() => navigation.navigate('SalawatDetail', { id: f.id })}
                  />
                ))}
              </Well>
            )}
          </Stagger>
        </ScrollView>
        <ScrollFade />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open Benefits"
        onPress={() => navigation.navigate('Library')}
        style={({ pressed }) => [styles.foot, pressed && styles.pressed]}
      >
        <Text style={styles.footText}>
          Any of these may be read for any need. <Text style={styles.footStrong}>Benefits</Text> lists
          what each one is kept for.
        </Text>
        <Chevron />
      </Pressable>
    </SafeAreaView>
  );
}

function Tabs({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const [width, setWidth] = useState(0);
  const reduced = useReduceMotion();
  const slide = useRef(new Animated.Value(0)).current;
  const index = tab === 'all' ? 0 : 1;

  React.useEffect(() => {
    const to = (width / 2) * index;
    if (reduced || width === 0) {
      slide.setValue(to);
      return;
    }
    Animated.timing(slide, { toValue: to, duration: 160, useNativeDriver: true }).start();
  }, [index, width, reduced, slide]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.tabs} onLayout={onLayout}>
      {(['all', 'saved'] as Tab[]).map((k) => (
        <Pressable
          key={k}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === k }}
          style={styles.tab}
          onPress={() => onChange(k)}
        >
          <Text style={[styles.tabText, tab === k && styles.tabTextOn]} maxFontSizeMultiplier={CLAMP}>
            {k === 'all' ? 'All forms' : 'Saved'}
          </Text>
        </Pressable>
      ))}
      {width > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[styles.underline, { width: width / 2, transform: [{ translateX: slide }] }]}
        />
      )}
    </View>
  );
}

function FormRow({
  form,
  running,
  onPress,
}: {
  form: Form;
  running: { done: number; target: number | null; day: number; of: number } | null;
  onPress: () => void;
}) {
  return (
    <Row height={running ? 78 : 70} onPress={onPress} accessibilityLabel={form.title}>
      <View style={styles.formCol}>
        <View style={styles.formTitleRow}>
          <Text style={styles.formIndex} maxFontSizeMultiplier={CLAMP}>
            {form.n}.
          </Text>
          <Text style={styles.formTitle} numberOfLines={1}>
            {form.title}
          </Text>
        </View>
        <View style={styles.formSubRow}>
          <Text style={styles.formEnglish} numberOfLines={1}>
            {form.english}
          </Text>
          <Text style={styles.formArabic} maxFontSizeMultiplier={1} numberOfLines={1}>
            {form.arTitle}
          </Text>
        </View>
        {!!running && (
          <View style={styles.runRow}>
            <LiveDot />
            <Text style={styles.runText} maxFontSizeMultiplier={CLAMP}>
              RUNNING · {running.done}
              {running.target ? ` OF ${running.target}` : ''} · DAY {running.day} OF {running.of}
            </Text>
          </View>
        )}
      </View>
      <Chevron />
    </Row>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: more.ground },

  scrollWrap: { flex: 1, position: 'relative' },
  scroll: { paddingHorizontal: GUTTER, paddingTop: 18, paddingBottom: 36 },
  controls: { gap: 14, marginBottom: 16 },

  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: more.hairline },
  tab: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontFamily: fonts.bold, fontSize: SIZE.body, color: more.meta },
  tabTextOn: { color: more.ink },
  underline: { position: 'absolute', left: 0, bottom: -1, height: 2, backgroundColor: more.mint },

  formCol: { flex: 1, gap: 4 },
  formTitleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  formIndex: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: more.gold },
  formTitle: { ...serifHeading(SIZE.title), color: more.ink, flexShrink: 1 },
  formSubRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  formEnglish: { flex: 1, fontFamily: fonts.regular, fontSize: SIZE.caption, color: more.meta },
  formArabic: { ...arabicText(15), color: more.gold },
  runRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  runText: {
    fontFamily: fonts.extrabold,
    fontSize: SIZE.caption,
    lineHeight: uiLeading(SIZE.caption),
    letterSpacing: 1.2,
    color: more.mint,
  },

  none: {
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: bodyLeading(SIZE.body),
    color: more.meta,
    paddingVertical: 24,
  },

  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: GUTTER,
    marginBottom: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: more.hairline,
  },
  footText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: bodyLeading(SIZE.body),
    color: more.ink3,
  },
  footStrong: { fontFamily: fonts.bold, color: more.ink2 },

  pressed: { opacity: 0.9 },
});
