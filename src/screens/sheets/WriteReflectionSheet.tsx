import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import Sheet from '../../components/Sheet';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { colors } from '../../theme/colors';
import { fonts, SIZE, uiLeading, bodyLeading } from '../../theme/type';
import { useAppState } from '../../state/AppState';

export default function WriteReflectionSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [stars, setStars] = useState(0);
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const { authName } = useAppState();
  const myName = authName || 'Abdullah Yakubu';

  const canSubmit = stars > 0 && text.trim().length > 3;

  const close = () => {
    onClose();
    setTimeout(() => {
      setDone(false);
      setStars(0);
      setText('');
    }, 300);
  };

  if (done) {
    return (
      <Sheet visible={visible} onClose={close} scroll={false} maxHeightPct={50}>
        <View style={styles.doneWrap}>
          <View style={styles.doneCircle}>
            <Icon name="check" size={26} color="#fff" />
          </View>
          <Text style={styles.doneTitle}>Sent for review</Text>
          <Text style={styles.doneBody}>A moderator reads every reflection before it is published. Yours usually appears within a day.</Text>
          <Button label="Done" onPress={close} />
        </View>
      </Sheet>
    );
  }

  return (
    <Sheet visible={visible} onClose={close}>
      <Text style={styles.title}>Your reflection</Text>
      <Text style={styles.body}>Write about your own experience of practising this. It is published under your name once reviewed.</Text>

      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Pressable key={i} onPress={() => setStars(i)} hitSlop={6}>
            <Icon name="star" size={30} color={i <= stars ? colors.gold : colors.outlineBorder} />
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="What changed in your practice, your consistency, your state?"
        placeholderTextColor={colors.textFaint}
        multiline
        value={text}
        onChangeText={setText}
      />

      <View style={styles.postingRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{myName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}</Text>
        </View>
        <Text style={styles.postingText}>
          Posting as <Text style={{ fontFamily: fonts.bold }}>{myName}</Text>
        </Text>
      </View>

      <Button
        label="Submit for review"
        variant={canSubmit ? 'primary' : 'disabled'}
        onPress={() => canSubmit && setDone(true)}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.textPrimary },
  body: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textMuted, marginTop: 6, marginBottom: 16 },
  starRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: { backgroundColor: colors.bgRoot, borderRadius: 14, padding: 14, minHeight: 100, fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: bodyLeading(SIZE.body), color: colors.textPrimary, textAlignVertical: 'top', marginBottom: 16 },
  postingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.iconChipBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bold, fontSize: 11, color: colors.accent },
  postingText: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: colors.textMuted },
  doneWrap: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  doneCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  doneTitle: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.textPrimary },
  doneBody: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textMuted, textAlign: 'center', marginBottom: 12 },
});
