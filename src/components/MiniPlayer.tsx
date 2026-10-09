import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import { useTheme, type Palette } from '../theme/theme';
import { fonts } from '../theme/type';
import { useQuranAudio } from '../state/QuranAudio';
import { useBottomBarHeight } from '../state/bottomBar';
import { getReciterName } from '../data/reciters';
import { navigationRef } from '../navigation/navigationRef';

export default function MiniPlayer({ hidden = false }: { hidden?: boolean }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const barHeight = useBottomBarHeight();
  const { now, playing, toggle, next, previous, stop } = useQuranAudio();

  if (!now || hidden) return null;

  const title = now.verseId == null ? `${now.suraName}, Bismillah` : `${now.suraName}, Aya ${now.verseId}`;

  const openSura = () => {
    if (navigationRef.isReady()) navigationRef.navigate('Sura', { n: now.suraId });
  };

  return (
    <View
      style={[styles.wrap, { bottom: barHeight > 0 ? barHeight + 6 : Math.max(insets.bottom, 12) + 6 }]}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        <Pressable onPress={toggle} hitSlop={6} style={styles.playBtn}>
          <Icon name={playing ? 'pause' : 'play_arrow'} size={20} color={colors.onMintTextAlt} />
        </Pressable>

        <Pressable style={styles.textCol} onPress={openSura}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {getReciterName(now.reciter)}
          </Text>
        </Pressable>

        <Pressable onPress={previous} hitSlop={6} style={styles.stepBtn}>
          <Icon name="skip_previous" size={20} color={colors.textSecondary} />
        </Pressable>
        <Pressable onPress={next} hitSlop={6} style={styles.stepBtn}>
          <Icon name="skip_next" size={20} color={colors.textSecondary} />
        </Pressable>
        <Pressable onPress={stop} hitSlop={6} style={styles.stepBtn}>
          <Icon name="close" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    wrap: { position: 'absolute', left: 12, right: 12 },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      overflow: 'hidden',
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.outlineBorder,
      backgroundColor: colors.bgSheet,
      paddingVertical: 8,
      paddingHorizontal: 10,
      shadowColor: '#010907',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 18,
      elevation: 10,
    },
    playBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.mint,
    },
    textCol: { flex: 1, minWidth: 0 },
    title: { fontFamily: fonts.bold, fontSize: 13, color: colors.textPrimary },
    sub: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 1 },
    stepBtn: { width: 30, height: 34, alignItems: 'center', justifyContent: 'center' },
  });
