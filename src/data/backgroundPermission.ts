import { Platform, Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants from 'expo-constants';

const PKG =
  Constants.expoConfig?.android?.package ?? 'com.anonymous.wasilaapp';

export async function openBatteryExemptionRequest(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    await IntentLauncher.startActivityAsync(
      'android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
      { data: `package:${PKG}` }
    );
    return true;
  } catch {
    return openAppSettings();
  }
}

const AUTOSTART_COMPONENTS: string[] = [
  'com.coloros.safecenter/com.coloros.safecenter.permission.startup.StartupAppListActivity',
  'com.coloros.safecenter/com.coloros.safecenter.startupapp.StartupAppListActivity',
  'com.oppo.safe/com.oppo.safe.permission.startup.StartupAppListActivity',
  'com.transsion.phonemaster/com.cyin.himgr.autostart.AutoStartActivity',
  'com.transsion.smartpanel/com.transsion.smartpanel.AutoStartActivity',
  'com.miui.securitycenter/com.miui.permcenter.autostart.AutoStartManagementActivity',
  'com.vivo.permissionmanager/com.vivo.permissionmanager.activity.BgStartUpManagerActivity',
  'com.huawei.systemmanager/com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity',
];

export async function openAutoStartSettings(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  for (const component of AUTOSTART_COMPONENTS) {
    const [packageName, className] = component.split('/');
    try {
      await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
        packageName,
        className,
      });
      return true;
    } catch {
    }
  }
  return openAppSettings();
}

export async function openAppSettings(): Promise<boolean> {
  try {
    await Linking.openSettings();
    return true;
  } catch {
    return false;
  }
}

export const needsBackgroundGrant = Platform.OS === 'android';
