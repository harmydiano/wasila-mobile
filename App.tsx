import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { setAudioModeAsync } from 'expo-audio';
import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_800ExtraBold } from '@expo-google-fonts/inter/800ExtraBold';
import { ScheherazadeNew_400Regular } from '@expo-google-fonts/scheherazade-new/400Regular';
import { Literata_500Medium } from '@expo-google-fonts/literata/500Medium';
import { Literata_600SemiBold } from '@expo-google-fonts/literata/600SemiBold';
import { Literata_700Bold } from '@expo-google-fonts/literata/700Bold';
import { Amiri_700Bold } from '@expo-google-fonts/amiri/700Bold';

import RootNavigator from './src/navigation/RootNavigator';
import RootNavigatorV2 from './src/navigation/RootNavigatorV2';
import RootNavigatorV3 from './src/navigation/RootNavigatorV3';
import { navigationRef } from './src/navigation/navigationRef';
import { AppStateProvider } from './src/state/AppState';
import { QuranAudioProvider } from './src/state/QuranAudio';
import { PrayerProvider } from './src/state/usePrayer';
import { UiVersionProvider, useUiVersion } from './src/state/UiVersion';
import PaywallSheet from './src/components/PaywallSheet';
import PaywallSheetV2 from './src/components/v2/PaywallSheet';
import WelcomeGiftModal from './src/components/WelcomeGiftModal';
import MiniPlayer from './src/components/MiniPlayer';
import Icon from './src/components/Icon';
import Splash from './src/screens/v3/Splash';
import { colors } from './src/theme/colors';
import { fonts } from './src/theme/type';
import { preloadReferenceData, warmAllVerses, stopVerseWarm } from './src/data/db';
import { hasCompletedOnboarding, getUiVersion, getJSON, KEYS, type UiVersion } from './src/data/prefs';
import { hasLiveWindow } from './src/utils/practice';
import { ensureCatalogue } from './src/data/remoteBenefits';

function LaunchMark({ v2 = false }: { v2?: boolean }) {
  const entrance = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 480,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: true,
    }).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    });
  }, [entrance, pulse]);

  const scale = Animated.multiply(
    entrance.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
    pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] })
  );

  if (!v2) {
    return (
      <Animated.View style={{ opacity: entrance, transform: [{ scale }] }}>
        <Icon name="mosque" size={64} color={colors.accent} />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ opacity: entrance, transform: [{ scale }], alignItems: 'center', gap: 14 }}>
      <View style={{ width: 140, height: 140, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: colors.mint, opacity: 0.05 }} />
        <View style={{ position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: colors.mint, opacity: 0.08 }} />
        <Icon name="mosque" size={56} color={colors.accent} />
      </View>
      <View style={{ width: 6, height: 6, backgroundColor: colors.mint, opacity: 0.6, transform: [{ rotate: '45deg' }] }} />
      <Text style={{ fontFamily: fonts.extrabold, fontSize: 22, color: colors.textPrimary, letterSpacing: 0.5 }}>Wasīla</Text>
    </Animated.View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    ScheherazadeNew_400Regular,
    Literata_500Medium,
    Literata_600SemiBold,
    Literata_700Bold,
    Amiri_700Bold,
  });

  const [dataReady, setDataReady] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [catalogueReady, setCatalogueReady] = useState<boolean | null>(null);
  const [catalogueAttempt, setCatalogueAttempt] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [slow, setSlow] = useState(false);

  const [startRoute, setStartRoute] = useState<'Intro' | 'Welcome' | 'Restore' | 'Home' | null>(null);

  const [startVersion, setStartVersion] = useState<UiVersion | null>(null);

  const [routeName, setRouteName] = useState<string | undefined>(undefined);

  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    getUiVersion()
      .then((v) => alive && setStartVersion(v))
      .catch(() => alive && setStartVersion('v3'));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoadError(null);
    setSlow(false);

    const slowTimer = setTimeout(() => alive && setSlow(true), 8000);

    Promise.all([
      preloadReferenceData(),
      hasCompletedOnboarding(),
      getUiVersion(),
      getJSON<{ startedDateKey: string; totalNights: number } | null>(KEYS.practice, null),
    ])
      .then(([, onboarded, uiVersion, practice]) => {
        if (!alive) return;
        if (uiVersion === 'v3') {
          setStartRoute(hasLiveWindow(practice) ? 'Restore' : onboarded ? 'Home' : 'Welcome');
        } else {
          setStartRoute(onboarded ? 'Home' : 'Intro');
        }
        setDataReady(true);
        warmAllVerses();
      })
      .catch((err: Error) => {
        if (!alive) return;
        console.error('[wasila] reference data preload failed:', err);
        setLoadError(err);
      });

    return () => {
      alive = false;
      clearTimeout(slowTimer);
      stopVerseWarm();
    };
  }, [attempt]);

  useEffect(() => {
    let alive = true;
    setCatalogueReady(null);
    ensureCatalogue().then((ok) => alive && setCatalogueReady(ok));
    return () => {
      alive = false;
    };
  }, [catalogueAttempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  if (loadError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgRoot, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 16, textAlign: 'center' }}>Couldn’t load the Quran database</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{String(loadError?.message ?? loadError)}</Text>
        <Pressable onPress={retry} style={{ marginTop: 8, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 999, backgroundColor: colors.mint }}>
          <Text style={{ color: colors.onMintText, fontWeight: '700' }}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (catalogueReady === false && fontsLoaded) {
    return <Splash key="offline" progress={0} onRetry={() => setCatalogueAttempt((a) => a + 1)} />;
  }

  if (!fontsLoaded || !dataReady || !catalogueReady || !startRoute || !startVersion || !minTimeElapsed) {
    if (startVersion === null || startVersion === 'v3') {
      const loadProgress = [fontsLoaded, dataReady, !!catalogueReady, minTimeElapsed].filter(Boolean).length / 4;
      return <Splash key={fontsLoaded ? 'fonts' : 'nofonts'} progress={loadProgress} />;
    }
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgRoot, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 }}>
        <LaunchMark v2={startVersion === 'v2'} />
        {slow && (
          <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>
            {!fontsLoaded ? 'Still loading fonts…' : 'Still loading the Quran database…'}
          </Text>
        )}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppStateProvider>
          <QuranAudioProvider>
            <PrayerProvider>
              <UiVersionProvider initial={startVersion}>
                <NavigationContainer
                  ref={navigationRef}
                  onReady={() => setRouteName(navigationRef.getCurrentRoute()?.name)}
                  onStateChange={() => setRouteName(navigationRef.getCurrentRoute()?.name)}
                >
                  <StatusBar style="light" />
                  <AppShell startRoute={startRoute} routeName={routeName} />
                </NavigationContainer>
              </UiVersionProvider>
            </PrayerProvider>
          </QuranAudioProvider>
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppShell({ startRoute, routeName }: { startRoute: 'Intro' | 'Welcome' | 'Restore' | 'Home'; routeName?: string }) {
  const { uiVersion } = useUiVersion();
  const hidePlayer =
    routeName === 'Sura' ||
    routeName === 'NowPlaying' ||
    routeName === 'Intro' ||
    routeName === 'Onboarding' ||
    routeName === 'Welcome' ||
    routeName === 'Restore' ||
    routeName === 'NeedsPicker';
  if (uiVersion === 'v3') {
    return (
      <>
        <RootNavigatorV3 initialRouteName={startRoute === 'Intro' ? 'Welcome' : startRoute} />
        <MiniPlayer hidden={hidePlayer} />
        <PaywallSheetV2 />
        <WelcomeGiftModal />
      </>
    );
  }
  if (uiVersion === 'v2') {
    return (
      <>
        <RootNavigatorV2 initialRouteName={startRoute === 'Home' ? 'Home' : 'Intro'} />
        <MiniPlayer hidden={hidePlayer} />
        <PaywallSheetV2 />
        <WelcomeGiftModal />
      </>
    );
  }
  return (
    <>
      <RootNavigator initialRouteName={startRoute === 'Home' ? 'Home' : 'Intro'} />
      <MiniPlayer hidden={hidePlayer} />
      <PaywallSheet />
      <WelcomeGiftModal />
    </>
  );
}
