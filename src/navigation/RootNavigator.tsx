import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Intro from '../screens/Intro';
import Onboarding from '../screens/Onboarding';
import Home from '../screens/Home';
import Library from '../screens/Library';
import Category from '../screens/Category';
import DuaDetail from '../screens/DuaDetail';
import Prayer from '../screens/Prayer';
import Profile from '../screens/Profile';
import Search from '../screens/Search';
import Bookmarks from '../screens/Bookmarks';
import Quran from '../screens/Quran';
import Sura from '../screens/Sura';
import More from '../screens/More';
import Settings from '../screens/Settings';
import Names from '../screens/Names';
import Needs from '../screens/Needs';
import Tasbih from '../screens/Tasbih';
import Zikr from '../screens/Zikr';
import Auth from '../screens/Auth';
import ManageDownloads from '../screens/ManageDownloads';
import { colors } from '../theme/colors';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator({ initialRouteName }: { initialRouteName: 'Intro' | 'Home' }) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgRoot },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Intro" component={Intro} />
      <Stack.Screen name="Onboarding" component={Onboarding} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Library" component={Library} />
      <Stack.Screen name="Category" component={Category} />
      <Stack.Screen name="DuaDetail" component={DuaDetail} />
      <Stack.Screen name="Prayer" component={Prayer} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="Bookmarks" component={Bookmarks} />
      <Stack.Screen name="Quran" component={Quran} />
      <Stack.Screen name="Sura" component={Sura} />
      <Stack.Screen name="More" component={More} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Names" component={Names} />
      <Stack.Screen name="Needs" component={Needs} />
      <Stack.Screen name="Tasbih" component={Tasbih} />
      <Stack.Screen name="Zikr" component={Zikr} />
      <Stack.Screen name="Auth" component={Auth} />
      <Stack.Screen name="ManageDownloads" component={ManageDownloads} />
    </Stack.Navigator>
  );
}
