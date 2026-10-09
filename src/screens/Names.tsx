import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Platform, ListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import { colors } from '../theme/colors';
import { fonts, ARABIC_LINE_HEIGHT } from '../theme/type';
import { getAllahNames, type AllahName } from '../data/db';

const DEFAULT_TASBIH_TARGET = 33;

const ARABIC_SIZE = 23;
const ROW_MIN_HEIGHT = 74;

const NameRow = React.memo(function NameRow({
  item,
  index,
  onPress,
}: {
  item: AllahName;
  index: number;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.index}>{index + 1}</Text>
      <View style={styles.textCol}>
        <Text style={styles.translit} numberOfLines={1}>
          {item.nameEn}
        </Text>
        <Text style={styles.meaning} numberOfLines={2}>
          {item.meaningEn}
        </Text>
      </View>
      <Text style={styles.arabic} numberOfLines={2}>
        {item.nameAr}
      </Text>
    </Pressable>
  );
});

export default function Names({ navigation }: any) {
  const NAMES = getAllahNames();

  const openTasbih = useCallback(() => {
    navigation.navigate('Tasbih', { dhikrIdx: 4, target: DEFAULT_TASBIH_TARGET });
  }, [navigation]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<AllahName>) => (
      <NameRow item={item} index={index} onPress={openTasbih} />
    ),
    [openTasbih]
  );

  const keyExtractor = useCallback((n: AllahName) => String(n.id), []);

  const header = useMemo(
    () => (
      <View style={{ gap: 14, paddingBottom: 14 }}>
        <Header title="" onBack={() => navigation.goBack()} />
        <View>
          <Text style={styles.title}>99 Names</Text>
          <Text style={styles.meta}>Each name and its meaning</Text>
        </View>
      </View>
    ),
    [navigation]
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <FlatList
        data={NAMES}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={header}
        contentContainerStyle={styles.content}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
      />
      <BottomNav active="Library" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  content: { paddingHorizontal: 20, paddingBottom: 28 },
  title: { fontFamily: fonts.extrabold, fontSize: 24, color: colors.textPrimary },
  meta: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted, marginTop: 4 },
  row: {
    minHeight: ROW_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  index: { width: 20, fontFamily: fonts.semibold, fontSize: 11, color: colors.textFaint },
  textCol: { flex: 1, flexShrink: 1, minWidth: 0 },
  translit: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.textPrimary },
  meaning: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textSecondary, marginTop: 2 },
  arabic: {
    flexShrink: 0,
    maxWidth: '52%',
    fontFamily: fonts.arabic,
    fontSize: ARABIC_SIZE,
    lineHeight: ARABIC_SIZE * ARABIC_LINE_HEIGHT,
    color: colors.textPrimary,
    textAlign: 'right',
    includeFontPadding: false,
  },
});
