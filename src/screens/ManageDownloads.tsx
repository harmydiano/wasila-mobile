import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Icon from '../components/Icon';
import { useTheme, type Palette } from '../theme/theme';
import { fonts } from '../theme/type';
import { getSuraNames } from '../data/db';
import { getReciterName } from '../data/reciters';
import { listDownloads, deleteSuraDownload, type DownloadedEntry } from '../data/audioDownloads';

export default function ManageDownloads({ navigation }: any) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [entries, setEntries] = useState<DownloadedEntry[]>(() => listDownloads());
  const suras = useMemo(() => getSuraNames(), []);

  const refresh = () => setEntries(listDownloads());
  const totalBytes = entries.reduce((sum, e) => sum + e.bytes, 0);

  return (
    <Screen contentStyle={{ paddingHorizontal: 20, gap: 16 }}>
      <Header title="Manage downloads" onBack={() => navigation.goBack()} />

      {entries.length === 0 ? (
        <Text style={styles.empty}>
          No downloads yet — play a sura to save it for offline listening, or tap the download icon in its player.
        </Text>
      ) : (
        <>
          <Text style={styles.subtitle}>{entries.length} sura{entries.length === 1 ? '' : 's'} · {(totalBytes / (1024 * 1024)).toFixed(1)} MB</Text>
          <View style={styles.card}>
            {entries.map((e, i) => {
              const meta = suras.find((s) => s.suraId === e.suraId);
              return (
                <View key={`${e.reciter}:${e.suraId}`} style={[styles.row, i < entries.length - 1 && styles.rowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{meta?.transliterate ?? `Sura ${e.suraId}`}</Text>
                    <Text style={styles.rowSub}>{getReciterName(e.reciter)} · {(e.bytes / (1024 * 1024)).toFixed(1)} MB</Text>
                  </View>
                  <Pressable
                    hitSlop={8}
                    onPress={() => {
                      deleteSuraDownload(e.reciter, e.suraId);
                      refresh();
                    }}
                  >
                    <Icon name="delete_outline" size={20} color={colors.textMuted} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    empty: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 20, color: colors.textMuted },
    subtitle: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.textMuted },
    card: { backgroundColor: colors.bgCard, borderRadius: 16, paddingHorizontal: 16 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
    rowLabel: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.textPrimary },
    rowSub: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
  });
