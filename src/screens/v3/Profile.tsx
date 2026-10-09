import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Platform, Alert } from 'react-native';
import Screen from '../../components/Screen';
import Icon from '../../components/Icon';
import { fonts, serifHeading, tabular, SIZE, uiLeading, bodyLeading, eyebrow } from '../../theme/type';
import { colors } from '../../theme/v3/colors';
import { space, radius } from '../../theme/v3/tokens';
import { useAppState } from '../../state/AppState';
import { CATS } from '../../data/content';
import { corpusTotal, freeCount } from '../../data/benefits';
import { useContentRev } from '../../data/remoteBenefits';

const SUBSCRIPTIONS_URL =
  Platform.OS === 'ios' ? 'https://apps.apple.com/account/subscriptions' : 'https://play.google.com/store/account/subscriptions';

export default function Profile({ navigation }: any) {
  const { signedIn, authName, authEmail, premium, signOut, deleteAccount, practice } = useAppState();

  const confirmDelete = () =>
    Alert.alert(
      'Delete your account?',
      'Your account and sign-in are removed for good. Your practice and counts stay on this phone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const ok = await deleteAccount();
            if (!ok) Alert.alert('Not deleted', 'Wasīla could not reach the server. Try again when you are online.');
          },
        },
      ]
    );
  useContentRev();
  const total = corpusTotal();
  const freeTotal = CATS.reduce((n, c) => n + freeCount(c), 0);
  const nightsKept = practice?.completedDates.length ?? 0;
  const running = practice ? 1 : 0;

  return (
    <Screen nav="Profile" contentStyle={{ paddingHorizontal: space.lg, paddingTop: space.xs, gap: space.md }}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('Settings')} hitSlop={8}>
          <Icon name="cog-outline" set="community" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.identityRow}>
        <View style={styles.avatar}>
          {signedIn ? (
            <Text style={styles.avatarText}>{(authName || authEmail || 'A').charAt(0).toUpperCase()}</Text>
          ) : (
            <Icon name="account-outline" set="community" size={26} color={colors.accent} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{signedIn ? (authName || authEmail) : 'Guest'}</Text>
          {signedIn && premium ? (
            <View style={styles.planRow}>
              <Icon name="star-four-points" set="community" size={13} color={colors.gold} />
              <Text style={styles.planText}>Wasīla Plus</Text>
            </View>
          ) : (
            <Text style={styles.planText}>Free plan</Text>
          )}
        </View>
      </View>

      {!signedIn && (
        <Pressable style={styles.card} onPress={() => navigation.navigate('SignUpSheet')}>
          <View style={styles.row}>
            <Icon name="login" set="community" size={18} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Log in / Sign up</Text>
              <Text style={styles.rowSub}>Needed to subscribe to Wasīla Plus.</Text>
            </View>
          </View>
        </Pressable>
      )}

      <View style={{ gap: space.xs }}>
        <Text style={styles.sectionTitle}>Your journey</Text>
        <View style={styles.card}>
          <View style={styles.statRow}>
            <View style={styles.statTile}>
              <Text style={styles.statValue}>{nightsKept}</Text>
              <Text style={styles.statLabel}>Days kept</Text>
            </View>
            <View style={styles.statTile}>
              <Text style={styles.statValue}>{running}</Text>
              <Text style={styles.statLabel}>Running now</Text>
            </View>
          </View>
          <Text style={styles.caveat}>Stored on this phone. Uninstall the app and the count goes with it.</Text>
        </View>
      </View>

      {signedIn && premium ? (
        <View style={styles.card}>
          <View style={styles.row}>
            <Icon name="lock-open-variant-outline" set="community" size={18} color={colors.accent} />
            <Text style={styles.rowLabel}>{`All ${total} benefits unlocked`}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.plusBlock}>
          <View style={styles.row}>
            <Icon name="auto-fix" set="community" size={18} color={colors.gold} />
            <Text style={styles.rowLabel}>{`${freeTotal} of ${total} benefits unlocked`}</Text>
          </View>
          <Text style={styles.plusBody}>{`The other ${total - freeTotal} are in Wasīla Plus.`}</Text>
          <Pressable style={styles.plusCta} onPress={() => navigation.navigate('Plus')}>
            <Text style={styles.plusCtaText}>See what Plus opens</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.card}>
        {([
          ...(premium
            ? [{ icon: 'credit-card-outline', label: 'Manage subscription', onPress: () => Linking.openURL(SUBSCRIPTIONS_URL) }]
            : []),
          { icon: 'bell-outline', label: 'Reminders & adhan', onPress: () => navigation.navigate('Settings') },
          ...(signedIn
            ? [
                { icon: 'logout', label: 'Sign out', onPress: () => signOut() },
                { icon: 'account-remove-outline', label: 'Delete account', onPress: confirmDelete, danger: true },
              ]
            : []),
        ] as { icon: string; label: string; value?: string; onPress?: () => void; danger?: boolean }[]).map((r, i, arr) => (
          <Pressable
            key={r.label}
            style={[styles.row, styles.listRow, i < arr.length - 1 && styles.rowBorder]}
            onPress={r.onPress}
            disabled={!r.onPress}
          >
            <Icon name={r.icon} set="community" size={18} color={r.danger ? colors.warmAccent : colors.textMuted} />
            <Text style={[styles.rowLabel, r.danger && { color: colors.warmAccent }]}>{r.label}</Text>
            <View style={{ flex: 1 }} />
            {r.value && <Text style={styles.rowValue}>{r.value}</Text>}
            <Icon name="chevron-right" set="community" size={18} color={colors.textFaint} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.iconChipBg,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.bold, fontSize: SIZE.heading, lineHeight: uiLeading(SIZE.heading), color: colors.accent },
  name: { ...serifHeading(SIZE.heading), color: colors.textPrimary },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: space.xxs, marginTop: 2 },
  planText: { fontFamily: fonts.semibold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textMuted },
  sectionTitle: eyebrow(colors.textMuted),
  card: { backgroundColor: colors.bgCard, borderRadius: radius.card, borderWidth: 1, borderColor: colors.outlineBorder, padding: space.sm + 2, gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  listRow: { paddingVertical: space.xs },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowLabel: { fontFamily: fonts.semibold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textPrimary, flexShrink: 1 },
  rowSub: { fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.textMuted, marginTop: 2 },
  rowValue: { fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.textMuted },
  statRow: { flexDirection: 'row', gap: space.sm },
  statTile: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { ...serifHeading(SIZE.heading), ...tabular, color: colors.textPrimary },
  statLabel: { fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.textFaint, textAlign: 'center' },
  caveat: { fontFamily: fonts.regular, fontSize: SIZE.caption, lineHeight: uiLeading(SIZE.caption), color: colors.textFaint },
  plusBlock: { backgroundColor: colors.amberCardBg, borderRadius: radius.card, padding: space.sm + 2, gap: space.xs },
  plusBody: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: bodyLeading(SIZE.body), color: colors.amberBody },
  plusCta: { alignSelf: 'flex-start', marginTop: space.xxs },
  plusCtaText: { fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.gold, textDecorationLine: 'underline' },
});
