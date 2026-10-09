const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withFixAndroidNotificationSounds = (config) => {
  return withDangerousMod(config, [
    'android',
    (config) => {
      const rawDir = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/res/raw'
      );
      if (fs.existsSync(rawDir)) {
        for (const file of fs.readdirSync(rawDir)) {
          if (file.toLowerCase().endsWith('.caf')) {
            fs.unlinkSync(path.join(rawDir, file));
          }
        }
      }
      return config;
    },
  ]);
};

module.exports = withFixAndroidNotificationSounds;
