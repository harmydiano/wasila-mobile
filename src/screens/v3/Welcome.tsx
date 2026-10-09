import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import WasilaMark from '../../components/v3/WasilaMark';
import WelcomePlate from '../../components/v3/WelcomePlate';
import { Stagger, useStagger } from '../../components/v3/Stagger';
import { fonts, serifHeading, arabicText, SIZE, uiLeading, bodyLeading, eyebrow } from '../../theme/type';
import { colors, v3 } from '../../theme/v3/colors';
import { usePrayer } from '../../state/usePrayer';

export default function Welcome({ navigation }: any) {
  const s = useStagger(6);
  const [locationGranted, setLocationGranted] = useState(false);
  const { refresh } = usePrayer();

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationGranted(status === 'granted');
      if (status === 'granted') refresh();
    } catch {
    }
  };

  return (
    <View style={styles.root}>
      <WelcomePlate />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.centre}>
          <Stagger v={s[0]}>
            <WasilaMark size={112} />
          </Stagger>
          <Stagger v={s[1]}>
            <Text style={styles.arabic}>يَا أَيُّهَا الْمُزَّمِّلُ ۝ قُمِ اللَّيْلَ إِلَّا قَلِيلًا ۝</Text>
          </Stagger>
          <Stagger v={s[2]} style={styles.verseBlock}>
            <Text style={styles.translation}>
              “O you who wraps himself in his garment, stand the night, all but a little.”
            </Text>
            <Text style={styles.citation}>Al-Muzzammil 73:1–2</Text>
          </Stagger>
        </View>

        <View style={styles.footer}>
          <Stagger v={s[3]}>
            <Pressable
              style={({ pressed }) => [styles.permRow, pressed && styles.pressed]}
              onPress={requestLocation}
              disabled={locationGranted}
            >
              <View style={styles.permIconWrap}>
                <Icon
                  name={locationGranted ? 'check_circle' : 'near_me'}
                  size={21}
                  color={locationGranted ? colors.accent : v3.ink1}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.permTitle}>
                  {locationGranted ? 'Location allowed' : 'Allow location once'}
                </Text>
                <Text style={styles.permReason}>
                  Used for prayer times and the qibla direction. Nothing is sent anywhere.
                </Text>
              </View>
            </Pressable>
          </Stagger>

          <Stagger v={s[4]}>
            <Pressable
              style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
              onPress={() => navigation.navigate('NeedsPicker')}
            >
              <Text style={styles.primaryText}>Choose what you need</Text>
            </Pressable>
          </Stagger>

          <Stagger v={s[5]}>
            <Pressable
              style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
              onPress={() => navigation.navigate('SignIn')}
            >
              <Text style={styles.secondaryText}>I already have an account</Text>
            </Pressable>
            <Text style={styles.footnote}>Free plan: one practice at a time. No card, no trial.</Text>
          </Stagger>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  safe: { flex: 1 },

  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, paddingHorizontal: 34 },
  arabic: { ...arabicText(26), color: colors.textPrimary, textAlign: 'center' },
  verseBlock: { alignItems: 'center', gap: 7 },
  translation: {
    ...serifHeading(SIZE.heading, fonts.serifMedium), letterSpacing: 0,
    color: colors.textSecondary, textAlign: 'center',
  },
  citation: eyebrow(v3.ink3),

  footer: { paddingHorizontal: 22, paddingBottom: 30, gap: 14 },
  permRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 15,
    backgroundColor: v3.surfaceRow, borderWidth: 1, borderColor: v3.hairline, borderRadius: 18,
  },
  permIconWrap: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  permTitle: { fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textPrimary },
  permReason: { fontFamily: fonts.semibold, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: v3.ink3, marginTop: 3 },

  primary: {
    minHeight: 52, borderRadius: 999, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryText: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.onMintText },
  secondary: { minHeight: 46, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textSecondary },
  footnote: {
    fontFamily: fonts.semibold, fontSize: SIZE.meta, lineHeight: bodyLeading(SIZE.meta),
    color: v3.ink3, textAlign: 'center',
  },
  pressed: { opacity: 0.9 },
});
