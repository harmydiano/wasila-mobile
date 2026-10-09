import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Icon from '../components/Icon';
import { colors } from '../theme/colors';
import { fonts } from '../theme/type';
import { CATS } from '../data/content';
import { benefitOfKey } from '../data/benefits';
import { useAppState } from '../state/AppState';

export default function Bookmarks({ navigation }: any) {
  const { saved } = useAppState();

  const savedList = useMemo(() => {
    return Object.keys(saved)
      .filter((k) => saved[k])
      .map((k) => benefitOfKey(k))
      .filter(Boolean) as { catId: string; duaIdx: number; cat: (typeof CATS)[number]; dua: any }[];
  }, [saved]);

  return (
    <Screen nav="Library" contentStyle={{ paddingHorizontal: 20, gap: 16 }}>
      <Header title="" onBack={() => navigation.goBack()} />
      <View>
        <Text style={styles.title}>Saved</Text>
        <Text style={styles.meta}>{savedList.length} {savedList.length === 1 ? 'benefit saved' : 'benefits saved'}</Text>
      </View>

      {savedList.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Icon name="bookmark_border" size={30} color={colors.textDisabled} />
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyBody}>Tap the bookmark on any benefit to keep it here for quick access.</Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {savedList.map((item) => (
            <Pressable
              key={`${item.catId}:${item.duaIdx}`}
              style={styles.row}
              onPress={() => navigation.navigate('DuaDetail', { catId: item.catId, duaIdx: item.duaIdx })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.resultCat}>{item.cat.title}</Text>
                <Text style={styles.resultTitle}>{item.dua.t}</Text>
                <Text style={styles.resultSummary}>{item.dua.tr} · {item.dua.c} · {item.dua.tm}</Text>
              </View>
              <Text style={styles.arabic}>{item.dua.n}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.extrabold, fontSize: 24, color: colors.textPrimary },
  meta: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  emptyWrap: { alignItems: 'center', gap: 8, paddingVertical: 60 },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.textPrimary },
  emptyBody: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bgCard, borderRadius: 16, padding: 14 },
  resultCat: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textFaint },
  resultTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.textPrimary, marginTop: 3 },
  resultSummary: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
  arabic: { fontFamily: fonts.arabic, fontSize: 22, color: colors.accent },
});
