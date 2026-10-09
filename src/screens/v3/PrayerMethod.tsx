import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import { GoldHead, GUTTER, Row, TitleBlock, Well } from '../../components/v3/more/parts';
import { fonts, SIZE, CLAMP, bodyLeading } from '../../theme/type';
import { colors, more } from '../../theme/v3/colors';
import { useAppState } from '../../state/AppState';
import { METHODS, type AsrRule } from '../../data/prayerMethods';

const ASR: { id: AsrRule; label: string; meta: string }[] = [
  { id: 'shafi', label: 'Standard', meta: 'Shafiʿi, Maliki, Hanbali' },
  { id: 'hanafi', label: 'Hanafi', meta: 'Asr begins later' },
];

export default function PrayerMethod({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { prayerMethod, setPrayerMethod } = useAppState();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <TitleBlock title="Prayer times" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.group}>
          <GoldHead label="Asr" />
          <Well>
            {ASR.map((a) => {
              const on = prayerMethod.asr === a.id;
              return (
                <Row
                  key={a.id}
                  height={60}
                  onPress={() => setPrayerMethod({ ...prayerMethod, asr: a.id })}
                  accessibilityLabel={`${a.label} Asr${on ? ', selected' : ''}`}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label} maxFontSizeMultiplier={CLAMP}>{a.label}</Text>
                    <Text style={styles.meta} maxFontSizeMultiplier={CLAMP}>{a.meta}</Text>
                  </View>
                  {on && <Icon name="check" size={20} color={colors.accent} />}
                </Row>
              );
            })}
          </Well>
        </View>

        <View style={styles.group}>
          <GoldHead label="Calculation method" />
          <Well>
            {METHODS.map((m) => {
              const on = prayerMethod.method === m.id;
              return (
                <Row
                  key={m.id}
                  height={64}
                  onPress={() => setPrayerMethod({ ...prayerMethod, method: m.id })}
                  accessibilityLabel={`${m.label}${on ? ', selected' : ''}`}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label} maxFontSizeMultiplier={CLAMP}>{m.label}</Text>
                    <Text style={styles.meta} maxFontSizeMultiplier={CLAMP}>{m.where}</Text>
                  </View>
                  {on && <Icon name="check" size={20} color={colors.accent} />}
                </Row>
              );
            })}
          </Well>
          <Text style={styles.note}>
            Use the method your local mosque follows. Times and the adhan update straight away.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: more.ground },
  scroll: { paddingHorizontal: GUTTER, paddingTop: 20, gap: 26 },
  group: { gap: 12 },
  label: { fontFamily: fonts.semibold, fontSize: SIZE.title, color: more.ink },
  meta: { fontFamily: fonts.regular, fontSize: SIZE.caption, color: more.meta, marginTop: 3 },
  note: { fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: bodyLeading(SIZE.caption), color: more.meta },
});
