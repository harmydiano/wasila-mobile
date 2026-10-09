import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import Button from '../components/Button';
import { colors } from '../theme/colors';
import { fonts } from '../theme/type';
import { useAppState } from '../state/AppState';

const SYNC_ITEMS = ['Counts and streaks', 'Saved benefits', 'Your personal zikr', 'Prayer log and reminders'];

export default function Auth({ navigation }: any) {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAppState();

  const submit = () => {
    signIn(name || 'Ibrahim Bello', email || 'you@example.com');
    navigation.navigate('Profile');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.closeRow}>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => navigation.navigate('Profile')} style={styles.iconBtn}>
          <Icon name="close" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 24, gap: 20 }}>
        <View>
          <Text style={styles.logotype}>وَسِيلَة</Text>
          <Text style={styles.title}>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</Text>
          <Text style={styles.sub}>Sync your counts, streaks and saved benefits across devices.</Text>
        </View>

        <View style={{ gap: 12 }}>
          {mode === 'signup' && (
            <View>
              <Text style={styles.label}>Name</Text>
              <TextInput style={styles.input} placeholder="Ibrahim Bello" placeholderTextColor={colors.textFaint} value={name} onChangeText={setName} />
            </View>
          )}
          <View>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor={colors.textFaint} value={email} onChangeText={setEmail} autoCapitalize="none" />
          </View>
          <View>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} placeholder="At least 8 characters" placeholderTextColor={colors.textFaint} value={password} onChangeText={setPassword} secureTextEntry />
          </View>
        </View>

        <Button label={mode === 'signup' ? 'Create account' : 'Sign in'} onPress={submit} />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button label="Continue with Google" variant="outline" onPress={submit} />
        <Button label="Continue with Apple" variant="outline" onPress={submit} />

        <View style={styles.syncCard}>
          <Text style={styles.syncTitle}>What syncs to your account</Text>
          {SYNC_ITEMS.map((s) => (
            <View key={s} style={styles.syncRow}>
              <Icon name="check" size={16} color={colors.accent} />
              <Text style={styles.syncText}>{s}</Text>
            </View>
          ))}
        </View>

        <Pressable onPress={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
          <Text style={styles.toggleLink}>
            {mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </Text>
        </Pressable>

        <Text style={styles.legal}>By continuing you agree to the terms and the privacy policy.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  closeRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  logotype: { fontFamily: fonts.arabic, fontSize: 34, color: colors.mint },
  title: { fontFamily: fonts.extrabold, fontSize: 22, color: colors.textPrimary, marginTop: 12 },
  sub: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textMuted, marginTop: 6 },
  label: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.textMuted, marginBottom: 6 },
  input: { backgroundColor: colors.bgInput, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 16, fontFamily: fonts.regular, fontSize: 14, color: colors.textPrimary },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.divider },
  dividerText: { fontFamily: fonts.semibold, fontSize: 11, color: colors.textFaint },
  syncCard: { backgroundColor: colors.bgInput, borderRadius: 16, padding: 16, gap: 10 },
  syncTitle: { fontFamily: fonts.bold, fontSize: 13, color: colors.textPrimary, marginBottom: 2 },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  syncText: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textSecondary },
  toggleLink: { fontFamily: fonts.bold, fontSize: 13, color: colors.accent, textAlign: 'center' },
  legal: { fontFamily: fonts.regular, fontSize: 11, color: colors.textFaint, textAlign: 'center' },
});
