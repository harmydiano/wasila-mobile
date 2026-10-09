import React, { useMemo } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import Sheet from './Sheet';
import Icon from './Icon';
import { useTheme, type Palette } from '../theme/theme';
import { fonts } from '../theme/type';
import { RECITERS } from '../data/reciters';

export default function ReciterPickerSheet({
  visible,
  onClose,
  value,
  onChange,
}: {
  visible: boolean;
  onClose: () => void;
  value: string;
  onChange: (id: string) => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>Reciter</Text>
      {RECITERS.map((r) => (
        <Pressable
          key={r.id}
          style={styles.row}
          onPress={() => {
            onChange(r.id);
            onClose();
          }}
        >
          <Text style={[styles.name, r.id === value && styles.nameOn]}>{r.name}</Text>
          {r.id === value && <Icon name="check" size={18} color={colors.accent} />}
        </Pressable>
      ))}
    </Sheet>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    title: { fontFamily: fonts.bold, fontSize: 15, color: colors.textPrimary, marginBottom: 12 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 13,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    name: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
    nameOn: { fontFamily: fonts.semibold, color: colors.textPrimary },
  });
