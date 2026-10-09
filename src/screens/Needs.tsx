import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Chip from '../components/Chip';
import { colors } from '../theme/colors';
import { fonts } from '../theme/type';
import { NEEDS } from '../data/content';
import { useAppState } from '../state/AppState';

export default function Needs({ navigation }: any) {
  const { needs, toggleNeed } = useAppState();
  const chosen = NEEDS.filter((n) => needs[n]).length;

  return (
    <Screen contentStyle={{ paddingHorizontal: 20, gap: 16 }}>
      <Header title="What matters most" onBack={() => navigation.goBack()} />

      <View>
        <Text style={styles.title}>What do you need most right now?</Text>
        <Text style={styles.sub}>
          Nothing is locked to your choice — it only sets the order things appear in on the home screen. Change it
          whenever you like.
        </Text>
      </View>

      <Text style={styles.eyebrow}>{chosen > 0 ? `${chosen} selected` : 'Choose any that apply'}</Text>

      <View style={styles.chipWrap}>
        {NEEDS.map((n) => (
          <Chip key={n} label={n} active={!!needs[n]} onPress={() => toggleNeed(n)} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.extrabold, fontSize: 22, color: colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textMuted, marginTop: 6 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.textMuted },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
});
