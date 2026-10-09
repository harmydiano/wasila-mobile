import React from 'react';
import { View, Text, StyleSheet, Pressable, Share } from 'react-native';
import Sheet from '../../../components/Sheet';
import Icon from '../../../components/Icon';
import { fonts, serifHeading, tabular, SIZE, bodyLeading } from '../../../theme/type';
import { colors, v3 } from '../../../theme/v3/colors';
import { benefitSocial, disclose, withMyReport } from '../../../utils/social';
import { longestStreakFromDates } from '../../../utils/practice';
import { useAppState } from '../../../state/AppState';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function BeneficialSheet({
  visible,
  onClose,
  benefitKey: key,
  catId,
  duaIdx,
  title,
  line,
  nights,
  onRestart,
}: {
  visible: boolean;
  onClose: () => void;
  benefitKey: string;
  catId: string;
  duaIdx: number;
  title: string;
  line: string;
  nights: number;
  onRestart: () => void;
}) {
  const { benefitReports, reportBeneficial, withdrawReport, practice } = useAppState();
  const answered = benefitReports[key] === 'beneficial';

  const social = React.useMemo(() => benefitSocial(catId, duaIdx), [catId, duaIdx]);
  const total = withMyReport(social.beneficial, answered ? 'beneficial' : null);
  const beneficial = disclose(total, 'people');
  const practising = disclose(social.practising, 'people');

  const mine = practice && practice.catId === catId && practice.duaIdx === duaIdx ? practice : null;
  const longest = mine ? longestStreakFromDates(mine.completedDates) : 0;

  const now = new Date();
  const finishedOn = `${now.getDate()} ${MONTHS[now.getMonth()]}`;

  const onShareRun = () => {
    Share.share({
      message: `I finished ${title} — ${nights} ${nights === 1 ? 'day' : 'days'}, kept in Wasīla.`,
    }).catch(() => {});
  };

  return (
    <Sheet visible={visible} onClose={onClose} bg="#132320" scroll={false}>
      {answered ? (
        <View style={styles.body}>
          <View style={styles.centre}>
            <View style={styles.disc}>
              <Icon name="verified" size={31} color={colors.gold} />
            </View>
            {beneficial.show && beneficial.exact ? (
              <>
                <Text style={styles.bigNumber}>{beneficial.value.toLocaleString()}</Text>
                <Text style={styles.bigCaption}>
                  {'people have marked this benefit beneficial.\nYou are one of them.'}
                </Text>
              </>
            ) : (
              <Text style={styles.bigCaption}>
                {'Your report is counted.\nIt is added to one number and nothing else.'}
              </Text>
            )}
          </View>

          <View style={styles.factCard}>
            {practising.show && (
              <>
                <View style={styles.factRow}>
                  <Icon name="groups" size={19} color={colors.accent} />
                  <Text style={styles.factText}>
                    {`${practising.exact ? practising.value.toLocaleString() : practising.text} are on this practice today.`}
                  </Text>
                </View>
                <View style={styles.factDivider} />
              </>
            )}
            <View style={styles.factRow}>
              <Icon name="local_fire_department" size={19} color={colors.gold} />
              <Text style={styles.factText}>
                {`Your longest run on this benefit is now ${Math.max(longest, 1)} ${
                  Math.max(longest, 1) === 1 ? 'day' : 'days'
                }.`}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
              onPress={onRestart}
            >
              <Text style={styles.primaryText}>Start it again</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share"
              style={({ pressed }) => [styles.roundBtn, pressed && styles.pressed]}
              onPress={onShareRun}
            >
              <Icon name="ios_share" size={21} color={colors.textMuted} />
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.withdraw, pressed && styles.pressed]}
            onPress={() => withdrawReport(key)}
          >
            <Icon name="undo" size={15} color={colors.textDisabled} />
            <Text style={styles.withdrawText}>Withdraw my report</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.body}>
          <View style={styles.centre}>
            <View style={styles.disc}>
              <Icon name="task_alt" size={31} color={colors.gold} />
            </View>
            <Text style={styles.completedTitle}>
              {`You completed all ${nights} ${nights === 1 ? 'day' : 'days'}`}
            </Text>
            <Text style={styles.completedSub}>{`${line} · finished ${finishedOn}`}</Text>
          </View>

          <View style={styles.rule} />

          <Text style={styles.question}>Would you say this benefit was beneficial to you?</Text>

          <View style={styles.answers}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.yes, pressed && styles.pressed]}
              onPress={() => reportBeneficial(key)}
            >
              <Text style={styles.yesText}>Yes, al-ḥamdu lillāh</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.no, pressed && styles.pressed]}
              onPress={onClose}
            >
              <Text style={styles.noText}>Not saying</Text>
            </Pressable>
          </View>

          <View style={styles.privacy}>
            <Icon name="lock" size={16} color={colors.accent} />
            <Text style={styles.privacyText}>
              Your answer is added to one number and nothing else. No name, no note, no profile, and it is never
              shown to another person as yours. Changeable any time from the benefit.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
            onPress={onClose}
          >
            <Text style={styles.skipText}>Skip and just close</Text>
          </Pressable>
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: { paddingBottom: 10, gap: 18 },
  centre: { alignItems: 'center', gap: 12 },
  disc: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.amberCardBg, alignItems: 'center', justifyContent: 'center' },

  completedTitle: { ...serifHeading(SIZE.cardTitle), color: colors.textPrimary, textAlign: 'center' },
  completedSub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 19, color: colors.textMuted, textAlign: 'center' },
  rule: { height: 1, backgroundColor: colors.divider },
  question: { ...serifHeading(SIZE.heading), color: colors.textPrimary, textAlign: 'center' },
  answers: { flexDirection: 'row', gap: 10 },
  yes: { flex: 1, minHeight: 50, borderRadius: 999, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  yesText: { fontFamily: fonts.extrabold, fontSize: SIZE.body, color: colors.amberBtnText, textAlign: 'center' },
  no: {
    flex: 1, minHeight: 50, borderRadius: 999, backgroundColor: colors.bgCardMuted,
    borderWidth: 1, borderColor: colors.divider, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  noText: { fontFamily: fonts.extrabold, fontSize: SIZE.body, color: colors.textSecondary, textAlign: 'center' },
  privacy: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, backgroundColor: v3.surfaceCard, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 14 },
  privacyText: { flex: 1, fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 19, color: colors.textMuted },
  skip: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  skipText: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textDisabled },

  bigNumber: { ...serifHeading(SIZE.display), ...tabular, color: colors.gold },
  bigCaption: { fontFamily: fonts.regular, fontSize: SIZE.title, lineHeight: bodyLeading(SIZE.title), color: colors.textSecondary, textAlign: 'center' },
  factCard: { backgroundColor: v3.surfaceCard, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 17, gap: 12 },
  factRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  factText: { flex: 1, fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 19, color: colors.textSecondary },
  factDivider: { height: 1, backgroundColor: colors.bgCardMuted },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  primary: { flex: 1, minHeight: 50, borderRadius: 999, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontFamily: fonts.extrabold, fontSize: SIZE.body, color: colors.onMintText },
  roundBtn: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: colors.divider, alignItems: 'center', justifyContent: 'center' },
  withdraw: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, minHeight: 44 },
  withdrawText: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textMuted },

  pressed: { opacity: 0.9 },
});
