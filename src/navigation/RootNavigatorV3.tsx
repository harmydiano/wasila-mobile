import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Welcome from '../screens/v3/Welcome';
import Restore from '../screens/v3/Restore';
import Home from '../screens/v3/Home';
import NeedsPicker from '../screens/v3/NeedsPicker';
import SignIn from '../screens/v3/SignIn';
import EmailEntry from '../screens/v3/EmailEntry';
import CodeEntry from '../screens/v3/CodeEntry';
import LinkExpired from '../screens/v3/LinkExpired';
import Profile from '../screens/v3/Profile';
import SignUpSheet from '../screens/v3/SignUpSheet';
import Plus from '../screens/v3/Plus';
import Library from '../screens/v3/Library';
import Settings from '../screens/v3/Settings';
import PrayerMethod from '../screens/v3/PrayerMethod';
import Category from '../screens/v3/Category';
import Benefit from '../screens/v3/Benefit';
import BenefitCounter from '../screens/v3/BenefitCounter';
import BenefitListen from '../screens/v3/Listen';
import BenefitSearch from '../screens/v3/BenefitSearch';
import QuranSearch from '../screens/v3/QuranSearch';
import QuranBookmarks from '../screens/v3/QuranBookmarks';
import Saved from '../screens/v3/Saved';
import ActivePractices from '../screens/v3/ActivePractices';
import Prayer from '../screens/v3/Prayer';
import Quran from '../screens/v3/Quran';
import Sura from '../screens/v3/Sura';
import Reciters from '../screens/v3/Reciters';
import NowPlaying from '../screens/v3/NowPlaying';
import More from '../screens/v3/More';
import Salawat from '../screens/v3/Salawat';
import SalawatDetail from '../screens/v3/SalawatDetail';
import Saints from '../screens/v3/Saints';
import SaintDetail from '../screens/v3/SaintDetail';
import Names99 from '../screens/v3/Names99';
import NameDetail from '../screens/v3/NameDetail';
import HijriCalendar from '../screens/v3/HijriCalendar';
import Salaats from '../screens/v3/Salaats';
import SalaatDetail from '../screens/v3/SalaatDetail';
import Zakat from '../screens/v3/Zakat';
import MoreCounter from '../screens/v3/MoreCounter';

import Tasbih from '../screens/v2/Tasbih';
import Zikr from '../screens/v2/Zikr';

import Needs from '../screens/Needs';
import ManageDownloads from '../screens/ManageDownloads';

import { colors } from '../theme/v3/colors';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigatorV3({
  initialRouteName,
}: {
  initialRouteName: 'Welcome' | 'Restore' | 'Home';
}) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgRoot },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Restore" component={Restore} options={{ animation: 'fade' }} />
      <Stack.Screen name="NeedsPicker" component={NeedsPicker} />
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="EmailEntry" component={EmailEntry} />
      <Stack.Screen name="CodeEntry" component={CodeEntry} />
      <Stack.Screen name="LinkExpired" component={LinkExpired} />
      <Stack.Screen name="Home" component={Home} options={{ animation: 'fade' }} />
      <Stack.Screen name="Library" component={Library} />
      <Stack.Screen name="Category" component={Category} />
      <Stack.Screen name="Benefit" component={Benefit} />
      <Stack.Screen
        name="BenefitCounter"
        component={BenefitCounter}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="BenefitListen"
        component={BenefitListen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="BenefitSearch" component={BenefitSearch} options={{ animation: 'fade' }} />
      <Stack.Screen name="Saved" component={Saved} />
      <Stack.Screen name="ActivePractices" component={ActivePractices} />
      <Stack.Screen name="Prayer" component={Prayer} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen
        name="SignUpSheet"
        component={SignUpSheet}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Plus"
        component={Plus}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="QuranSearch" component={QuranSearch} options={{ animation: 'fade' }} />
      <Stack.Screen name="QuranBookmarks" component={QuranBookmarks} />
      <Stack.Screen name="Quran" component={Quran} />
      <Stack.Screen name="Sura" component={Sura} />
      <Stack.Screen name="Reciters" component={Reciters} />
      <Stack.Screen
        name="NowPlaying"
        component={NowPlaying}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="More" component={More} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="PrayerMethod" component={PrayerMethod} />
      <Stack.Screen name="Salawat" component={Salawat} />
      <Stack.Screen name="SalawatDetail" component={SalawatDetail} />
      <Stack.Screen name="Saints" component={Saints} />
      <Stack.Screen name="SaintDetail" component={SaintDetail} />
      <Stack.Screen name="Names99" component={Names99} />
      <Stack.Screen name="NameDetail" component={NameDetail} />
      <Stack.Screen name="Salaats" component={Salaats} />
      <Stack.Screen name="SalaatDetail" component={SalaatDetail} />
      <Stack.Screen name="HijriCalendar" component={HijriCalendar} />
      <Stack.Screen name="Zakat" component={Zakat} />
      <Stack.Screen
        name="MoreCounter"
        component={MoreCounter}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Needs" component={Needs} />
      <Stack.Screen name="Tasbih" component={Tasbih} />
      <Stack.Screen name="Zikr" component={Zikr} />
      <Stack.Screen name="ManageDownloads" component={ManageDownloads} />
    </Stack.Navigator>
  );
}
