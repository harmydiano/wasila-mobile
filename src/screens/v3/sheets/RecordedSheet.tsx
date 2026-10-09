import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Sheet from '../../../components/Sheet';
import Icon from '../../../components/Icon';
import { fonts, serifHeading, SIZE } from '../../../theme/type';
import { colors, v3 } from '../../../theme/v3/colors';
import { useAppState } from '../../../state/AppState';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function RecordedSheet({
  visible,
  onClose,
  title,
  timing,
  streak,
  longest,
  onUndo,
  onWriteReflection,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  timing: string;
  streak: number;
  longest: number;
  onUndo: () => void;
  onWriteReflection?: () => void;
}) {
  const { reminders, toggleReminder } = useAppState();
  const reminderKey = timing;
  const reminderOn = !!reminders[reminderKey];
  const today = DAYS[new Date().getDay()];

  return (
    <Sheet visible={visible} onClose={onClose} bg={colors.bgCardAlt} scroll={false}>
      <View style={styles.head}>
        <View style={styles.tick}>
          <Icon name="check" size={28} color={colors.onMintText} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Recorded for today</Text>
          <Text style={styles.sub} numberOfLines={2}>
            {`${today}, ${timing.toLowerCase()}`}
          </Text>
        </View>
      </View>

      <View style={styles.streak}>
        <Icon name="local_fire_department" size={24} color={colors.gold} />
        <View style={{ flex: 1 }}>
          <Text style={styles.streakTitle}>
            {streak === 1 ? 'First day' : `${streak} days in a row`}
          </Text>
          <Text style={styles.streakSub}>
            {longest > streak
              ? `Your longest run on this benefit is ${longest}`
              : 'This is your longest run on this benefit'}
          </Text>
        </View>
      </View>

      <View style={styles.rows}>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: reminderOn }}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={() => toggleReminder(reminderKey)}
        >
          <Icon name="notifications" size={20} color={colors.accent} />
          <Text style={styles.rowLabel} numberOfLines={2}>
            {`Remind me tomorrow ${timing.toLowerCase()}`}
          </Text>
          <View style={[styles.track, reminderOn && styles.trackOn]}>
            <View style={[styles.knob, reminderOn && styles.knobOn]} />
          </View>
        </Pressable>

        {onWriteReflection && (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={onWriteReflection}
          >
            <Icon name="edit_note" size={20} color={colors.textMuted} />
            <Text style={styles.rowLabel}>Write a reflection</Text>
            <Icon name="chevron_right" size={19} color={v3.ink4} />
          </Pressable>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Undo recording ${title}`}
          style={({ pressed }) => [styles.undo, pressed && styles.pressed]}
          onPress={onUndo}
        >
          <Text style={styles.undoText}>Undo</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.done, pressed && styles.pressed]}
          onPress={onClose}
        >
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tick: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  title: { ...serifHeading(SIZE.cardTitle), color: colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 17, color: colors.textMuted, marginTop: 3 },

  streak: {
    flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 18,
    backgroundColor: colors.amberCardBg, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 17,
  },
  streakTitle: { fontFamily: fonts.extrabold, fontSize: SIZE.title, color: colors.textPrimary },
  streakSub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 17, color: colors.amberCardText, marginTop: 3 },

  rows: { gap: 9, marginTop: 18 },
  row: {
    minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: v3.surfaceCard, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 16,
  },
  rowLabel: { flex: 1, fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: 19, color: colors.textPrimary },
  track: { width: 44, height: 26, borderRadius: 999, backgroundColor: colors.divider, padding: 3, justifyContent: 'center', flexShrink: 0 },
  trackOn: { backgroundColor: colors.accent },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.textDisabled },
  knobOn: { backgroundColor: colors.textPrimary, alignSelf: 'flex-end' },

  actions: { flexDirection: 'row', gap: 10, marginTop: 18, marginBottom: 8 },
  undo: {
    flex: 1, minHeight: 48, borderRadius: 999, borderWidth: 1, borderColor: colors.divider,
    alignItems: 'center', justifyContent: 'center',
  },
  undoText: { fontFamily: fonts.extrabold, fontSize: SIZE.body, color: colors.textSecondary },
  done: { flex: 1, minHeight: 48, borderRadius: 999, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  doneText: { fontFamily: fonts.extrabold, fontSize: SIZE.body, color: colors.onMintText },

  pressed: { opacity: 0.9 },
});
