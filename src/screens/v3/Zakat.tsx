import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chevron, GoldHead, GoldPanel, GUTTER, LiveDot, Row, TitleBlock, Well } from '../../components/v3/more/parts';
import { Stagger, useReduceMotion, useStagger } from '../../components/v3/Stagger';
import { fonts, serifHeading, tabular, SIZE, CLAMP, bodyLeading } from '../../theme/type';
import { more } from '../../theme/v3/colors';
import { NISAB, ZAKAT_RATE, money, nisabValue } from '../../data/zakat';
import { useAppState, type ZakatState } from '../../state/AppState';

type Field = keyof Omit<ZakatState, 'threshold'>;

const HOLDINGS: { key: Field; label: string; meta: string }[] = [
  { key: 'cash', label: 'Cash and bank', meta: 'Held a full lunar year' },
  { key: 'metals', label: 'Gold and silver', meta: "At today's resale value" },
  { key: 'owedToYou', label: 'Owed to you', meta: 'Debts you expect back' },
];

export default function Zakat({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const footPad = Math.max(insets.bottom, 12) + 10;
  const { zakat, setZakat } = useAppState();
  const [editing, setEditing] = useState<Field | null>(null);
  const anim = useStagger(5);

  const held = zakat.cash + zakat.metals + zakat.owedToYou;
  const net = held - zakat.debts;
  const threshold = nisabValue(zakat.threshold);
  const due = net > threshold ? net * ZAKAT_RATE : 0;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <Stagger v={anim[0]}>
        <TitleBlock
          title="Zakat"
          meta={`On today's nisab · ${ZAKAT_RATE * 100}% of what is held`}
          onBack={() => navigation.goBack()}
        />
      </Stagger>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Stagger v={anim[1]}>
          <View style={styles.nisab}>
            <View style={styles.nisabHead}>
              <Text style={styles.nisabLabel} maxFontSizeMultiplier={CLAMP}>
                NISAB TODAY
              </Text>
              <Text style={styles.nisabDate} maxFontSizeMultiplier={CLAMP}>
                {NISAB.asOf}
              </Text>
            </View>
            <View style={styles.nisabCols}>
              <ThresholdColumn
                label={`Silver · ${NISAB.silver.grams}g`}
                value={money(NISAB.silver.value)}
                inUse={zakat.threshold === 'silver'}
                onPress={() => setZakat({ threshold: 'silver' })}
              />
              <View style={styles.nisabRule} />
              <ThresholdColumn
                label={`Gold · ${NISAB.gold.grams}g`}
                value={money(NISAB.gold.value)}
                inUse={zakat.threshold === 'gold'}
                onPress={() => setZakat({ threshold: 'gold' })}
              />
            </View>
            <Text style={styles.nisabNote}>
              Wasīla uses the silver threshold, which is lower and brings more people into paying.
              You can switch to gold above.
            </Text>
          </View>
        </Stagger>

        <Stagger v={anim[2]} style={styles.section}>
          <GoldHead label="What you hold" count={money(held)} />
          <Well>
            {HOLDINGS.map((h) => (
              <AmountRow
                key={h.key}
                label={h.label}
                meta={h.meta}
                value={zakat[h.key]}
                editing={editing === h.key}
                onEdit={() => setEditing(h.key)}
                onCommit={(v) => {
                  setZakat({ [h.key]: v } as Partial<ZakatState>);
                  setEditing(null);
                }}
              />
            ))}
          </Well>
        </Stagger>

        <Stagger v={anim[3]} style={styles.section}>
          <GoldHead label="What you owe" count={money(zakat.debts)} />
          <Well>
            <AmountRow
              label="Debts due this year"
              meta="Rent, bills and repayments"
              value={zakat.debts}
              editing={editing === 'debts'}
              onEdit={() => setEditing('debts')}
              onCommit={(v) => {
                setZakat({ debts: v });
                setEditing(null);
              }}
            />
          </Well>
        </Stagger>

        <Stagger v={anim[4]} style={styles.section}>
          <GoldPanel label="The working" glyph="calculate">
            {`${held.toLocaleString('en-GB')} − ${zakat.debts.toLocaleString('en-GB')} = ${net.toLocaleString(
              'en-GB'
            )} held. That is ${net > threshold ? 'above' : 'below'} the nisab of ${money(
              threshold
            )}, so ${net > threshold ? `${ZAKAT_RATE * 100}% of it is due` : 'nothing is due'}.`}
          </GoldPanel>
        </Stagger>
      </ScrollView>

      <View style={[styles.foot, { paddingBottom: footPad }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dueLabel} maxFontSizeMultiplier={CLAMP}>
            ZAKAT DUE
          </Text>
          <DueFigure value={due} />
          <View style={styles.dueLine}>
            <LiveDot size={5} />
            <Text style={styles.dueMeta} maxFontSizeMultiplier={CLAMP}>
              YOUR YEAR ENDED 14 DAYS AGO
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save this calculation"
          style={({ pressed }) => [styles.save, pressed && styles.pressed]}
        >
          <Text style={styles.saveText} maxFontSizeMultiplier={CLAMP}>
            Save
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function DueFigure({ value }: { value: number }) {
  const reduced = useReduceMotion();
  const fade = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    fade.setValue(0.35);
    Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  }, [value, fade, reduced]);
  return (
    <Animated.Text style={[styles.due, { opacity: fade }]} maxFontSizeMultiplier={1}>
      {money(value, 2)}
    </Animated.Text>
  );
}

function ThresholdColumn({
  label,
  value,
  inUse,
  onPress,
}: {
  label: string;
  value: string;
  inUse: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: inUse }}
      accessibilityLabel={`${label}, ${inUse ? 'in use' : 'not in use'}`}
      onPress={onPress}
      style={styles.nisabCol}
    >
      <Text style={styles.nisabColLabel} maxFontSizeMultiplier={CLAMP}>
        {label}
      </Text>
      <Text style={[styles.nisabColValue, !inUse && styles.nisabColValueOff]} maxFontSizeMultiplier={1}>
        {value}
      </Text>
      <Text style={styles.nisabColState} maxFontSizeMultiplier={CLAMP}>
        {inUse ? 'IN USE' : 'SWITCH'}
      </Text>
    </Pressable>
  );
}

function AmountRow({
  label,
  meta,
  value,
  editing,
  onEdit,
  onCommit,
}: {
  label: string;
  meta: string;
  value: number;
  editing: boolean;
  onEdit: () => void;
  onCommit: (v: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => {
    if (editing) setDraft(String(value));
  }, [editing, value]);

  return (
    <Row height={60} onPress={editing ? undefined : onEdit} accessibilityLabel={`${label}, ${value}`}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          {meta}
        </Text>
      </View>
      {editing ? (
        <TextInput
          value={draft}
          onChangeText={(t) => setDraft(t.replace(/[^0-9.]/g, ''))}
          onBlur={() => onCommit(Number(draft) || 0)}
          onSubmitEditing={() => onCommit(Number(draft) || 0)}
          keyboardType="decimal-pad"
          returnKeyType="done"
          autoFocus
          selectTextOnFocus
          style={styles.input}
          accessibilityLabel={`${label} amount`}
        />
      ) : (
        <>
          <Text style={styles.rowValue} maxFontSizeMultiplier={1}>
            {money(value)}
          </Text>
          <Chevron />
        </>
      )}
    </Row>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: more.ground },
  body: { paddingHorizontal: GUTTER, paddingTop: 18, paddingBottom: 24, gap: 20 },
  section: { gap: 12 },

  nisab: {
    backgroundColor: more.elevated,
    borderRadius: 22,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: more.strong,
    borderTopColor: more.liftElevated,
  },
  nisabHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nisabLabel: { fontFamily: fonts.extrabold, fontSize: SIZE.caption, letterSpacing: 1.9, color: more.gold },
  nisabDate: { fontFamily: fonts.regular, fontSize: SIZE.caption, color: more.meta },
  nisabCols: { flexDirection: 'row', alignItems: 'stretch' },
  nisabCol: { flex: 1, gap: 4 },
  nisabRule: { width: 1, backgroundColor: more.strong, marginHorizontal: 16 },
  nisabColLabel: { fontFamily: fonts.semibold, fontSize: SIZE.meta, color: more.ink3 },
  nisabColValue: { ...serifHeading(SIZE.cardTitle), color: more.ink, ...tabular },
  nisabColValueOff: { color: more.ink3 },
  nisabColState: { fontFamily: fonts.extrabold, fontSize: SIZE.caption - 1, letterSpacing: 1.4, color: more.meta },
  nisabNote: {
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: bodyLeading(SIZE.body),
    color: more.ink3,
  },

  rowLabel: { fontFamily: fonts.semibold, fontSize: SIZE.title, color: more.ink },
  rowMeta: { fontFamily: fonts.regular, fontSize: SIZE.caption, color: more.meta, marginTop: 3 },
  rowValue: { fontFamily: fonts.bold, fontSize: SIZE.title, color: more.ink2, ...tabular },
  input: {
    minWidth: 96,
    textAlign: 'right',
    fontFamily: fonts.bold,
    fontSize: SIZE.title,
    color: more.mint,
    paddingVertical: 0,
    ...tabular,
  },

  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: GUTTER,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: more.strong,
  },
  dueLabel: { fontFamily: fonts.extrabold, fontSize: SIZE.caption, letterSpacing: 1.9, color: more.gold },
  due: { fontFamily: fonts.serif, fontSize: 34, lineHeight: 40, color: more.ink, ...tabular },
  dueLine: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 2 },
  dueMeta: { fontFamily: fonts.extrabold, fontSize: SIZE.caption - 1, letterSpacing: 1.2, color: more.mint },
  save: {
    minHeight: 44,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: more.mint,
  },
  saveText: { fontFamily: fonts.extrabold, fontSize: SIZE.title, color: more.onMint },

  pressed: { opacity: 0.9 },
});
