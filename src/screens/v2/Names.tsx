import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Platform, TextInput, ListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNav from '../../components/BottomNav';
import Header from '../../components/Header';
import Icon from '../../components/Icon';
import GeometricPattern from '../../components/GeometricPattern';
import { colors } from '../../theme/v2/colors';
import { fonts, ARABIC_LINE_HEIGHT } from '../../theme/type';
import { getAllahNames, type AllahName } from '../../data/db';

const NAMES_QUOTE = 'هُوَ ٱللَّهُ ٱلَّذِي لَا إِلَٰهَ إِلَّا هُوَ';

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
      <LinearGradient
        colors={[colors.mint, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.indexBadge}
      >
        <Text style={styles.indexText}>{index + 1}</Text>
      </LinearGradient>
      <View style={styles.textCol}>
        <Text style={styles.translit} numberOfLines={1}>
          {item.nameEn}
        </Text>
        <Text style={styles.meaning} numberOfLines={2}>
          {item.meaningEn}
        </Text>
        <View style={styles.metaChip}>
          <Icon name="repeat" size={11} color={colors.accent} />
          <Text style={styles.metaChipText}>Recite {DEFAULT_TASBIH_TARGET}×</Text>
        </View>
      </View>
      <Text style={styles.arabic} numberOfLines={2}>
        {item.nameAr}
      </Text>
    </Pressable>
  );
});

export default function Names({ navigation }: any) {
  const NAMES = getAllahNames();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAMES;
    return NAMES.filter((n) => n.nameEn.toLowerCase().includes(q) || n.meaningEn.toLowerCase().includes(q));
  }, [NAMES, query]);

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
          <Text style={styles.eyebrow}>Asmā’ al-Ḥusnā</Text>
          <Text style={styles.title}>99 Names</Text>
          <Text style={styles.meta}>Each name and its meaning</Text>
        </View>

        <View style={styles.quoteCard}>
          <GeometricPattern color={colors.mint} opacity={0.1} />
          <Text style={styles.quoteArabic}>{NAMES_QUOTE}</Text>
          <Text style={styles.quoteTranslation}>“He is Allah — there is no god but Him”</Text>
        </View>

        <View style={styles.searchRow}>
          <Icon name="search" size={16} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search a name or meaning"
            placeholderTextColor={colors.textFaint}
            style={styles.searchInput}
          />
          <Text style={styles.searchCount}>{filtered.length}/99</Text>
        </View>
      </View>
    ),
    [navigation, query, filtered.length]
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No names match “{query}”</Text>
          </View>
        }
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
  eyebrow: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.accent },
  title: { fontFamily: fonts.serif, fontSize: 24, color: colors.textPrimary, marginTop: 4 },
  meta: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted, marginTop: 4 },
  quoteCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: colors.bgCardAlt,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  quoteArabic: {
    fontFamily: fonts.amiriBold,
    fontSize: 24,
    lineHeight: 24 * ARABIC_LINE_HEIGHT,
    color: colors.gold,
    textAlign: 'center',
  },
  quoteTranslation: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted, marginTop: 6, textAlign: 'center' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bgCard,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  searchInput: { flex: 1, fontFamily: fonts.semibold, fontSize: 13.5, color: colors.textPrimary, padding: 0 },
  searchCount: { fontFamily: fonts.bold, fontSize: 11, color: colors.textMuted },
  emptyState: { paddingVertical: 32, alignItems: 'center' },
  emptyText: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.textMuted },
  row: {
    minHeight: ROW_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    marginBottom: 10,
  },
  indexBadge: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  indexText: { fontFamily: fonts.bold, fontSize: 11, color: colors.onMintText },
  textCol: { flex: 1, flexShrink: 1, minWidth: 0, gap: 3 },
  translit: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.textPrimary },
  meaning: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textSecondary },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.iconChipBg,
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 7,
    marginTop: 2,
  },
  metaChipText: { fontFamily: fonts.semibold, fontSize: 11, color: colors.textSecondary },
  arabic: {
    flexShrink: 0,
    maxWidth: '52%',
    fontFamily: fonts.arabic,
    fontSize: ARABIC_SIZE,
    lineHeight: ARABIC_SIZE * ARABIC_LINE_HEIGHT,
    color: colors.accent,
    textAlign: 'right',
    includeFontPadding: false,
  },
});
