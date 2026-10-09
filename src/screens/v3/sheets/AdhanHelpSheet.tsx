import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Sheet from '../../../components/Sheet';
import Icon from '../../../components/Icon';
import { fonts, serifHeading, SIZE, CLAMP, bodyLeading } from '../../../theme/type';
import { more } from '../../../theme/v3/colors';
import {
  openAppSettings,
  openAutoStartSettings,
  openBatteryExemptionRequest,
} from '../../../data/backgroundPermission';

export default function AdhanHelpSheet({
  visible,
  onClose,
  onTest,
  testSent,
  permitted,
}: {
  visible: boolean;
  onClose: () => void;
  onTest: () => void;
  testSent: boolean;
  permitted: boolean;
}) {
  return (
    <Sheet visible={visible} onClose={onClose} bg={more.raised} scroll>
      <Text style={styles.title}>If the adhan doesn't sound</Text>
      <Text style={styles.intro}>
        Wasīla hands each prayer to your phone ahead of time and the phone plays it. Three things
        can stop that, in this order.
      </Text>

      <View style={styles.steps}>
        {!permitted ? (
          <Step
            n={1}
            title="Let Wasīla send notifications"
            body="The adhan arrives as a notification. Without permission there is nothing for the phone to play."
            action="Allow"
            glyph="notifications"
            onPress={openAppSettings}
          />
        ) : (
          <Step
            n={1}
            title="Check the volume where you are"
            body="The adhan plays on the alarm channel, which has its own volume and ignores silent mode. Play it once and listen."
            action={testSent ? 'Playing…' : 'Play it'}
            glyph="volume_up"
            onPress={testSent ? undefined : onTest}
          />
        )}

        <Step
          n={2}
          title="Let Wasīla run in the background"
          body="Android pauses apps it decides are idle, and a paused app cannot sound an alarm it set earlier. This is the one that matters most."
          action="Allow"
          glyph="battery_std"
          onPress={openBatteryExemptionRequest}
        />

        <Step
          n={3}
          title="Let Wasīla start on its own"
          body="Some phones keep a second switch for apps that wake themselves. If yours has no such screen, this opens Wasīla's settings page instead."
          action="Open"
          glyph="restart_alt"
          onPress={openAutoStartSettings}
        />
      </View>

      <Text style={styles.foot}>
        Each of these opens your phone's own settings. Wasīla cannot change them for you, and it
        only needs asking once.
      </Text>
    </Sheet>
  );
}

function Step({
  n,
  title,
  body,
  action,
  glyph,
  onPress,
}: {
  n: number;
  title: string;
  body: string;
  action: string;
  glyph: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.step}>
      <View style={styles.stepHead}>
        <Text style={styles.stepNum} maxFontSizeMultiplier={1}>
          {n}
        </Text>
        <Text style={styles.stepTitle}>{title}</Text>
      </View>
      <Text style={styles.stepBody}>{body}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${action} — ${title}`}
        accessibilityState={{ disabled: !onPress }}
        disabled={!onPress}
        onPress={onPress}
        style={({ pressed }) => [styles.btn, !onPress && styles.btnOff, pressed && styles.pressed]}
      >
        <Icon name={glyph} size={17} color={onPress ? more.ink : more.disabled} />
        <Text style={[styles.btnText, !onPress && styles.btnTextOff]} maxFontSizeMultiplier={CLAMP}>
          {action}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { ...serifHeading(SIZE.cardTitle), color: more.ink, marginBottom: 8 },
  intro: {
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: bodyLeading(SIZE.body),
    color: more.ink3,
  },

  steps: { marginTop: 18, gap: 10 },
  step: {
    backgroundColor: more.elevated,
    borderRadius: 18,
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: more.liftElevated,
  },
  stepHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepNum: {
    width: 20,
    fontFamily: fonts.serif,
    fontSize: SIZE.title,
    color: more.gold,
  },
  stepTitle: { flex: 1, fontFamily: fonts.bold, fontSize: SIZE.title, color: more.ink },
  stepBody: {
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: bodyLeading(SIZE.body),
    color: more.ink3,
    paddingLeft: 30,
  },
  btn: {
    alignSelf: 'flex-start',
    marginLeft: 30,
    marginTop: 2,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: more.raised,
    borderWidth: 1,
    borderColor: more.pillBorder,
  },
  btnOff: { borderColor: more.hairline },
  btnText: { fontFamily: fonts.bold, fontSize: SIZE.body, color: more.ink },
  btnTextOff: { color: more.disabled },

  foot: {
    marginTop: 16,
    fontFamily: fonts.regular,
    fontSize: SIZE.caption,
    lineHeight: bodyLeading(SIZE.caption),
    color: more.metaQuiet,
  },

  pressed: { opacity: 0.85 },
});
