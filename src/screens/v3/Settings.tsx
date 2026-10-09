import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, AppState as RNAppState } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import ReciterPickerSheet from '../../components/ReciterPickerSheet';
import AdhanHelpSheet from './sheets/AdhanHelpSheet';
import { Stagger, useStagger } from '../../components/v3/Stagger';
import { Chevron, GoldHead, GUTTER, LiveDot, Row, ScrollFade, Toggle, TitleBlock, Well } from '../../components/v3/more/parts';
import { fonts, arabicText, SIZE, CLAMP, bodyLeading } from '../../theme/type';
import { more } from '../../theme/v3/colors';
import { CATS } from '../../data/content';
import { getSelectedNeedCat } from '../../data/prefs';
import { getReciterName } from '../../data/reciters';
import { methodOf } from '../../data/prayerMethods';
import { useAppState } from '../../state/AppState';
import { getAdhanDiagnostics, sendTestAdhan, type AdhanDiagnostics } from '../../data/notifications';
import { openAppSettings, needsBackgroundGrant } from '../../data/backgroundPermission';

const ARABIC_MIN = 24;
const ARABIC_MAX = 44;

export default function Settings({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const {
    arabicSize,
    setArabicSize,
    practice,
    adhanEnabled,
    setAdhanEnabled,
    reciter,
    setReciter,
    benefitText,
    setBenefitText,
    prayerMethod,
  } = useAppState();
  const [reciterSheetOpen, setReciterSheetOpen] = useState(false);
  const [pickedNeed, setPickedNeed] = useState<string | null>(null);
  useEffect(() => navigation.addListener('focus', () => {
    getSelectedNeedCat().then(setPickedNeed).catch(() => {});
  }), [navigation]);
  const needTitle = CATS.find((c) => c.id === (practice?.catId ?? pickedNeed))?.title ?? null;
  const anim = useStagger(5);

  const [diag, setDiag] = useState<AdhanDiagnostics | null>(null);
  const refreshDiag = useCallback(() => {
    if (!adhanEnabled) return setDiag(null);
    getAdhanDiagnostics().then(setDiag).catch(() => setDiag(null));
  }, [adhanEnabled]);

  useEffect(() => {
    refreshDiag();
    const sub = RNAppState.addEventListener('change', (s) => {
      if (s === 'active') refreshDiag();
    });
    return () => sub.remove();
  }, [refreshDiag]);

  const adhanHealthy =
    !!diag && diag.permitted && !diag.channelSilenced && diag.channelHasAdhan && diag.pending > 0;
  const adhanStatus = !diag
    ? ''
    : !diag.permitted
      ? 'Notifications are turned off for Wasīla'
      : diag.channelSilenced
        ? 'The prayer channel is muted in system settings'
        : !diag.channelHasAdhan
          ? 'Prayer alerts will use the default tone, not the adhan'
          : diag.pending === 0
            ? 'Nothing scheduled yet — open the dashboard once'
            : diag.nextAt
              ? `Next ${diag.nextAt.toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })} · ${diag.pending} scheduled`
              : `${diag.pending} scheduled`;

  const [helpOpen, setHelpOpen] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const onTestAdhan = useCallback(() => {
    setTestSent(true);
    sendTestAdhan()
      .then(refreshDiag)
      .catch(() => {})
      .finally(() => setTimeout(() => setTestSent(false), 6000));
  }, [refreshDiag]);

  const onFix = useCallback(() => {
    if (diag && !diag.permitted) {
      openAppSettings();
      return;
    }
    setHelpOpen(true);
  }, [diag]);

  const stepArabic = (delta: number) =>
    setArabicSize(Math.min(ARABIC_MAX, Math.max(ARABIC_MIN, arabicSize + delta)));

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <Stagger v={anim[0]}>
        <TitleBlock title="Settings" onBack={() => navigation.goBack()} />
      </Stagger>

      <View style={styles.scrollWrap}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
          <Stagger v={anim[2]} style={styles.group}>
            <GoldHead label="Prayer" />
            <Well>
              <View>
                <Row height={64} onPress={() => setAdhanEnabled(!adhanEnabled)} accessibilityLabel="Adhan notification">
                  <Icon name="volume_up" size={20} color={more.ink3} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Adhan notification</Text>
                    <Text style={styles.meta}>The call to prayer, at each prayer time</Text>
                  </View>
                  <Toggle on={adhanEnabled} />
                </Row>

                {adhanEnabled && !!diag && (
                  <View
                    style={styles.diag}
                    accessibilityLiveRegion="polite"
                    accessibilityRole="summary"
                  >
                    <View style={styles.diagRow}>
                      {adhanHealthy ? <LiveDot /> : <Icon name="error" size={15} color={more.gold} />}
                      <Text style={[styles.diagText, !adhanHealthy && styles.diagWarn]}>
                        {adhanStatus}
                      </Text>
                    </View>
                    {adhanHealthy ? (
                      <DiagButton
                        label={testSent ? 'Playing…' : 'Test'}
                        glyph="volume_up"
                        onPress={testSent ? undefined : onTestAdhan}
                      />
                    ) : (
                      <DiagButton label="Fix" glyph="arrow_forward" onPress={onFix} tone="gold" />
                    )}
                  </View>
                )}
              </View>

              {adhanEnabled && needsBackgroundGrant && (
                <Row
                  height={56}
                  onPress={() => setHelpOpen(true)}
                  accessibilityLabel="If the adhan doesn't sound"
                >
                  <Icon name="help_outline" size={20} color={more.ink3} />
                  <Text style={styles.rowLabel}>If the adhan doesn't sound</Text>
                  <Chevron />
                </Row>
              )}

              <Row height={56} onPress={() => navigation.navigate('PrayerMethod')} accessibilityLabel="Calculation method">
                <Icon name="public" size={20} color={more.ink3} />
                <Text style={styles.rowLabel}>Calculation method</Text>
                <Text style={styles.value} numberOfLines={1}>
                  {`${methodOf(prayerMethod.method).short}${prayerMethod.asr === 'hanafi' ? ' · Hanafi' : ''}`}
                </Text>
                <Chevron />
              </Row>
            </Well>
          </Stagger>

          <Stagger v={anim[3]} style={styles.group}>
            <GoldHead label="Reading" />
            <Well>
              <Row
                height={56}
                onPress={() => setBenefitText({ showTranslit: !benefitText.showTranslit })}
                accessibilityLabel="Transliteration"
              >
                <Icon name="translate" size={20} color={more.ink3} />
                <Text style={styles.rowLabel}>Transliteration</Text>
                <Toggle on={benefitText.showTranslit} />
              </Row>

              <Row height={56}>
                <Icon name="format_size" size={20} color={more.ink3} />
                <Text style={styles.rowLabel}>Arabic size</Text>
                <Text style={styles.specimen} maxFontSizeMultiplier={1}>
                  بِسْمِ
                </Text>
                <Text style={styles.value}>{arabicSize}px</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Smaller Arabic"
                  hitSlop={8}
                  disabled={arabicSize <= ARABIC_MIN}
                  onPress={() => stepArabic(-2)}
                  style={styles.stepper}
                >
                  <Icon name="remove" size={16} color={arabicSize <= ARABIC_MIN ? more.disabled : more.ink2} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Larger Arabic"
                  hitSlop={8}
                  disabled={arabicSize >= ARABIC_MAX}
                  onPress={() => stepArabic(2)}
                  style={styles.stepper}
                >
                  <Icon name="add" size={16} color={arabicSize >= ARABIC_MAX ? more.disabled : more.ink2} />
                </Pressable>
              </Row>

              <Row height={56} onPress={() => setReciterSheetOpen(true)} accessibilityLabel="Reciter">
                <Icon name="graphic_eq" size={20} color={more.ink3} />
                <Text style={styles.rowLabel}>Reciter</Text>
                <Text style={styles.value} numberOfLines={1}>
                  {getReciterName(reciter)}
                </Text>
                <Chevron />
              </Row>
            </Well>
          </Stagger>

          <Stagger v={anim[4]} style={styles.group}>
            <GoldHead label="You" />
            <Well>
              <Row height={56} onPress={() => navigation.navigate('NeedsPicker')} accessibilityLabel="What you need">
                <Icon name="tune" size={20} color={more.ink3} />
                <Text style={styles.rowLabel}>What you need</Text>
                <Text style={styles.value} numberOfLines={1}>{needTitle ?? 'Not set'}</Text>
                <Chevron />
              </Row>
              <Row
                height={56}
                onPress={() => navigation.navigate('ManageDownloads')}
                accessibilityLabel="Offline audio"
              >
                <Icon name="download" size={20} color={more.ink3} />
                <Text style={styles.rowLabel}>Offline audio</Text>
                <Text style={styles.value}>Manage</Text>
                <Chevron />
              </Row>
            </Well>
          </Stagger>
        </ScrollView>
        <ScrollFade />
      </View>

      <AdhanHelpSheet
        visible={helpOpen}
        onClose={() => setHelpOpen(false)}
        onTest={onTestAdhan}
        testSent={testSent}
        permitted={diag?.permitted !== false}
      />

      <ReciterPickerSheet
        visible={reciterSheetOpen}
        onClose={() => setReciterSheetOpen(false)}
        value={reciter}
        onChange={setReciter}
      />
    </SafeAreaView>
  );
}

function DiagButton({
  label,
  glyph,
  onPress,
  tone = 'mint',
}: {
  label: string;
  glyph: string;
  onPress?: () => void;
  tone?: 'mint' | 'gold';
}) {
  const ink = tone === 'gold' ? more.gold : more.mint;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !onPress }}
      hitSlop={8}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.diagBtn,
        { borderColor: onPress ? ink : more.hairline },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.diagBtnText, { color: onPress ? ink : more.disabled }]} maxFontSizeMultiplier={CLAMP}>
        {label}
      </Text>
      <Icon name={glyph} size={15} color={onPress ? ink : more.disabled} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: more.ground },
  scrollWrap: { flex: 1, position: 'relative' },
  scroll: { paddingHorizontal: GUTTER, paddingTop: 20, paddingBottom: 44, gap: 26 },
  group: { gap: 12 },

  label: { fontFamily: fonts.semibold, fontSize: SIZE.title, color: more.ink },
  rowLabel: { flex: 1, fontFamily: fonts.semibold, fontSize: SIZE.title, color: more.ink },
  meta: { fontFamily: fonts.regular, fontSize: SIZE.caption, color: more.meta, marginTop: 3 },
  value: { fontFamily: fonts.regular, fontSize: SIZE.meta, color: more.meta, maxWidth: 150 },
  specimen: { ...arabicText(18), color: more.gold },
  stepper: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: more.pillBorder,
  },

  diag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 32,
    paddingBottom: 14,
  },
  diagRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  diagText: { flex: 1, fontFamily: fonts.semibold, fontSize: SIZE.meta, color: more.mint },
  diagWarn: { color: more.gold },
  diagBtn: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  diagBtnText: { fontFamily: fonts.bold, fontSize: SIZE.meta },

  pressed: { opacity: 0.85 },
});
