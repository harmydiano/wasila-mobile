const { withAndroidManifest } = require('expo/config-plugins');

const SCHEDULE_EXACT_ALARM = 'android.permission.SCHEDULE_EXACT_ALARM';
const USE_EXACT_ALARM = 'android.permission.USE_EXACT_ALARM';
const IGNORE_BATTERY_OPTIMIZATIONS =
  'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS';
const FIREBASE_PROVIDER = 'com.google.firebase.provider.FirebaseInitProvider';

function applyPrayerNotificationManifest(manifest) {
  const root = manifest.manifest;

  root.$ = root.$ || {};
  root.$['xmlns:tools'] = 'http://schemas.android.com/tools';

  root['uses-permission'] = root['uses-permission'] || [];
  const addPermission = (name, extraAttrs) => {
    const existing = root['uses-permission'].find(
      (p) => p.$ && p.$['android:name'] === name
    );
    const attrs = { 'android:name': name, ...extraAttrs };
    if (existing) {
      existing.$ = { ...existing.$, ...attrs };
    } else {
      root['uses-permission'].push({ $: attrs });
    }
  };
  addPermission(SCHEDULE_EXACT_ALARM, { 'android:maxSdkVersion': '32' });
  addPermission(USE_EXACT_ALARM);

  addPermission(IGNORE_BATTERY_OPTIMIZATIONS);

  const application = root.application && root.application[0];
  if (!application) {
    throw new Error(
      'withPrayerNotificationManifest: no <application> in AndroidManifest — cannot remove FirebaseInitProvider.'
    );
  }
  application.provider = application.provider || [];
  const attrs = {
    'android:name': FIREBASE_PROVIDER,
    'android:authorities': '${applicationId}.firebaseinitprovider',
    'tools:node': 'remove',
  };
  const existing = application.provider.find(
    (p) => p.$ && p.$['android:name'] === FIREBASE_PROVIDER
  );
  if (existing) {
    existing.$ = { ...existing.$, ...attrs };
  } else {
    application.provider.push({ $: attrs });
  }

  return manifest;
}

const withPrayerNotificationManifest = (config) =>
  withAndroidManifest(config, (config) => {
    applyPrayerNotificationManifest(config.modResults);
    return config;
  });

module.exports = withPrayerNotificationManifest;
module.exports.applyPrayerNotificationManifest = applyPrayerNotificationManifest;
