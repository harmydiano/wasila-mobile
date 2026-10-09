import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import Sheet from '../../components/Sheet';
import { colors } from '../../theme/v2/colors';
import { fonts } from '../../theme/type';
import { CATS } from '../../data/content';
import { statsFor } from '../../utils/seed';
import { useAppState } from '../../state/AppState';
import { useUiVersionOptional } from '../../state/UiVersion';

export default function Category({ route, navigation }: any) {
  const { catId } = route.params;
  const cat = CATS.find((c) => c.id === catId) || CATS[0];
  const [infoOpen, setInfoOpen] = useState(false);
  const { premium, openPaywall } = useAppState();
  const uiVersion = useUiVersionOptional();

  const free = cat.duas[0];
  const locked = cat.duas.slice(1);
  const freeStats = statsFor(`${cat.id}:0`);
  const lockedCount = cat.total - 1;

  const goPaywall = (benefitTitle?: string) =>
    uiVersion === 'v3'
      ? navigation.navigate('Plus', { benefitTitle, categoryLabel: cat.title })
      : openPaywall();

  const openDua = (idx: number) => {
    const d = cat.duas[idx];
    if (!d.free && !premium) {
      goPaywall(d.t);
      return;
    }
    navigation.navigate('DuaDetail', { catId: cat.id, duaIdx: idx });
  };

  return (
    <Screen nav="Library" contentStyle={{ paddingHorizontal: 20, gap: 18 }}>
      <Header title="" onBack={() => navigation.goBack()} />
      <View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{cat.title}</Text>
          <Pressable
            onPress={() => setInfoOpen(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`About ${cat.title}`}
          >
            <Icon name="info" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
        <Text style={styles.sub}>{cat.sub}</Text>
      </View>

      <Pressable style={styles.freeCard} onPress={() => openDua(0)}>
        <View style={styles.freeTop}>
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>FREE</Text>
          </View>
          <Text style={styles.freeArabic}>{free.n}</Text>
        </View>
        <Text style={styles.freeTitle}>{free.t}</Text>
        <Text style={styles.freeSummary}>{free.tr} · {free.m}</Text>
        <View style={styles.ratingRow}>
          <Icon name="star" size={15} color={colors.gold} />
          <Text style={styles.ratingText}>{freeStats.rating} · {freeStats.helpful} found this helpful</Text>
        </View>
        <View style={styles.chipRow}>
          <View style={styles.attrChip}>
            <Icon name="repeat" size={13} color={colors.accent} />
            <Text style={styles.attrChipText}>{free.c}</Text>
          </View>
          <View style={styles.attrChip}>
            <Icon name="schedule" size={13} color={colors.accent} />
            <Text style={styles.attrChipText}>{free.tm}</Text>
          </View>
          <View style={styles.attrChip}>
            <Icon name="event" size={13} color={colors.accent} />
            <Text style={styles.attrChipText}>{free.d}</Text>
          </View>
        </View>
      </Pressable>

      <View style={{ gap: 10 }}>
        <Text style={styles.lockedEyebrow}>More in this category</Text>
        {locked.map((d, i) => (
          <Pressable key={d.t} style={styles.lockedRow} onPress={() => openDua(i + 1)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.lockedTitle}>{d.t}</Text>
              <Text style={styles.lockedCaption}>{d.tr} · {d.m}</Text>
            </View>
            <View style={styles.lockCircle}>
              <Icon name="lock" size={13} color={colors.textFaint} />
            </View>
          </Pressable>
        ))}
      </View>

      <Button label={`Unlock ${lockedCount} more benefits`} onPress={() => goPaywall(`All of ${cat.title}`)} />

      <Sheet visible={infoOpen} onClose={() => setInfoOpen(false)}>
        <Text style={styles.sheetTitle}>About {cat.title}</Text>
        <Text style={styles.sheetBody}>
          Benefits in this category are grouped by the need they address. The grouping is Wasīla’s own categorisation, not a claim from a source text.
        </Text>
        <Text style={[styles.sheetBody, { marginTop: 10 }]}>
          Each entry names where it comes from — Qur’an, hadith, or the practice of later scholars — on its own screen, with the wording of the invocation and the recommended time.
        </Text>
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>No outcome is guaranteed. These are supplications, offered in hope, not transactions.</Text>
        </View>
        <View style={{ marginTop: 16 }}>
          <Button label="Close" variant="outline" onPress={() => setInfoOpen(false)} />
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontFamily: fonts.serif, fontSize: 25, color: colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textMuted, marginTop: 6 },
  freeCard: { padding: 18, borderRadius: 20, backgroundColor: colors.bgFreeHighlight, borderWidth: 1, borderColor: colors.freeCardBorder, gap: 8 },
  freeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  freeBadge: { backgroundColor: colors.accent, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  freeBadgeText: { fontFamily: fonts.bold, fontSize: 11, color: '#0A2C24' },
  freeArabic: { fontFamily: fonts.arabic, fontSize: 26, color: colors.accent, opacity: 0.5 },
  freeTitle: { fontFamily: fonts.bold, fontSize: 15.5, color: colors.textPrimary },
  freeSummary: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  attrChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.bgCard, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 11 },
  attrChipText: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.textSecondary },
  lockedEyebrow: { fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textMuted },
  lockedRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: colors.bgCardMuted, borderRadius: 16, borderWidth: 1, borderColor: colors.divider },
  lockedTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.textPrimary },
  lockedCaption: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.textFaint, marginTop: 2 },
  lockCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.divider, alignItems: 'center', justifyContent: 'center' },
  sheetTitle: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.textPrimary, marginBottom: 10 },
  sheetBody: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 20, color: colors.textSecondary },
  disclaimer: { marginTop: 14, backgroundColor: colors.amberCardBg, borderRadius: 14, padding: 14 },
  disclaimerText: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18, color: colors.amberBody },
});
