import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import Icon from './Icon';
import Button from './Button';
import { colors } from '../theme/colors';
import { fonts } from '../theme/type';
import { useAppState } from '../state/AppState';

export default function WelcomeGiftModal() {
  const { giftVisible, closeGift, setPremium } = useAppState();

  return (
    <Modal visible={giftVisible} transparent animationType="fade" onRequestClose={closeGift}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Icon name="redeem" size={26} color={colors.gold} />
          </View>
          <Text style={styles.title}>A gift to start with</Text>
          <Text style={styles.body}>
            The full corpus, your personal zikr and offline access are open for the next 72 hours. Nothing to pay, nothing to cancel.
          </Text>
          <View style={styles.pill}>
            <Icon name="schedule" size={14} color={colors.gold} />
            <Text style={styles.pillText}>71:58:04 remaining</Text>
          </View>
          <View style={{ width: '100%', gap: 10, marginTop: 8 }}>
            <Button
              label="Open everything"
              variant="gold"
              onPress={() => {
                setPremium(true);
                closeGift();
              }}
            />
            <Pressable onPress={closeGift}>
              <Text style={styles.later}>Maybe later</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(2,10,8,0.72)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', backgroundColor: colors.bgCard, borderRadius: 24, padding: 26, alignItems: 'center', gap: 10 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.amberCardBg, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.textPrimary, textAlign: 'center' },
  body: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textMuted, textAlign: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.amberCardBg, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14, marginTop: 4 },
  pillText: { fontFamily: fonts.bold, fontSize: 12, color: colors.gold },
  later: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
