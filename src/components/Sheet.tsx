import React, { useMemo } from 'react';
import { Modal, View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, type Palette } from '../theme/theme';

export default function Sheet({
  visible,
  onClose,
  children,
  maxHeightPct = 82,
  bg: bgProp,
  scroll = true,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeightPct?: number;
  bg?: string;
  scroll?: boolean;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bg = bgProp ?? colors.bgCard;
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const Body = scroll ? ScrollView : View;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          { backgroundColor: bg, maxHeight: `${maxHeightPct}%`, paddingBottom: Math.max(insets.bottom, 8) + 8 },
        ]}
      >
        <View style={styles.handle} />
        <Body
          contentContainerStyle={scroll ? { paddingBottom: 28 } : undefined}
          style={{ flexGrow: 0, flexShrink: 1 }}
        >
          {children}
        </Body>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(2,10,8,0.78)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 14,
  },
});
