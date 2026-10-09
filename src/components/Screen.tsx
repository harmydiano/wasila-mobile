import React, { useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, type Palette } from '../theme/theme';
import BottomNav from './BottomNav';

export default function Screen({
  children,
  nav,
  scroll = true,
  bg: bgProp,
  contentStyle,
  edges,
}: {
  children: React.ReactNode;
  nav?: string;
  scroll?: boolean;
  bg?: string;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}) {
  const { colors } = useTheme();
  const bg = bgProp ?? colors.bgRoot;
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const Body = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: bg }]} edges={edges || ['top', 'left', 'right']}>
      <Body
        style={scroll ? { flex: 1 } : styles.flexOne}
        contentContainerStyle={scroll ? [styles.content, contentStyle] : undefined}
      >
        {!scroll ? <View style={[styles.flexOne, contentStyle]}>{children}</View> : children}
      </Body>
      {nav && <BottomNav active={nav} />}
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  root: { flex: 1 },
  flexOne: { flex: 1 },
  content: { paddingBottom: 28 },
});
